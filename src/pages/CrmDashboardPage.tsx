import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import PrivateRoute from '../components/PrivateRoute';
import DashboardView from '../components/crm/DashboardView';
import OpportunityList from '../components/crm/OpportunityList';
import TaskList from '../components/crm/task/TaskList';
import OpportunityForm from '../components/crm/OpportunityForm';
import TaskForm from '../components/crm/task/TaskForm';
import OpportunityDetail from '../components/crm/OpportunityDetail';
import CrmLayout from '../components/crm/CrmLayout';
import { useNavigate } from 'react-router-dom';

const CrmDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCreatingNewOpportunity, setIsCreatingNewOpportunity] = useState(false);
  const [isCreatingNewTask, setIsCreatingNewTask] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [isEditingOpportunity, setIsEditingOpportunity] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleCreateNewOpportunity = () => {
    navigate('/opportunities/new');
  };

  const handleEditOpportunity = (id: string) => {
    navigate(`/opportunities/${id}?edit=true`);
  };

  const handleViewOpportunity = (id: string) => {
    navigate(`/opportunities/${id}`);
  };

  const handleCreateNewTask = (relatedToType?: string, relatedToId?: string) => {
    setIsCreatingNewTask(true);
    setSelectedTaskId(null);
    // TODO: Set initial related entity if provided
  };

  const handleEditTask = (id: string) => {
    setSelectedTaskId(id);
    setIsCreatingNewTask(false);
  };

  const handleCloseOpportunityForm = () => {
    setIsCreatingNewOpportunity(false);
    setIsEditingOpportunity(false);
    setSelectedOpportunityId(null);
  };

  const handleCloseTaskForm = () => {
    setIsCreatingNewTask(false);
    setSelectedTaskId(null);
  };

  const handleOpportunitySaved = () => {
    setIsCreatingNewOpportunity(false);
    setIsEditingOpportunity(false);
    // Keep selectedOpportunityId to show detail view
  };

  const handleTaskSaved = () => {
    setIsCreatingNewTask(false);
    setSelectedTaskId(null);
    // Refresh tasks list
  };

  const renderContent = () => {
    if (activeTab === 'opportunities') {
      return (
        <OpportunityList
          onCreateNew={handleCreateNewOpportunity}
          onEditOpportunity={handleViewOpportunity}
        />
      );
    } 
    
    if (activeTab === 'tasks') {
      if (isCreatingNewTask) {
        return (
          <TaskForm 
            onClose={handleCloseTaskForm}
            onSaved={handleTaskSaved}
          />
        );
      } 
      
      if (selectedTaskId) {
        return (
          <TaskForm
            taskId={selectedTaskId}
            onClose={handleCloseTaskForm}
            onSaved={handleTaskSaved}
          />
        );
      } 
      
      return (
        <TaskList
          onCreateNew={handleCreateNewTask}
          onEditTask={handleEditTask}
        />
      );
    }
    
    return <DashboardView />;
  };

  return (
    <PrivateRoute>
      <CrmLayout>
        <div className="bg-gray-50 min-h-screen">
          <Helmet>
            <title>CRM Dashboard | AInspiration</title>
            <meta name="description" content="Gérez vos clients, opportunités et tâches depuis votre tableau de bord CRM." />
          </Helmet>
          
          <section className="py-10">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
                  CRM Dashboard
                </h1>
                
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="w-full md:w-auto"
                >
                  <TabsList className="bg-white shadow-sm">
                    <TabsTrigger value="dashboard" onClick={() => setActiveTab('dashboard')}>
                      Tableau de bord
                    </TabsTrigger>
                    <TabsTrigger value="opportunities" onClick={() => setActiveTab('opportunities')}>
                      Opportunités
                    </TabsTrigger>
                    <TabsTrigger value="tasks" onClick={() => setActiveTab('tasks')}>
                      Tâches
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {renderContent()}
            </div>
          </section>
        </div>
      </CrmLayout>
    </PrivateRoute>
  );
};

export default CrmDashboardPage;