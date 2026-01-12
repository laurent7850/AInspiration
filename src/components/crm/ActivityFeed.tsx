import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  User, 
  AlertCircle, 
  PlusCircle,
  Edit,
  Trash,
  MessageSquare,
  CheckSquare,
  FileText,
  Building,
  DollarSign
} from 'lucide-react';
import { fetchActivities } from '../../services/activityService';
import { Activity } from '../../utils/types';

interface ActivityFeedProps {
  relatedToType?: 'opportunity' | 'contact' | 'company' | 'task' | 'product';
  relatedToId?: string;
  limit?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  relatedToType, 
  relatedToId, 
  limit = 10 
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        const data = await fetchActivities(limit);
        
        // If relatedToType and relatedToId are provided, filter activities
        const filteredData = relatedToType && relatedToId
          ? data.filter(activity => 
              activity.related_to_type === relatedToType && 
              activity.related_to === relatedToId
            )
          : data;
        
        setActivities(filteredData);
      } catch (err) {
        console.error('Failed to load activities', err);
        setError('Impossible de charger l\'historique d\'activités. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    
    loadActivities();
  }, [relatedToType, relatedToId, limit]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucune activité à afficher</p>
      </div>
    );
  }

  // Helper function to get time ago
  const timeAgo = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return `il y a ${interval} an${interval > 1 ? 's' : ''}`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `il y a ${interval} mois`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `il y a ${interval} jour${interval > 1 ? 's' : ''}`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `il y a ${interval} heure${interval > 1 ? 's' : ''}`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `il y a ${interval} minute${interval > 1 ? 's' : ''}`;
    }
    
    return `il y a ${Math.floor(seconds)} seconde${seconds > 1 ? 's' : ''}`;
  };

  // Helper function to get icon for activity type
  const getActivityIcon = (activityType: string) => {
    if (activityType.includes('created')) {
      return <PlusCircle className="w-5 h-5 text-green-500" />;
    } else if (activityType.includes('updated')) {
      return <Edit className="w-5 h-5 text-blue-500" />;
    } else if (activityType.includes('deleted')) {
      return <Trash className="w-5 h-5 text-red-500" />;
    } else if (activityType.includes('completed')) {
      return <CheckSquare className="w-5 h-5 text-green-500" />;
    } else if (activityType.includes('note')) {
      return <MessageSquare className="w-5 h-5 text-indigo-500" />;
    } else if (activityType.includes('task')) {
      return <CheckSquare className="w-5 h-5 text-indigo-500" />;
    } else if (activityType.includes('opportunity')) {
      return <DollarSign className="w-5 h-5 text-indigo-500" />;
    } else if (activityType.includes('contact')) {
      return <User className="w-5 h-5 text-indigo-500" />;
    } else if (activityType.includes('company')) {
      return <Building className="w-5 h-5 text-indigo-500" />;
    } else if (activityType.includes('document')) {
      return <FileText className="w-5 h-5 text-indigo-500" />;
    }
    
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, index) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {index !== activities.length - 1 ? (
                <span 
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" 
                  aria-hidden="true"
                />
              ) : null}
              
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                </div>
                
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {activity.description}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      {timeAgo(activity.created_at || '')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;