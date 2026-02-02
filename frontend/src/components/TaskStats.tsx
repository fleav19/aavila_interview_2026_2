import { useTasks } from '../contexts/TaskContext';

export const TaskStats = () => {
  const { stats } = useTasks();

  if (!stats) return null;

  const statsItems = [
    { label: 'Total', value: stats.total, color: 'bg-gray-100 text-gray-800' },
    { label: 'Active', value: stats.active, color: 'bg-blue-100 text-blue-800' },
    { label: 'Completed', value: stats.completed, color: 'bg-green-100 text-green-800' },
    { label: 'High Priority', value: stats.highPriority, color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statsItems.map((item) => (
        <div
          key={item.label}
          className={`${item.color} p-4 rounded-lg shadow-sm text-center`}
        >
          <div className="text-2xl font-bold">{item.value}</div>
          <div className="text-sm mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

