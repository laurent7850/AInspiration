import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import CrmLayout from '../components/crm/CrmLayout';
import ContactList from '../components/crm/ContactList';
import ContactForm from '../components/crm/ContactForm';
import ContactDetail from '../components/crm/ContactDetail';
import { fetchContactById } from '../services/contactService';

const ContactsPage: React.FC = () => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
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
        // New contact form
        setIsCreatingNew(true);
        setIsEditing(false);
        setSelectedContactId(null);
      } else if (id) {
        // Editing or viewing an existing contact
        setLoading(true);
        try {
          // Verify contact exists
          await fetchContactById(id);
          setSelectedContactId(id);
          setIsEditing(edit);
          setIsCreatingNew(false);
        } catch (error) {
          console.error('Error fetching contact:', error);
          // Navigate back to list if contact not found
          navigate('/contacts');
        } finally {
          setLoading(false);
        }
      } else {
        // List view
        setIsCreatingNew(false);
        setIsEditing(false);
        setSelectedContactId(null);
      }
    };
    
    setupView();
  }, [id, edit, navigate]);

  const handleCreateNew = () => {
    navigate('/contacts/new');
  };

  const handleEditContact = (contactId: string) => {
    navigate(`/contacts/${contactId}?edit=true`);
  };

  const handleViewContact = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
  };

  const handleCloseForm = () => {
    navigate('/contacts');
  };

  const handleSaved = () => {
    if (isCreatingNew) {
      navigate('/contacts');
    } else if (isEditing && selectedContactId) {
      navigate(`/contacts/${selectedContactId}`);
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
            <title>Gestion des contacts | AInspiration CRM</title>
            <meta name="description" content="Gérez vos contacts professionnels et suivez toutes les interactions." />
          </Helmet>
          
          <div className="container mx-auto px-4">
            {isCreatingNew ? (
              <ContactForm 
                onClose={handleCloseForm}
                onSaved={handleSaved}
              />
            ) : isEditing && selectedContactId ? (
              <ContactForm
                contactId={selectedContactId}
                onClose={handleCloseForm}
                onSaved={handleSaved}
              />
            ) : selectedContactId ? (
              <ContactDetail
                contactId={selectedContactId}
                onBack={handleCloseForm}
                onEdit={() => handleEditContact(selectedContactId)}
              />
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  Gestion des contacts
                </h1>
                
                <ContactList
                  onCreateNew={handleCreateNew}
                  onEditContact={handleViewContact}
                />
              </>
            )}
          </div>
        </section>
      </CrmLayout>
    </PrivateRoute>
  );
};

export default ContactsPage;