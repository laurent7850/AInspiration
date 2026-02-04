import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Lightbulb,
  Target,
  Users,
  ChevronRight
} from 'lucide-react';
import { Opportunity, Task, Contact } from '../../utils/types';
import { getAIInsights, AIInsight } from '../../services/n8nService';
import { generateDashboardInsights } from '../../services/openRouterService';

interface AIInsightsProps {
  opportunities: Opportunity[];
  tasks: Task[];
  contacts: Contact[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ opportunities, tasks, contacts }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInsights = async () => {
    try {
      // Charger les insights via n8n
      const n8nInsights = await getAIInsights(opportunities, tasks, contacts);
      setInsights(n8nInsights);

      // Charger les insights via OpenRouter (IA générative)
      const stats = {
        totalOpportunities: opportunities.length,
        activeOpportunities: opportunities.filter(o => !['Gagné', 'Perdu'].includes(o.stage)).length,
        totalValue: opportunities.reduce((sum, o) => sum + (o.estimated_value || 0), 0),
        wonValue: opportunities.filter(o => o.stage === 'Gagné').reduce((sum, o) => sum + (o.estimated_value || 0), 0),
        winRate: calculateWinRate(opportunities),
        pendingTasks: tasks.filter(t => !t.completed).length,
        overdueTasks: tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date()).length,
        totalContacts: contacts.length,
      };

      const generatedInsights = await generateDashboardInsights(stats);
      if (generatedInsights) {
        setAiInsights(generatedInsights);
      }
    } catch (error) {
      console.error('Erreur chargement insights:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateWinRate = (opps: Opportunity[]): number => {
    const closed = opps.filter(o => ['Gagné', 'Perdu'].includes(o.stage));
    if (closed.length === 0) return 0;
    const won = opps.filter(o => o.stage === 'Gagné').length;
    return Math.round((won / closed.length) * 100);
  };

  useEffect(() => {
    loadInsights();
  }, [opportunities, tasks, contacts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return <Target className="w-5 h-5" />;
      case 'task':
        return <CheckCircle className="w-5 h-5" />;
      case 'contact':
        return <Users className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getPriorityBadge = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Insights IA</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin opacity-70" />
          <span className="ml-3 opacity-70">Analyse en cours...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-lg font-semibold">Insights IA</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
          title="Actualiser les insights"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* AI Generated Insights */}
      {aiInsights.length > 0 && (
        <div className="mb-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb className="w-4 h-4" />
            <span className="text-sm font-medium opacity-90">Analyse IA</span>
          </div>
          <ul className="space-y-2">
            {aiInsights.map((insight, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Structured Insights */}
      {insights.length > 0 ? (
        <div className="space-y-3">
          {insights.slice(0, 4).map((insight) => (
            <div
              key={insight.id}
              className={`p-3 rounded-lg border ${getPriorityColor(insight.priority)} bg-white/90 backdrop-blur-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 text-gray-600">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{insight.description}</p>
                    {insight.action && (
                      <p className="text-sm text-indigo-600 font-medium mt-1">
                        → {insight.action}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  {getPriorityBadge(insight.priority)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 opacity-80">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-60" />
          <p>Tout est en ordre ! Aucune action prioritaire détectée.</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">{opportunities.filter(o => o.stage === 'Négociation').length}</div>
          <div className="text-xs opacity-70">En négociation</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{tasks.filter(t => !t.completed && t.priority === 'high').length}</div>
          <div className="text-xs opacity-70">Tâches urgentes</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{calculateWinRate(opportunities)}%</div>
          <div className="text-xs opacity-70">Taux conversion</div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
