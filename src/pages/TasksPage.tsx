import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import CrmLayout from '../components/crm/CrmLayout';
import TaskList from '../components/crm/task/TaskList';
import TaskForm from '../components/crm/task/TaskForm';
import { fetchTaskById } from '../services/taskService';

const TasksPage: React.FC = () => {
  const { t } = useTranslation('crm');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [initialRelatedToType, setInitialRelatedToType] = useState<'opportunity' | 'contact' | 'company' | undefined>(undefined);
  const [initialRelatedToId, setInitialRelatedToId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as { 
    relatedToType?: 'opportunity' | 'contact' | 'company', 
    relatedToId?: string 
  } | null;
  
  // Set up the view based on URL parameters and location state
  useEffect(() => {
    const setupView = async () => {
      // Handle initial related entity if provided in location state
      if (state?.relatedToType && state?.relatedToId) {
        setInitialRelatedToType(state.relatedToType);
        setInitialRelatedToId(state.relatedToId);
      }
      
      if (id === 'new') {
        // New task form
        setIsCreatingNew(true);
        setSelectedTaskId(null);
      } else if (id) {
        // Editing an existing task
        setLoading(true);
        try {
          // Verify task exists
          await fetchTaskById(id);
          setSelectedTaskId(id);
          setIsCreatingNew(false);
        } catch (error) {
          console.error('Error fetching task:', error);
          // Navigate back to list if task not found
          navigate('/tasks');
        } finally {
          setLoading(false);
        }
      } else {
        // List view
        setIsCreatingNew(false);
        setSelectedTaskId(null);
      }
    };
    
    setupView();
  }, [id, navigate, state]);

  const handleCreateNew = (relatedToType?: string, relatedToId?: string) => {
    if (relatedToType && relatedToId) {
      navigate('/tasks/new', { 
        state: { 
          relatedToType, 
          relatedToId 
        } 
      });
    } else {
      navigate('/tasks/new');
    }
  };

  const handleEditTask = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleCloseForm = () => {
    // Clear related entity state when closing form
    setInitialRelatedToType(undefined);
    setInitialRelatedToId(undefined);
    navigate('/tasks');
  };

  const handleSaved = () => {
    // Clear related entity state when saving
    setInitialRelatedToType(undefined);
    setInitialRelatedToId(undefined);
    navigate('/tasks');
  };

  if (loading) {
    return (
      <>
        <CrmLayout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        </CrmLayout>
      </>
    );
  }

  return (
    <>
      <CrmLayout>
        <section className="py-10 bg-gray-50 min-h-screen">
          <SEOHead
            title={t('pages.tasks.seoTitle')}
            description={t('pages.tasks.seoDescription')}
          />
          
          <div className="container mx-auto px-4">
            {isCreatingNew ? (
              <TaskForm 
                initialRelatedToType={initialRelatedToType}
                initialRelatedTo={initialRelatedToId}
                onClose={handleCloseForm}
                onSaved={handleSaved}
              />
            ) : selectedTaskId ? (
              <TaskForm
                taskId={selectedTaskId}
                onClose={handleCloseForm}
                onSaved={handleSaved}
              />
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  {t('pages.tasks.heading')}
                </h1>
                
                <TaskList
                  onCreateNew={handleCreateNew}
                  onEditTask={handleEditTask}
                />
              </>
            )}
          </div>
        </section>
      </CrmLayout>
    </>
  );
};

export default TasksPage;