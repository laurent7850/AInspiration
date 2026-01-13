import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { BarChart, FileText, Users, Package, CheckSquare, RefreshCw } from 'lucide-react';
import PrivateRoute from '../components/PrivateRoute';
import CrmLayout from '../components/crm/CrmLayout';
import ReportsDashboard from '../components/crm/reports/ReportsDashboard';
import OpportunitiesReport from '../components/crm/reports/OpportunitiesReport';
import ContactsReport from '../components/crm/reports/ContactsReport';
import TasksReport from '../components/crm/reports/TasksReport';
import ProductsReport from '../components/crm/reports/ProductsReport';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const refreshData = () => {
    // Refresh data logic would go here
    console.log('Refreshing data...');
  };

  return (
    <PrivateRoute>
      <CrmLayout>
        <section className="py-10 bg-gray-50 min-h-screen">
          <Helmet>
            <title>Rapports et Analyses | AInspiration CRM</title>
            <meta name="description" content="Visualisez et analysez vos performances commerciales avec des rapports détaillés et personnalisables." />
          </Helmet>

          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
                Rapports et Analyses
              </h1>

              <div className="flex items-center gap-4">
                <button
                  onClick={refreshData}
                  title="Rafraîchir les données"
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
                      <span className="hidden md:inline">Vue d'ensemble</span>
                    </TabsTrigger>
                    <TabsTrigger value="opportunities">
                      <FileText className="w-4 h-4 mr-1 md:mr-2" />
                      <span className="hidden md:inline">Opportunités</span>
                    </TabsTrigger>
                    <TabsTrigger value="contacts">
                      <Users className="w-4 h-4 mr-1 md:mr-2" />
                      <span className="hidden md:inline">Contacts</span>
                    </TabsTrigger>
                    <TabsTrigger value="tasks">
                      <CheckSquare className="w-4 h-4 mr-1 md:mr-2" />
                      <span className="hidden md:inline">Tâches</span>
                    </TabsTrigger>
                    <TabsTrigger value="products">
                      <Package className="w-4 h-4 mr-1 md:mr-2" />
                      <span className="hidden md:inline">Produits</span>
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
    </PrivateRoute>
  );
};

export default ReportsPage;