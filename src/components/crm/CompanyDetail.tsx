import React, { useEffect, useState } from 'react';
import {
  Building2,
  Globe,
  MapPin,
  Edit,
  ArrowLeft,
  PlusSquare,
  ListTodo,
  Clock,
  Users,
  PackageOpen,
  Link as LinkIcon,
  ExternalLink,
  Mail
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCompanyById } from '../../services/companyService';
import { fetchTasksByRelation } from '../../services/taskService';
import { fetchContacts } from '../../services/contactService';
import { Company, Contact, Task } from '../../utils/types';
import ActivityFeed from './ActivityFeed';

interface CompanyDetailProps {
  companyId: string;
  onBack: () => void;
  onEdit: () => void;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ companyId, onBack, onEdit }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [relatedContacts, setRelatedContacts] = useState<Contact[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch company details
        const companyData = await fetchCompanyById(companyId);
        setCompany(companyData);
        
        // Fetch related tasks
        const tasksData = await fetchTasksByRelation('company', companyId);
        setRelatedTasks(tasksData);
        
        // Fetch all contacts, then filter by company_id
        const allContacts = await fetchContacts();
        const companyContacts = allContacts.filter(contact => contact.company_id === companyId);
        setRelatedContacts(companyContacts);
        
      } catch (err) {
        console.error('Failed to load company details', err);
        setError('Impossible de charger les détails de l\'entreprise. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [companyId]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <p>{error || "Entreprise introuvable"}</p>
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
            onClick={() => navigate('/contacts/new', { 
              state: { 
                companyId: companyId 
              }
            })}
            className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            Ajouter un contact
          </button>
          <button
            onClick={() => navigate('/opportunities/new', { 
              state: { 
                companyId: companyId 
              }
            })}
            className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
          >
            <PackageOpen className="w-5 h-5" />
            Nouvelle opportunité
          </button>
          <button
            onClick={() => navigate('/tasks/new', { 
              state: { 
                relatedToType: 'company', 
                relatedToId: companyId 
              }
            })}
            className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
          >
            <PlusSquare className="w-5 h-5" />
            Ajouter une tâche
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
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-gray-600">Entreprise</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {company.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Site web</p>
                    <a 
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      {company.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
              
              {company.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="whitespace-pre-wrap">{company.address}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Date de création</p>
                  <p>{formatDate(company.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:w-2/3">
          {/* Related Contacts Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Contacts associés
              </h2>
              
              <button
                onClick={() => navigate('/contacts/new', { state: { companyId: company.id } })}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <PlusSquare className="w-4 h-4" />
                Ajouter un contact
              </button>
            </div>
            
            {relatedContacts.length === 0 ? (
              <p className="text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
                Aucun contact associé à cette entreprise
              </p>
            ) : (
              <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">
                {relatedContacts.map(contact => (
                  <div key={contact.id} className="p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {`${contact.first_name?.substring(0, 1) || ''}${contact.last_name?.substring(0, 1) || ''}`.toUpperCase() || 'C'}
                          </span>
                        </div>
                        <div>
                          <a 
                            href={`/contacts/${contact.id}`}
                            className="text-base font-medium text-gray-900 hover:text-indigo-600"
                          >
                            {`${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Contact sans nom'}
                          </a>
                          <p className="text-sm text-gray-600">{contact.job_title || ''}</p>
                          {contact.email && (
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <a 
                                href={`mailto:${contact.email}`} 
                                className="hover:text-indigo-600"
                                onClick={e => e.stopPropagation()}
                              >
                                {contact.email}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                      <a 
                        href={`/contacts/${contact.id}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
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
                    relatedToType: 'company', 
                    relatedToId: companyId 
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
                Aucune tâche associée à cette entreprise
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
                relatedToType="company" 
                relatedToId={companyId} 
                limit={5} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;