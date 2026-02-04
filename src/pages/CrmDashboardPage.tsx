import React from 'react';
import { Helmet } from 'react-helmet-async';
import PrivateRoute from '../components/PrivateRoute';
import DashboardView from '../components/crm/DashboardView';
import CrmLayout from '../components/crm/CrmLayout';

const CrmDashboardPage: React.FC = () => {
  return (
    <PrivateRoute>
      <CrmLayout>
        <div className="bg-gray-50 min-h-screen">
          <Helmet>
            <title>CRM Intelligent | AInspiration</title>
            <meta name="description" content="Tableau de bord CRM intelligent propulsé par l'IA. Gérez vos leads, opportunités et suivez vos performances commerciales." />
          </Helmet>

          <section className="py-6 md:py-10">
            <div className="container mx-auto px-4">
              <DashboardView />
            </div>
          </section>
        </div>
      </CrmLayout>
    </PrivateRoute>
  );
};

export default CrmDashboardPage;
