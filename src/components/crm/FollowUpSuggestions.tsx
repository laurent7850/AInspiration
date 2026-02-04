import React, { useState, useEffect } from 'react';
import {
  Bell,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  RefreshCw,
  Copy,
  CheckCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import { Contact, Opportunity, Task, Activity } from '../../utils/types';
import { getFollowUpSuggestions, FollowUpSuggestion } from '../../services/n8nService';
import { generateFollowUpEmail } from '../../services/openRouterService';

interface FollowUpSuggestionsProps {
  contacts: Contact[];
  opportunities: Opportunity[];
  tasks: Task[];
  activities: Activity[];
  onCreateTask?: (suggestion: FollowUpSuggestion) => void;
  onContactClick?: (contactId: string) => void;
}

const FollowUpSuggestions: React.FC<FollowUpSuggestionsProps> = ({
  contacts,
  opportunities,
  tasks,
  activities,
  onCreateTask,
  onContactClick
}) => {
  const [suggestions, setSuggestions] = useState<FollowUpSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<FollowUpSuggestion | null>(null);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const loadSuggestions = async () => {
      setLoading(true);
      try {
        const data = await getFollowUpSuggestions(contacts, opportunities, tasks, activities);
        setSuggestions(data);
      } catch (error) {
        console.error('Erreur chargement suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (contacts.length > 0) {
      loadSuggestions();
    } else {
      setLoading(false);
    }
  }, [contacts, opportunities, tasks, activities]);

  const getPriorityColor = (priority: FollowUpSuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getPriorityBadge = (priority: FollowUpSuggestion['priority']) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-orange-100 text-orange-800',
      low: 'bg-blue-100 text-blue-800'
    };
    const labels = {
      high: 'Urgent',
      medium: 'Important',
      low: 'Normal'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  const getActionIcon = (action: string) => {
    if (action.toLowerCase().includes('appel')) return <Phone className="w-4 h-4" />;
    if (action.toLowerCase().includes('email')) return <Mail className="w-4 h-4" />;
    return <MessageSquare className="w-4 h-4" />;
  };

  const handleGenerateEmail = async (suggestion: FollowUpSuggestion) => {
    setSelectedSuggestion(suggestion);
    setGeneratingEmail(true);
    setGeneratedEmail(null);

    const contact = contacts.find(c => c.id === suggestion.contactId);
    const contactOpp = opportunities.find(o => o.contact_id === suggestion.contactId);

    try {
      const email = await generateFollowUpEmail(
        contact?.first_name || suggestion.contactName,
        {
          opportunityName: contactOpp?.name,
          stage: contactOpp?.stage,
          customContext: suggestion.reason
        }
      );

      if (email) {
        setGeneratedEmail(email);
      } else if (suggestion.template) {
        setGeneratedEmail(suggestion.template);
      }
    } catch (error) {
      console.error('Erreur génération email:', error);
      if (suggestion.template) {
        setGeneratedEmail(suggestion.template);
      }
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleCopyEmail = (text: string, suggestionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(suggestionId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Demain';
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="w-6 h-6 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Suggestions de relance IA</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="ml-3 text-gray-500">Analyse des contacts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-6 h-6 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Suggestions de relance IA</h2>
        </div>
        <span className="text-sm text-gray-500">{suggestions.length} suggestion(s)</span>
      </div>

      {suggestions.length > 0 ? (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div
              key={`${suggestion.contactId}-${suggestion.suggestedDate}`}
              className={`border-l-4 rounded-lg p-4 ${getPriorityColor(suggestion.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <button
                      onClick={() => onContactClick?.(suggestion.contactId)}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {suggestion.contactName}
                    </button>
                    {getPriorityBadge(suggestion.priority)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{suggestion.reason}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      {getActionIcon(suggestion.suggestedAction)}
                      <span className="ml-1">{suggestion.suggestedAction}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(suggestion.suggestedDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => handleGenerateEmail(suggestion)}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Email IA
                  </button>
                  {onCreateTask && (
                    <button
                      onClick={() => onCreateTask(suggestion)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Créer tâche
                    </button>
                  )}
                </div>
              </div>

              {/* Email template / generated email */}
              {selectedSuggestion?.contactId === suggestion.contactId && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {generatingEmail ? (
                    <div className="flex items-center justify-center py-4">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                      <span className="ml-2 text-sm text-gray-500">Génération de l'email...</span>
                    </div>
                  ) : generatedEmail ? (
                    <div className="relative">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                        {generatedEmail}
                      </div>
                      <button
                        onClick={() => handleCopyEmail(generatedEmail, suggestion.contactId)}
                        className="absolute top-2 right-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Copier l'email"
                      >
                        {copiedId === suggestion.contactId ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  ) : suggestion.template ? (
                    <div className="relative">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                        {suggestion.template}
                      </div>
                      <button
                        onClick={() => handleCopyEmail(suggestion.template!, suggestion.contactId)}
                        className="absolute top-2 right-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Copier l'email"
                      >
                        {copiedId === suggestion.contactId ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50 text-green-500" />
          <p>Tous les contacts sont à jour !</p>
          <p className="text-sm mt-1">Aucune relance suggérée pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default FollowUpSuggestions;
