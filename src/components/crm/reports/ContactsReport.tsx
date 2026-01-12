import { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Calendar, ArrowDownUp } from 'lucide-react';
import { Contact } from '../../../utils/types';
import { fetchContacts } from '../../../services/contactService';
import ReportFilters from './ReportFilters';
import ReportExporter from './ReportExporter';
import DateRangePicker from './DateRangePicker';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  label: string;
  options: FilterOption[];
  selected: string[];
}

type ContactFilters = {
  status: FilterConfig;
};

const ContactsReport: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  });

  const [filters, setFilters] = useState<ContactFilters>({
    status: {
      label: "Statut",
      options: [
        { value: 'lead', label: 'Prospect' },
        { value: 'customer', label: 'Client' },
        { value: 'inactive', label: 'Inactif' },
        { value: 'other', label: 'Autre' }
      ],
      selected: []
    }
  });
  
  // Columns for the report table and export
  const columns = [
    { key: 'first_name', label: 'Prénom' },
    { key: 'last_name', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'job_title', label: 'Fonction' },
    { key: 'company_name', label: 'Entreprise' },
    { key: 'status', label: 'Statut' },
    { key: 'lead_source', label: 'Source' },
    { key: 'created_at', label: 'Date de création' }
  ];
  
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true);
        const data = await fetchContacts();
        setContacts(data);
      } catch (err) {
        console.error('Failed to load contacts:', err);
        setError('Impossible de charger les contacts');
      } finally {
        setLoading(false);
      }
    };
    
    loadContacts();
  }, []);
  
  useEffect(() => {
    // Apply filters to contacts
    let result = [...contacts];
    
    // Filter by date range
    result = result.filter(contact => {
      const date = new Date(contact.created_at || '');
      return date >= dateRange.start && date <= dateRange.end;
    });
    
    // Apply status filter
    if (filters.status.selected.length > 0) {
      result = result.filter(contact => filters.status.selected.includes(contact.status || ''));
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortField as keyof Contact];
      let valueB = b[sortField as keyof Contact];
      
      // Handle special cases for sorting
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      // @ts-ignore - Date check after string check
      else if (valueA instanceof Date && valueB instanceof Date) {
        // @ts-ignore - Converting dates to numbers for comparison
        valueA = valueA.getTime();
        // @ts-ignore - Converting dates to numbers for comparison
        valueB = valueB.getTime();
      }

      if (valueA !== undefined && valueB !== undefined) {
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredContacts(result);
  }, [contacts, filters, sortField, sortDirection, dateRange]);
  
  const handleFilterChange = (filterName: string, values: string[]) => {
    if (filterName in filters) {
      setFilters(prev => ({
        ...prev,
        [filterName]: {
          ...prev[filterName as keyof ContactFilters],
          selected: values
        }
      }));
    }
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set to default (descending)
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  const getFullName = (contact: Contact): string => {
    const firstName = contact.first_name || '';
    const lastName = contact.last_name || '';
    return `${firstName} ${lastName}`.trim() || contact.email || 'Sans nom';
  };
  
  const getStatusColor = (status: string | undefined): string => {
    switch(status) {
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // Calculate summary statistics
  const totalContacts = filteredContacts.length;
  const prospectCount = filteredContacts.filter(c => c.status === 'lead').length;
  const customerCount = filteredContacts.filter(c => c.status === 'customer').length;
  const inactiveCount = filteredContacts.filter(c => c.status === 'inactive').length;
  
  // Group by lead source
  const leadSources: Record<string, number> = {};
  filteredContacts.forEach(contact => {
    if (contact.lead_source) {
      leadSources[contact.lead_source] = (leadSources[contact.lead_source] || 0) + 1;
    }
  });
  
  // Get top lead sources
  const topLeadSources = Object.entries(leadSources)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Rapport des contacts
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker 
            startDate={dateRange.start} 
            endDate={dateRange.end}
            onChange={(start, end) => setDateRange({start, end})}
          />
          
          <ReportExporter 
            reportName="contacts_report"
            data={filteredContacts.map(contact => ({
              ...contact,
              full_name: getFullName(contact)
            }))}
            columns={columns}
          />
        </div>
      </div>
      
      <ReportFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold">{totalContacts}</div>
          <div className="text-sm text-gray-500">contacts</div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Prospects</div>
          <div className="text-2xl font-bold">{prospectCount}</div>
          <div className="text-sm text-gray-500">{totalContacts ? ((prospectCount / totalContacts) * 100).toFixed(1) : 0}% du total</div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Clients</div>
          <div className="text-2xl font-bold">{customerCount}</div>
          <div className="text-sm text-gray-500">{totalContacts ? ((customerCount / totalContacts) * 100).toFixed(1) : 0}% du total</div>
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Top source</div>
          <div className="text-2xl font-bold">
            {topLeadSources.length > 0 
              ? topLeadSources[0][0] 
              : '-'}
          </div>
          <div className="text-sm text-gray-500">
            {topLeadSources.length > 0 
              ? `${topLeadSources[0][1]} contacts` 
              : 'Aucune source'}
          </div>
        </div>
      </div>
      
      {/* Data table */}
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.key === 'first_name' && (
                      <span className="text-indigo-500"><User className="w-4 h-4" /></span>
                    )}
                    {column.key === 'email' && (
                      <span className="text-indigo-500"><Mail className="w-4 h-4" /></span>
                    )}
                    {column.key === 'phone' && (
                      <span className="text-indigo-500"><Phone className="w-4 h-4" /></span>
                    )}
                    {column.key === 'company_name' && (
                      <span className="text-indigo-500"><Building className="w-4 h-4" /></span>
                    )}
                    {column.key === 'created_at' && (
                      <span className="text-indigo-500"><Calendar className="w-4 h-4" /></span>
                    )}
                    
                    <span>{column.label}</span>
                    
                    {sortField === column.key && (
                      <ArrowDownUp className={`w-3.5 h-3.5 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  Aucun contact trouvé pour les filtres sélectionnés
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{contact.first_name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{contact.last_name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.job_title || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.company_name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contact.status ? (
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(contact.status)}`}>
                        {contact.status}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.lead_source || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(contact.created_at)}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactsReport;