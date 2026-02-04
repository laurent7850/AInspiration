import React, { useState, useEffect } from 'react';
import {
  Flame,
  ThermometerSun,
  Snowflake,
  TrendingUp,
  Users,
  ChevronRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { Contact, Opportunity, Activity } from '../../utils/types';
import { calculateLeadScore, LeadScore } from '../../services/n8nService';

interface LeadScoringProps {
  contacts: Contact[];
  opportunities: Opportunity[];
  activities: Activity[];
  onContactClick?: (contactId: string) => void;
}

const LeadScoring: React.FC<LeadScoringProps> = ({
  contacts,
  opportunities,
  activities,
  onContactClick
}) => {
  const [leadScores, setLeadScores] = useState<LeadScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');

  useEffect(() => {
    const calculateScores = async () => {
      setLoading(true);
      const scores: LeadScore[] = [];

      // Calculer le score pour chaque contact
      for (const contact of contacts.slice(0, 20)) { // Limiter à 20 pour la performance
        const score = await calculateLeadScore(contact, opportunities, activities);
        if (score) {
          scores.push(score);
        }
      }

      // Trier par score décroissant
      scores.sort((a, b) => b.score - a.score);
      setLeadScores(scores);
      setLoading(false);
    };

    if (contacts.length > 0) {
      calculateScores();
    } else {
      setLoading(false);
    }
  }, [contacts, opportunities, activities]);

  const getPriorityIcon = (priority: LeadScore['priority']) => {
    switch (priority) {
      case 'hot':
        return <Flame className="w-5 h-5 text-red-500" />;
      case 'warm':
        return <ThermometerSun className="w-5 h-5 text-orange-500" />;
      case 'cold':
        return <Snowflake className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityLabel = (priority: LeadScore['priority']) => {
    switch (priority) {
      case 'hot':
        return 'Chaud';
      case 'warm':
        return 'Tiède';
      case 'cold':
        return 'Froid';
    }
  };

  const getPriorityColor = (priority: LeadScore['priority']) => {
    switch (priority) {
      case 'hot':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warm':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cold':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const filteredScores = leadScores.filter(score =>
    selectedPriority === 'all' || score.priority === selectedPriority
  );

  const getContactName = (contactId: string): string => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return 'Contact inconnu';
    return `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Sans nom';
  };

  const getContactCompany = (contactId: string): string | undefined => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.company_name;
  };

  // Statistiques des leads
  const hotCount = leadScores.filter(s => s.priority === 'hot').length;
  const warmCount = leadScores.filter(s => s.priority === 'warm').length;
  const coldCount = leadScores.filter(s => s.priority === 'cold').length;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Lead Scoring IA</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="ml-3 text-gray-500">Calcul des scores...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Lead Scoring IA</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="group relative">
            <Info className="w-5 h-5 text-gray-400 cursor-help" />
            <div className="absolute right-0 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              Le score est calculé selon l'engagement, la récence des interactions, la valeur potentielle et les informations disponibles.
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button
          onClick={() => setSelectedPriority(selectedPriority === 'hot' ? 'all' : 'hot')}
          className={`p-3 rounded-lg border transition-all ${
            selectedPriority === 'hot' ? 'ring-2 ring-red-500' : ''
          } ${getPriorityColor('hot')}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Flame className="w-5 h-5" />
            <span className="font-bold text-lg">{hotCount}</span>
          </div>
          <div className="text-xs text-center mt-1">Leads chauds</div>
        </button>
        <button
          onClick={() => setSelectedPriority(selectedPriority === 'warm' ? 'all' : 'warm')}
          className={`p-3 rounded-lg border transition-all ${
            selectedPriority === 'warm' ? 'ring-2 ring-orange-500' : ''
          } ${getPriorityColor('warm')}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <ThermometerSun className="w-5 h-5" />
            <span className="font-bold text-lg">{warmCount}</span>
          </div>
          <div className="text-xs text-center mt-1">Leads tièdes</div>
        </button>
        <button
          onClick={() => setSelectedPriority(selectedPriority === 'cold' ? 'all' : 'cold')}
          className={`p-3 rounded-lg border transition-all ${
            selectedPriority === 'cold' ? 'ring-2 ring-blue-500' : ''
          } ${getPriorityColor('cold')}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Snowflake className="w-5 h-5" />
            <span className="font-bold text-lg">{coldCount}</span>
          </div>
          <div className="text-xs text-center mt-1">Leads froids</div>
        </button>
      </div>

      {/* Liste des leads */}
      {filteredScores.length > 0 ? (
        <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {filteredScores.map((leadScore) => (
            <li
              key={leadScore.contactId}
              className="py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onContactClick?.(leadScore.contactId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getPriorityIcon(leadScore.priority)}
                  <div>
                    <div className="font-medium text-gray-900">
                      {getContactName(leadScore.contactId)}
                    </div>
                    {getContactCompany(leadScore.contactId) && (
                      <div className="text-xs text-gray-500">
                        {getContactCompany(leadScore.contactId)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Score bar */}
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getScoreColor(leadScore.score)}`}
                      style={{ width: `${leadScore.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-8">
                    {leadScore.score}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 pl-8">
                {leadScore.recommendation}
              </div>
              {/* Score breakdown */}
              <div className="mt-2 pl-8 flex space-x-4 text-xs text-gray-400">
                <span title="Engagement">
                  📊 {leadScore.factors.engagement}
                </span>
                <span title="Récence">
                  ⏱️ {leadScore.factors.recency}
                </span>
                <span title="Valeur">
                  💰 {leadScore.factors.value}
                </span>
                <span title="Complétude profil">
                  👤 {leadScore.factors.fit}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Aucun contact à évaluer</p>
        </div>
      )}
    </div>
  );
};

export default LeadScoring;
