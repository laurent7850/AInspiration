import React, { useState, useEffect } from 'react';
import { Mail, Clock, Building, Trash2, Eye, CheckCircle, MessageSquare, Archive } from 'lucide-react';
import type { ContactMessage } from '../../utils/types';
import { contactMessageService } from '../../services/contactMessageService';

interface ContactMessagesListProps {
  onSelectMessage: (message: ContactMessage) => void;
  selectedId?: string;
}

export default function ContactMessagesList({ onSelectMessage, selectedId }: ContactMessagesListProps) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    archived: 0
  });

  useEffect(() => {
    loadMessages();
    loadStats();
  }, [filter]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await contactMessageService.getAll(filter);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await contactMessageService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      try {
        await contactMessageService.delete(id);
        loadMessages();
        loadStats();
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-gray-100 text-gray-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'Nouveau';
      case 'read':
        return 'Lu';
      case 'replied':
        return 'Répondu';
      case 'archived':
        return 'Archivé';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages de contact</h2>

        <div className="grid grid-cols-5 gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({stats.total})
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'new'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Nouveaux ({stats.new})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'read'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lus ({stats.read})
          </button>
          <button
            onClick={() => setFilter('replied')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'replied'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Répondus ({stats.replied})
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'archived'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Archivés ({stats.archived})
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Chargement...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Mail className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p>Aucun message</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              onClick={() => onSelectMessage(message)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedId === message.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-sm font-semibold ${message.status === 'new' ? 'text-gray-900' : 'text-gray-600'}`}>
                      {message.name}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(message.status)}`}>
                      {getStatusLabel(message.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{message.email}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Building className="h-3 w-3" />
                    <span>{message.company}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(message.id, e)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm font-medium text-gray-700 mb-1">
                {message.subject}
              </p>

              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {message.message}
              </p>

              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatDate(message.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
