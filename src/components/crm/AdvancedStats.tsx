import { TrendingUp, TrendingDown, Minus, DollarSign, Clock, Target, BarChart2 } from 'lucide-react';
import { Opportunity, Task, Contact } from '../../utils/types';

interface AdvancedStatsProps {
  opportunities: Opportunity[];
  tasks: Task[];
  contacts: Contact[];
}

const AdvancedStats: React.FC<AdvancedStatsProps> = ({ opportunities, tasks, contacts }) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const wonOpportunities = opportunities.filter(opp => opp.stage === 'Gagné');
  const lostOpportunities = opportunities.filter(opp => opp.stage === 'Perdu');
  const activeOpportunities = opportunities.filter(opp =>
    opp.stage !== 'Gagné' && opp.stage !== 'Perdu'
  );

  const totalWonValue = wonOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
  const averageDealSize = wonOpportunities.length > 0
    ? totalWonValue / wonOpportunities.length
    : 0;

  const closedOpportunities = wonOpportunities.length + lostOpportunities.length;
  const winRate = closedOpportunities > 0
    ? (wonOpportunities.length / closedOpportunities * 100)
    : 0;

  const calculateAverageCycleTime = () => {
    const completedWithDates = wonOpportunities.filter(opp =>
      opp.created_at && opp.updated_at
    );

    if (completedWithDates.length === 0) return 0;

    const totalDays = completedWithDates.reduce((sum, opp) => {
      const created = new Date(opp.created_at!);
      const updated = new Date(opp.updated_at!);
      const days = Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / completedWithDates.length);
  };

  const averageCycleTime = calculateAverageCycleTime();

  const completedTasks = tasks.filter(task => task.completed).length;
  const taskCompletionRate = tasks.length > 0
    ? (completedTasks / tasks.length * 100)
    : 0;

  const activeContactsWithCompany = contacts.filter(c => c.company_id).length;
  const contactCompanyRate = contacts.length > 0
    ? (activeContactsWithCompany / contacts.length * 100)
    : 0;

  const pipelineValue = activeOpportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);

  type TrendType = 'up' | 'down' | 'neutral';

  const stats: Array<{
    label: string;
    value: string;
    icon: any;
    bgColor: string;
    iconColor: string;
    trend: TrendType;
    subtext: string;
  }> = [
    {
      label: 'CA moyen / affaire',
      value: formatCurrency(averageDealSize),
      icon: DollarSign,
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      trend: (wonOpportunities.length > 0 ? 'up' : 'neutral') as TrendType,
      subtext: `${wonOpportunities.length} affaires gagnées`
    },
    {
      label: 'Taux de conversion',
      value: `${winRate.toFixed(1)}%`,
      icon: Target,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: (winRate >= 50 ? 'up' : winRate >= 30 ? 'neutral' : 'down') as TrendType,
      subtext: `${wonOpportunities.length}/${closedOpportunities} gagnées`
    },
    {
      label: 'Cycle de vente moyen',
      value: `${averageCycleTime}j`,
      icon: Clock,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      trend: (averageCycleTime <= 30 ? 'up' : averageCycleTime <= 60 ? 'neutral' : 'down') as TrendType,
      subtext: averageCycleTime > 0 ? 'Durée moyenne' : 'Pas de données'
    },
    {
      label: 'Taux de complétion',
      value: `${taskCompletionRate.toFixed(0)}%`,
      icon: BarChart2,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      trend: (taskCompletionRate >= 80 ? 'up' : taskCompletionRate >= 50 ? 'neutral' : 'down') as TrendType,
      subtext: `${completedTasks}/${tasks.length} tâches`
    }
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques avancées</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow p-5">
            <div className="flex justify-between items-start mb-3">
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              {getTrendIcon(stat.trend)}
            </div>
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className={`text-xs ${getTrendColor(stat.trend)}`}>
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
          <h3 className="text-sm font-medium text-indigo-900 mb-2">Pipeline actif</h3>
          <p className="text-2xl font-bold text-indigo-600">{formatCurrency(pipelineValue)}</p>
          <p className="text-xs text-indigo-700 mt-1">{activeOpportunities.length} opportunités en cours</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <h3 className="text-sm font-medium text-green-900 mb-2">CA généré</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalWonValue)}</p>
          <p className="text-xs text-green-700 mt-1">Total des affaires gagnées</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
          <h3 className="text-sm font-medium text-purple-900 mb-2">Contacts actifs</h3>
          <p className="text-2xl font-bold text-purple-600">{contacts.length}</p>
          <p className="text-xs text-purple-700 mt-1">{contactCompanyRate.toFixed(0)}% liés à une entreprise</p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStats;
