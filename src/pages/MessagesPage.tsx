import React, { useState } from 'react';
import ContactMessagesList from '../components/crm/ContactMessagesList';
import ContactMessageDetail from '../components/crm/ContactMessageDetail';
import type { ContactMessage } from '../utils/types';

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
  };

  const handleBack = () => {
    setSelectedMessage(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleStatusChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Messages de contact
          </h1>
          <p className="text-gray-600">
            Gérez les messages reçus via le formulaire de contact
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div key={refreshKey}>
            <ContactMessagesList
              onSelectMessage={handleSelectMessage}
              selectedId={selectedMessage?.id}
            />
          </div>

          <div>
            {selectedMessage ? (
              <ContactMessageDetail
                message={selectedMessage}
                onBack={handleBack}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                <p className="text-lg">Sélectionnez un message pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
