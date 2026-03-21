import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PrivateRoute from '../components/PrivateRoute';
import CrmLayout from '../components/crm/CrmLayout';
import ContactMessagesList from '../components/crm/ContactMessagesList';
import ContactMessageDetail from '../components/crm/ContactMessageDetail';
import SEOHead from '../components/SEOHead';
import type { ContactMessage } from '../utils/types';

export default function MessagesPage() {
  const { t } = useTranslation('crm');
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
    <PrivateRoute>
      <CrmLayout>
        <SEOHead
          title="Messages | AInspiration CRM"
          description="Gestion des messages de contact - Espace CRM AInspiration"
          noindex={true}
        />
        <section className="py-10 bg-gray-50 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('pages.messages.heading')}
              </h1>
              <p className="text-gray-600">
                {t('pages.messages.description')}
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
                    <p className="text-lg">{t('pages.messages.selectMessage')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </CrmLayout>
    </PrivateRoute>
  );
}
