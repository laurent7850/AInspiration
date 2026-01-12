import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, Loader } from 'lucide-react';
import { fetchCompanyById } from '../../services/companyService';
import { Company } from '../../utils/types';

interface CompanyLinkProps {
  companyId: string;
  showIcon?: boolean;
  className?: string;
}

const CompanyLink: React.FC<CompanyLinkProps> = ({ 
  companyId, 
  showIcon = true, 
  className = 'text-indigo-600 hover:text-indigo-800 hover:underline' 
}) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true);
        const data = await fetchCompanyById(companyId);
        setCompany(data);
      } catch (err) {
        console.error('Failed to load company:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadCompany();
  }, [companyId]);

  if (loading) {
    return <span className="inline-flex items-center"><Loader className="w-4 h-4 animate-spin mr-1" /> Chargement...</span>;
  }

  if (error || !company) {
    return <span>Entreprise indisponible</span>;
  }

  return (
    <Link to={`/companies/${companyId}`} className={className}>
      {showIcon && <Building className="w-4 h-4 inline-block mr-1" />}
      {company.name}
    </Link>
  );
};

export default CompanyLink;