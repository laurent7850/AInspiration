import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  X, 
  MinusCircle, 
  Bot,
  AlertTriangle,
  Loader2,
  Volume2
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ActionButton {
  type: 'link' | 'action';
  label: string;
  url?: string;
  action?: string;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  audioUrl?: string;
  audioBase64?: string;
  actionButtons?: ActionButton[];
}

// N8n webhook URL - Mode production
const N8N_WEBHOOK_URL = "https://n8n.srv767464.hstgr.cloud/webhook/ainspiration";

export default function ChatbotN8n() {
  // Session management
  const [sessionId, setSessionId] = useState<string>('');
  
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Initialize session ID on first render
  useEffect(() => {
    // Try to get session ID from localStorage
    const storedSessionId = localStorage.getItem('chatSessionId');
    
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      localStorage.setItem('chatSessionId', newSessionId);
    }

    // Get TTS preference
    const ttsPref = localStorage.getItem('ttsEnabled');
    setIsTtsEnabled(ttsPref === 'true');
    
    // Add welcome message
    const welcomeMessage: Message = {
      id: uuidv4(),
      text: "Salut ! Tu cherches à automatiser certaines tâches, améliorer ta gestion client, ou explorer ce que l'IA peut faire pour toi ?",
      isBot: true,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  }, []);
  
  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);
  
  // Fix for iOS Safari 100vh issue
  useEffect(() => {
    const handleResize = () => {
      // Fix for iOS Safari 100vh issue
      document.documentElement.style.setProperty(
        '--vh', 
        `${window.innerHeight * 0.01}px`
      );
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Toggle text-to-speech
  const toggleTts = () => {
    const newValue = !isTtsEnabled;
    setIsTtsEnabled(newValue);
    localStorage.setItem('ttsEnabled', newValue.toString());
  };
  
  // Handle user message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message
    const userMessageId = uuidv4();
    const userMessage: Message = {
      id: userMessageId,
      text: message,
      isBot: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    setError(null);
    
    // Start timeout for 30 seconds
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setError("La requête a pris trop de temps. Veuillez réessayer.");
    }, 30000);
    
    try {
      // Prepare data for n8n webhook
      const webhookData = {
        chatInput: message,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
        ttsEnabled: isTtsEnabled // Informer n8n si TTS est activé
      };

      // Send data to n8n webhook
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });
      
      // Clear timeout since we got a response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (!response.ok) {
        throw new Error(`Erreur lors de l'envoi du message: ${response.status}`);
      }
      
      const responseData = await response.json();
      const botMessageText = responseData.message || "Je n'ai pas pu traiter votre demande pour le moment. Veuillez réessayer plus tard.";
      
      // Récupérer les données audio depuis la réponse n8n
      const audioUrl = responseData.audioUrl;
      const audioBase64 = responseData.audioBase64;
      const actionButtons = responseData.action_buttons;

      console.log("Audio URL received:", audioUrl);
      console.log("Action buttons received:", actionButtons);

      // Add bot response
      const botMessage: Message = {
        id: uuidv4(),
        text: botMessageText,
        isBot: true,
        timestamp: new Date(),
        audioUrl,
        audioBase64,
        actionButtons
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Play audio if available and TTS is enabled
      if (isTtsEnabled && (audioBase64 || audioUrl)) {
        playAudio(audioBase64 || audioUrl);
      }
      
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      
      // Handle error states
      let errorMessage = "Un problème est survenu. Veuillez réessayer plus tard.";
      if (err instanceof Error) {
        if (err.message.includes('NetworkError') || err.message.includes('network')) {
          errorMessage = "Problème de connexion. Vérifiez votre connexion internet.";
        } else if (err.message.includes('timed out') || err.message.includes('timeout')) {
          errorMessage = "La requête a pris trop de temps. Veuillez réessayer.";
        } else {
          errorMessage = `Erreur: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      
      // Add error message as bot
      const errorMsg: Message = {
        id: uuidv4(),
        text: errorMessage,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Focus on input after sending message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Play audio for a message
  const playMessageAudio = (message: Message) => {
    if (isPlaying) return;
    
    if (message.audioBase64 || message.audioUrl) {
      playAudio(message.audioBase64 || message.audioUrl);
    }
  };

  // Helper function to play audio
  const playAudio = (audioData?: string) => {
    if (!audioData) {
      console.error("No audio data provided");
      return;
    }
    
    setIsPlaying(true);
    
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    console.log("Attempting to play audio:", audioData);
    
    const audio = new Audio(audioData);
    audioRef.current = audio;
    
    audio.onended = () => {
      console.log("Audio playback ended");
      setIsPlaying(false);
      audioRef.current = null;
    };
    
    audio.onerror = (e) => {
      console.error("Error playing audio:", e);
      setIsPlaying(false);
      audioRef.current = null;
    };
    
    audio.play().catch(err => {
      console.error("Failed to play audio:", err);
      setIsPlaying(false);
      audioRef.current = null;
    });
  };
  
  const renderMessages = () => {
    return messages.map((msg) => (
      <div
        key={msg.id}
        className={`mb-4 flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
      >
        <div
          className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-lg ${
            msg.isBot
              ? 'bg-gray-100 text-gray-800'
              : 'bg-indigo-600 text-white'
          }`}
        >
          {msg.text.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < msg.text.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}

          {/* Action buttons */}
          {msg.isBot && msg.actionButtons && msg.actionButtons.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {msg.actionButtons.map((btn, idx) => {
                const isInternal = btn.url?.startsWith('/') || btn.url?.startsWith('#');
                return isInternal ? (
                  <button
                    key={idx}
                    onClick={() => {
                      if (btn.url?.startsWith('#')) {
                        // Scroll to anchor on current page
                        const element = document.querySelector(btn.url);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      } else {
                        // Navigate to internal page
                        window.location.href = btn.url || '/';
                      }
                    }}
                    className="inline-block px-2.5 py-1 bg-indigo-600 text-white text-xs rounded-full hover:bg-indigo-700 transition-colors text-center truncate max-w-full"
                  >
                    {btn.label}
                  </button>
                ) : (
                  <a
                    key={idx}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-2.5 py-1 bg-indigo-600 text-white text-xs rounded-full hover:bg-indigo-700 transition-colors text-center truncate max-w-full"
                  >
                    {btn.label}
                  </a>
                );
              })}
            </div>
          )}

          <div className={`flex justify-between items-center mt-1 text-xs ${msg.isBot ? 'text-gray-500' : 'text-indigo-100'}`}>
            <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {msg.isBot && (isTtsEnabled || msg.audioBase64 || msg.audioUrl) && (
              <button
                onClick={() => playMessageAudio(msg)}
                disabled={isPlaying}
                className={`p-1 rounded-full hover:bg-gray-200 transition-colors ${isPlaying ? 'opacity-50' : ''}`}
                title="Écouter le message"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    ));
  };

  const handleChatToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsMinimized(false); // Reset minimized state when closing
    } else {
      setIsOpen(true);
    }
  };

  // Dedicated button component with better touch target
  const ChatButton = () => (
    <button
      onClick={handleChatToggle}
      className="fixed bottom-4 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-50 w-14 h-14 flex items-center justify-center touch-manipulation"
      aria-label={isOpen ? "Fermer le chat" : "Ouvrir le chat"}
    >
      <MessageSquare className="w-6 h-6" />
    </button>
  );

  if (!isOpen) {
    return <ChatButton />;
  }

  return (
    <div
      className={`fixed bottom-0 right-0 z-50 transition-all duration-300 sm:bottom-4 sm:right-4 ${
        isMinimized ? 'h-14 w-56' : 'h-[60vh] sm:h-[400px] w-full sm:w-[320px] max-h-[500px]'
      }`}
    >
      <div className={`bg-white rounded-t-lg sm:rounded-lg shadow-2xl flex flex-col h-full max-h-full overflow-hidden ${
        isMinimized ? 'rounded-b-lg' : ''
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-sm sm:text-base">
              Marc - Assistant AInspiration
            </span>
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleTts}
              className={`text-gray-500 hover:text-gray-700 p-2 ${isTtsEnabled ? 'text-indigo-600' : ''}`}
              aria-label={isTtsEnabled ? "Désactiver la synthèse vocale" : "Activer la synthèse vocale"}
              title={isTtsEnabled ? "Désactiver la synthèse vocale" : "Activer la synthèse vocale"}
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-500 hover:text-gray-700 p-2"
              aria-label={isMinimized ? "Agrandir" : "Minimiser"}
              title={isMinimized ? "Agrandir" : "Minimiser"}
            >
              <MinusCircle className="w-5 h-5" />
            </button>
            <button
              onClick={handleChatToggle}
              className="text-gray-500 hover:text-gray-700 p-2"
              aria-label="Fermer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="p-4 flex-1 overflow-y-auto">
              {renderMessages()}
              {error && (
                <div className="flex items-center gap-2 text-red-500 p-2 bg-red-50 rounded-lg my-2">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              {isLoading && (
                <div className="flex justify-center my-4">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 p-2 sm:p-2.5 border rounded-lg focus:outline-none focus:border-indigo-500 text-base"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className={`bg-indigo-600 text-white p-2.5 rounded-lg transition-colors flex-shrink-0 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                  }`}
                  aria-label="Envoyer"
                  disabled={isLoading}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}