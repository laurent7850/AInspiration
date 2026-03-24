import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { LayoutList, Kanban } from 'lucide-react';
import OpportunityList from '../components/crm/OpportunityList';
import OpportunityKanban from '../components/crm/OpportunityKanban';
import OpportunityForm from '../components/crm/OpportunityForm';
import OpportunityDetail from '../components/crm/OpportunityDetail';
import OpportunityStats from '../components/crm/OpportunityStats';

import CrmLayout from '../components/crm/CrmLayout';
import { fetchOpportunityById } from '../services/opportunityService';

const OpportunitiesPage: React.FC = () => {
  const { t } = useTranslation('crm');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const edit = searchParams.get('edit') === 'true';
  
  // Set up the view based on URL parameters
  useEffect(() => {
    const setupView = async () => {
      if (id === 'new') {
        // New opportunity form
        setIsCreatingNew(true);
        setIsEditing(false);
        setSelectedOpportunityId(null);
      } else if (id) {
        // Editing or viewing an existing opportunity
        setLoading(true);
        try {
          // Verify opportunity exists
          await fetchOpportunityById(id);
          setSelectedOpportunityId(id);
          setIsEditing(edit);
          setIsCreatingNew(false);
        } catch (error) {
          console.error('Error fetching opportunity:', error);
          // Navigate back to list if opportunity not found
          navigate('/opportunities');
        } finally {
          setLoading(false);
        }
      } else {
        // List view
        setIsCreatingNew(false);
        setIsEditing(false);
        setSelectedOpportunityId(null);
      }
    };
    
    setupView();
  }, [id, edit, navigate]);

  const handleCreateNew = () => {
    navigate('/opportunities/new');
  };

  const handleEditOpportunity = (opportunityId: string) => {
    navigate(`/opportunities/${opportunityId}?edit=true`);
  };

  const handleViewOpportunity = (opportunityId: string) => {
    navigate(`/opportunities/${opportunityId}`);
  };

  const handleCloseForm = () => {
    navigate('/opportunities');
  };

  const handleSaved = () => {
    if (isCreatingNew) {
      navigate('/opportunities');
    } else if (isEditing && selectedOpportunityId) {
      navigate(`/opportunities/${selectedOpportunityId}`);
    }
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
            title={t('pages.opportunities.seoTitle')}
            description={t('pages.opportunities.seoDescription')}
          />
          
          <div className="container mx-auto px-4">
            {isCreatingNew ? (
              <OpportunityForm 
                onClose={handleCloseForm}
                onSaved={handleSaved}
              />
            ) : isEditing && selectedOpportunityId ? (
              <OpportunityForm
                opportunityId={selectedOpportunityId}
                onClose={handleCloseForm}
                onSaved={handleSaved}
              />
            ) : selectedOpportunityId ? (
              <OpportunityDetail
                opportunityId={selectedOpportunityId}
                onBack={handleCloseForm}
                onEdit={() => handleEditOpportunity(selectedOpportunityId)}
              />
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {t('pages.opportunities.heading')}
                  </h1>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        viewMode === 'list'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <LayoutList className="w-5 h-5" />
                      {t('pages.opportunities.viewList')}
                    </button>
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        viewMode === 'kanban'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Kanban className="w-5 h-5" />
                      {t('pages.opportunities.viewKanban')}
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <OpportunityStats />
                </div>

                {viewMode === 'list' ? (
                  <OpportunityList
                    onCreateNew={handleCreateNew}
                    onEditOpportunity={handleViewOpportunity}
                  />
                ) : (
                  <div className="bg-white rounded-xl shadow p-6">
                    <OpportunityKanban />
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </CrmLayout>
    </>
  );
};

export default OpportunitiesPage;