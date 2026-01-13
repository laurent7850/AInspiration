import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import CrmLayout from '../components/crm/CrmLayout';
import CompanyList from '../components/crm/CompanyList';
import CompanyForm from '../components/crm/CompanyForm';
import CompanyDetail from '../components/crm/CompanyDetail';
import { fetchCompanyById } from '../services/companyService';

const CompaniesPage: React.FC = () => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const edit = searchParams.get('edit') === 'true';
  
  // Set up the view based on URL parameters
  useEffect(() => {
    const setupView = async () => {
      if (id === 'new') {
        // New company form
        setIsCreatingNew(true);
        setIsEditing(false);
        setSelectedCompanyId(null);
      } else if (id) {
        // Editing or viewing an existing company
        setLoading(true);
        try {
          // Verify company exists
          await fetchCompanyById(id);
          setSelectedCompanyId(id);
          setIsEditing(edit);
          setIsCreatingNew(false);
        } catch (error) {
          console.error('Error fetching company:', error);
          // Navigate back to list if company not found
          navigate('/companies');
        } finally {
          setLoading(false);
        }
      } else {
        // List view
        setIsCreatingNew(false);
        setIsEditing(false);
        setSelectedCompanyId(null);
      }
    };
    
    setupView();
  }, [id, edit, navigate]);

  const handleCreateNew = () => {
    navigate('/companies/new');
  };

  const handleEditCompany = (companyId: string) => {
    navigate(`/companies/${companyId}?edit=true`);
  };

  const handleViewCompany = (companyId: string) => {
    navigate(`/companies/${companyId}`);
  };

  const handleCloseForm = () => {
    navigate('/companies');
  };

  const handleSaved = () => {
    if (isCreatingNew) {
      navigate('/companies');
    } else if (isEditing && selectedCompanyId) {
      navigate(`/companies/${selectedCompanyId}`);
    }
  };

  if (loading) {
    return (
      <PrivateRoute>
        <CrmLayout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        </CrmLayout>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <CrmLayout>
        <section className="py-10 bg-gray-50 min-h-screen">
          <Helmet>
            <title>Gestion des entreprises | AInspiration CRM</title>
            <meta name="description" content="Gérez vos entreprises et clients professionnels et suivez toutes les interactions." />
          </Helmet>
          
          <div className="container mx-auto px-4">
            {isCreatingNew ? (
              <CompanyForm 
                onClose={handleCloseForm}
                onSaved={handleSaved}
              />
            ) : isEditing && selectedCompanyId ? (
              <CompanyForm
                companyId={selectedCompanyId}
                onClose={handleCloseForm}
                onSaved={handleSaved}
              />
            ) : selectedCompanyId ? (
              <CompanyDetail
                companyId={selectedCompanyId}
                onBack={handleCloseForm}
                onEdit={() => handleEditCompany(selectedCompanyId)}
              />
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  Gestion des entreprises
                </h1>
                
                <CompanyList
                  onCreateNew={handleCreateNew}
                  onEditCompany={handleViewCompany}
                />
              </>
            )}
          </div>
        </section>
      </CrmLayout>
    </PrivateRoute>
  );
};

export default CompaniesPage;