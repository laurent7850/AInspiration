import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { BarChart, FileText, Users, Package, CheckSquare, RefreshCw } from 'lucide-react';

import CrmLayout from '../components/crm/CrmLayout';
import ReportsDashboard from '../components/crm/reports/ReportsDashboard';
import OpportunitiesReport from '../components/crm/reports/OpportunitiesReport';
import ContactsReport from '../components/crm/reports/ContactsReport';
import TasksReport from '../components/crm/reports/TasksReport';
import ProductsReport from '../components/crm/reports/ProductsReport';

const ReportsPage: React.FC = () => {
  const { t } = useTranslation('crm');
  const [activeTab, setActiveTab] = useState('dashboard');

  const refreshData = () => {
    // Refresh data logic would go here
    console.log('Refreshing data...');
  };

  return (
    <>
      <CrmLayout>
        <section className="py-10 bg-gray-50 min-h-screen">
          <SEOHead
            title={t('pages.reports.seoTitle')}
            description={t('pages.reports.seoDescription')}
          />

          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
                {t('pages.reports.heading')}
              </h1>

              <div className="flex items-center gap-4">
                <button
                  onClick={refreshData}
                  title={t('pages.reports.refresh')}
                  className="p-2 text-gray-600 hover:text-indigo-600 rounded-full hover:bg-gray-100"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>

                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="w-full md:w-auto"
                >
                  <TabsList className="bg-white shadow-sm">
                    <TabsTrigger value="dashboard">
                      <BarChart className="w-4 h-4 mr-1 md:mr-2" />
                      <span className="hidden md:inline">{t('pages.reports.tabOverview')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="opportunities">
                      <FileText className="w-4 h-4 mr-1 md:mr-2" />
                      <span className="hidden md:inline">{t('pages.reports.tabOpportunities')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="contacts">
                      <Users className="w-4 h-4 mr-1 md:mr-2" />
                      <span className="hidden md:inline">{t('pages.reports.tabContacts')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="tasks">
                      <CheckSquare className="w-4 h-4 mr-1 md:mr-2" />
                      <span className="hidden md:inline">{t('pages.reports.tabTasks')}</span>
                    </TabsTrigger>
                    <TabsTrigger value="products">
                      <Package className="w-4 h-4 mr-1 md:mr-2" />
                      <span className="hidden md:inline">{t('pages.reports.tabProducts')}</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="space-y-6">
              {activeTab === 'dashboard' && <ReportsDashboard />}
              {activeTab === 'opportunities' && <OpportunitiesReport />}
              {activeTab === 'contacts' && <ContactsReport />}
              {activeTab === 'tasks' && <TasksReport />}
              {activeTab === 'products' && <ProductsReport />}
            </div>
          </div>
        </section>
      </CrmLayout>
    </>
  );
};

export default ReportsPage;