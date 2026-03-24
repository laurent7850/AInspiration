import React from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import DashboardView from '../components/crm/DashboardView';
import CrmLayout from '../components/crm/CrmLayout';

const CrmDashboardPage: React.FC = () => {
  const { t } = useTranslation('crm');
  return (
    <CrmLayout>
      <div className="bg-gray-50 min-h-screen">
        <SEOHead
          title={t('dashboardView.title') + ' | AInspiration'}
          description={t('dashboardView.subtitle')}
        />

        <section className="py-6 md:py-10">
          <div className="container mx-auto px-4">
            <DashboardView />
          </div>
        </section>
      </div>
    </CrmLayout>
  );
};

export default CrmDashboardPage;
