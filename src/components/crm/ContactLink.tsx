import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Loader } from 'lucide-react';
import { fetchContactById } from '../../services/contactService';
import { Contact } from '../../utils/types';

interface ContactLinkProps {
  contactId: string;
  showIcon?: boolean;
  className?: string;
}

const ContactLink: React.FC<ContactLinkProps> = ({ 
  contactId, 
  showIcon = true, 
  className = 'text-indigo-600 hover:text-indigo-800 hover:underline' 
}) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadContact = async () => {
      try {
        setLoading(true);
        const data = await fetchContactById(contactId);
        setContact(data);
      } catch (err) {
        console.error('Failed to load contact:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadContact();
  }, [contactId]);

  if (loading) {
    return <span className="inline-flex items-center"><Loader className="w-4 h-4 animate-spin mr-1" /> Chargement...</span>;
  }

  if (error || !contact) {
    return <span>Contact indisponible</span>;
  }

  const displayName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email || 'Contact';

  return (
    <Link to={`/contacts/${contactId}`} className={className}>
      {showIcon && <User className="w-4 h-4 inline-block mr-1" />}
      {displayName}
    </Link>
  );
};

export default ContactLink;