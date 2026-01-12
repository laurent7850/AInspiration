import React, { useEffect, useState } from 'react';
import { 
  Mail, 
  Phone, 
  Building, 
  Edit, 
  ArrowLeft, 
  MapPin, 
  Tag,
  Briefcase,
  FileText,
  PlusSquare,
  ListTodo,
  Clock,
  Package,
  Link as LinkIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchContactById } from '../../services/contactService';
import { fetchTasksByRelation } from '../../services/taskService';
import { Contact, Task } from '../../utils/types';
import ActivityFeed from './ActivityFeed';
import CompanyLink from './CompanyLink';

interface ContactDetailProps {
  contactId: string;
  onBack: () => void;
  onEdit: () => void;
}

const ContactDetail: React.FC<ContactDetailProps> = ({ contactId, onBack, onEdit }) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [contactData, tasksData] = await Promise.all([
          fetchContactById(contactId),
          fetchTasksByRelation('contact', contactId)
        ]);
        
        setContact(contactData);
        setRelatedTasks(tasksData);
      } catch (err) {
        console.error('Failed to load contact details', err);
        setError('Impossible de charger les détails du contact. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [contactId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <p>{error || "Contact introuvable"}</p>
        <button 
          onClick={onBack} 
          className="mt-2 text-white bg-red-600 px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </button>
      </div>
    );
  }

  const getFullName = (): string => {
    const firstName = contact.first_name || '';
    const lastName = contact.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Sans nom';
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-start mb-8">
        <button 
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/tasks/new', { 
              state: { 
                relatedToType: 'contact', 
                relatedToId: contactId 
              }
            })}
            className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
          >
            <PlusSquare className="w-5 h-5" />
            Ajouter une tâche
          </button>
          <button
            onClick={() => navigate('/opportunities/new', {
              state: {
                contactId: contactId
              }
            })}
            className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
          >
            <Package className="w-5 h-5" />
            Créer une opportunité
          </button>
          <button 
            onClick={onEdit}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Modifier
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/3">
          <div className="bg-indigo-50 rounded-xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600">
                {getFullName().substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{getFullName()}</h1>
                {contact.job_title && (
                  <p className="text-gray-600">{contact.job_title}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {contact.status && (
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {contact.status}
                      </span>
                    </p>
                  </div>
                </div>
              )}
              
              {contact.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:underline">
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}
              
              {contact.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <a href={`tel:${contact.phone}`} className="text-indigo-600 hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {(contact.company_id || contact.company_name) && (
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Entreprise</p>
                    {contact.company_id ? (
                      <CompanyLink companyId={contact.company_id} showIcon={false} />
                    ) : (
                      <p>{contact.company_name}</p>
                    )}
                  </div>
                </div>
              )}
              
              {contact.lead_source && (
                <div className="flex items-start gap-3">
                  <LinkIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Source</p>
                    <p>{contact.lead_source}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Address Card */}
          {(contact.address_street || contact.address_city || contact.address_state || contact.address_postal_code || contact.address_country) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Adresse
              </h3>
              <address className="not-italic space-y-1 text-gray-700">
                {contact.address_street && <p>{contact.address_street}</p>}
                {contact.address_city && contact.address_postal_code && (
                  <p>{contact.address_postal_code} {contact.address_city}</p>
                )}
                {!contact.address_city && contact.address_postal_code && (
                  <p>{contact.address_postal_code}</p>
                )}
                {contact.address_city && !contact.address_postal_code && (
                  <p>{contact.address_city}</p>
                )}
                {contact.address_state && <p>{contact.address_state}</p>}
                {contact.address_country && <p>{contact.address_country}</p>}
              </address>
            </div>
          )}
        </div>
        
        <div className="md:w-2/3">
          {/* Notes Section */}
          {contact.notes && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Notes
              </h2>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
              </div>
            </div>
          )}
          
          {/* Related Tasks Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-indigo-600" />
                Tâches associées
              </h2>
              
              <button
                onClick={() => navigate('/tasks/new', { 
                  state: { 
                    relatedToType: 'contact', 
                    relatedToId: contactId 
                  }
                })}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <PlusSquare className="w-4 h-4" />
                Ajouter une tâche
              </button>
            </div>
            
            {relatedTasks.length === 0 ? (
              <p className="text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
                Aucune tâche associée à ce contact
              </p>
            ) : (
              <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">
                {relatedTasks.map(task => (
                  <div key={task.id} className="p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          readOnly
                          className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <div>
                          <h3 className={`text-base font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {task.description.substring(0, 100)}
                              {task.description.length > 100 && '...'}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            {task.due_date && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDate(task.due_date)}
                              </span>
                            )}
                            <span>
                              {task.priority === 'high' ? 'Priorité haute' : 
                               task.priority === 'medium' ? 'Priorité moyenne' : 
                               'Priorité basse'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Activity Feed Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Historique des activités
            </h2>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <ActivityFeed 
                relatedToType="contact" 
                relatedToId={contactId} 
                limit={5} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;