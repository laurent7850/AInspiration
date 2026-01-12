import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Building2, User, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchOpportunities, updateOpportunity } from '../../services/opportunityService';
import { Opportunity, OpportunityStage } from '../../utils/types';

const OPPORTUNITY_STAGES: OpportunityStage[] = [
  'Qualification',
  'Proposition',
  'Négociation',
  'Gagné',
  'Perdu'
];

const OpportunityKanban: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<Opportunity | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const data = await fetchOpportunities();
      setOpportunities(data);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (opportunity: Opportunity) => {
    setDraggedItem(opportunity);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (stage: OpportunityStage) => {
    if (!draggedItem || draggedItem.stage === stage) {
      setDraggedItem(null);
      return;
    }

    try {
      await updateOpportunity(draggedItem.id, { stage });

      setOpportunities(prev =>
        prev.map(opp =>
          opp.id === draggedItem.id ? { ...opp, stage } : opp
        )
      );
    } catch (error) {
      console.error('Error updating opportunity stage:', error);
    } finally {
      setDraggedItem(null);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'Qualification':
        return 'bg-blue-100 border-blue-300';
      case 'Proposition':
        return 'bg-purple-100 border-purple-300';
      case 'Négociation':
        return 'bg-orange-100 border-orange-300';
      case 'Gagné':
        return 'bg-green-100 border-green-300';
      case 'Perdu':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getStageTextColor = (stage: string): string => {
    switch (stage) {
      case 'Qualification':
        return 'text-blue-700';
      case 'Proposition':
        return 'text-purple-700';
      case 'Négociation':
        return 'text-orange-700';
      case 'Gagné':
        return 'text-green-700';
      case 'Perdu':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  const getOpportunitiesByStage = (stage: OpportunityStage) => {
    return opportunities.filter(opp => opp.stage === stage);
  };

  const getTotalValueByStage = (stage: OpportunityStage) => {
    return getOpportunitiesByStage(stage).reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-4 pb-4" style={{ minWidth: '1200px' }}>
        {OPPORTUNITY_STAGES.map(stage => {
          const stageOpportunities = getOpportunitiesByStage(stage);
          const totalValue = getTotalValueByStage(stage);

          return (
            <div
              key={stage}
              className="flex-1 min-w-[280px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage)}
            >
              <div className={`rounded-lg border-2 ${getStageColor(stage)} p-4 mb-3`}>
                <div className="flex justify-between items-center">
                  <h3 className={`font-semibold ${getStageTextColor(stage)}`}>
                    {stage}
                  </h3>
                  <span className={`text-sm font-medium ${getStageTextColor(stage)}`}>
                    {stageOpportunities.length}
                  </span>
                </div>
                {totalValue > 0 && (
                  <p className={`text-sm mt-1 ${getStageTextColor(stage)}`}>
                    {formatCurrency(totalValue)}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {stageOpportunities.map(opportunity => (
                  <div
                    key={opportunity.id}
                    draggable
                    onDragStart={() => handleDragStart(opportunity)}
                    onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                    className="bg-white rounded-lg border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {opportunity.name}
                    </h4>

                    {opportunity.estimated_value && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="font-semibold">
                          {formatCurrency(opportunity.estimated_value)}
                        </span>
                      </div>
                    )}

                    <div className="space-y-1 text-xs text-gray-500">
                      {opportunity.company_name && (
                        <div className="flex items-center">
                          <Building2 className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{opportunity.company_name}</span>
                        </div>
                      )}

                      {opportunity.contact_name && (
                        <div className="flex items-center">
                          <User className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{opportunity.contact_name}</span>
                        </div>
                      )}

                      {opportunity.product_name && (
                        <div className="flex items-center">
                          <Package className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{opportunity.product_name}</span>
                        </div>
                      )}

                      {opportunity.close_date && (
                        <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
                          <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span>Échéance: {formatDate(opportunity.close_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {stageOpportunities.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Aucune opportunité
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OpportunityKanban;
