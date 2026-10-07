import React from 'react';
import SEOHead from '../components/SEOHead';
import DashboardView from '../components/crm/DashboardView';
import CrmLayout from '../components/crm/CrmLayout';

const CrmDashboardPage: React.FC = () => {
  return (
    <CrmLayout>
      <div className="bg-gray-50 min-h-screen">
        <SEOHead />

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
