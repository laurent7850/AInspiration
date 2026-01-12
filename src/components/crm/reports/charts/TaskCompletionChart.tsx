import React, { useEffect, useState } from 'react';
import { Task } from '../../../../utils/types';

interface TaskCompletionChartProps {
  tasks: Task[];
}

const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({ tasks }) => {
  const [monthlyData, setMonthlyData] = useState<{
    month: string;
    completed: number;
    total: number;
    rate: number;
  }[]>([]);

  useEffect(() => {
    // Get the last 6 months
    const today = new Date();
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      
      return {
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        date: date,
        completed: 0,
        total: 0,
        rate: 0
      };
    }).reverse();
    
    // Group tasks by month
    tasks.forEach(task => {
      // Use created_at date for grouping
      const taskDate = new Date(task.created_at || new Date());
      
      // Find the month this task belongs to
      const monthData = lastSixMonths.find(m => {
        return taskDate.getMonth() === m.date.getMonth() && 
               taskDate.getFullYear() === m.date.getFullYear();
      });
      
      if (monthData) {
        monthData.total++;
        if (task.completed) {
          monthData.completed++;
        }
      }
    });
    
    // Calculate completion rates
    const data = lastSixMonths.map(month => ({
      ...month,
      rate: month.total > 0 ? (month.completed / month.total) * 100 : 0
    }));
    
    setMonthlyData(data);
  }, [tasks]);

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-indigo-600 rounded-full mr-1.5"></div>
            <span className="text-xs text-gray-600">Taux de complétion</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-indigo-200 rounded-full mr-1.5"></div>
            <span className="text-xs text-gray-600">Tâches totales</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-end h-52 space-x-6">
        {monthlyData.map((data, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="h-40 w-full relative flex items-end">
              {/* Background bar representing total tasks */}
              <div
                className="bg-indigo-200 w-full rounded-t-sm"
                style={{ 
                  height: `${Math.max((data.total / Math.max(...monthlyData.map(d => d.total), 1)) * 100, 5)}%` 
                }}
              >
              </div>
              
              {/* Overlay bar representing completion rate */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-t-sm"
                style={{ 
                  height: `${data.rate}%`,
                }}
              >
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600 text-center">
              <div>{data.month}</div>
              <div className="mt-1 text-indigo-600 font-semibold">{Math.round(data.rate)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskCompletionChart;