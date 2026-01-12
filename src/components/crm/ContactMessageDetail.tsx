import React, { useEffect } from 'react';
import { Mail, Building, Calendar, Tag, ArrowLeft } from 'lucide-react';
import type { ContactMessage } from '../../utils/types';
import { contactMessageService } from '../../services/contactMessageService';

interface ContactMessageDetailProps {
  message: ContactMessage;
  onBack: () => void;
  onStatusChange: () => void;
}

export default function ContactMessageDetail({ message, onBack, onStatusChange }: ContactMessageDetailProps) {
  useEffect(() => {
    if (message.status === 'new') {
      contactMessageService.updateStatus(message.id, 'read').then(() => {
        onStatusChange();
      });
    }
  }, [message.id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await contactMessageService.updateStatus(message.id, newStatus);
      onStatusChange();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour à la liste
        </button>

        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{message.name}</h2>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline">
                  {message.email}
                </a>
              </div>
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                <span>{message.company}</span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(message.status)}`}>
            {getStatusLabel(message.status)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Reçu le {formatDate(message.created_at)}</span>
          </div>
          {message.updated_at !== message.created_at && (
            <div className="flex items-center">
              <span>Mis à jour le {formatDate(message.updated_at)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center mb-4">
          <Tag className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{message.subject}</span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Message</h3>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusChange('read')}
              disabled={message.status === 'read'}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Marquer comme lu
            </button>
            <button
              onClick={() => handleStatusChange('replied')}
              disabled={message.status === 'replied'}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Marquer comme répondu
            </button>
            <button
              onClick={() => handleStatusChange('archived')}
              disabled={message.status === 'archived'}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Archiver
            </button>
            <a
              href={`mailto:${message.email}?subject=Re: ${message.subject}`}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Répondre par email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
