interface TaskFiltersProps {
  filter: string;
  sortBy: string;
  isCompleted?: boolean;
  onFilterChange: (filter: string) => void;
  onSortChange: (sortBy: string) => void;
  onStatusChange: (isCompleted?: boolean) => void;
}

export const TaskFilters = ({
  filter,
  sortBy,
  isCompleted,
  onFilterChange,
  onSortChange,
  onStatusChange,
}: TaskFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            placeholder="Search tasks..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={isCompleted === undefined ? 'all' : isCompleted ? 'completed' : 'active'}
            onChange={(e) => {
              const value = e.target.value;
              onStatusChange(
                value === 'all' ? undefined : value === 'completed'
              );
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Tasks</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created">Newest First</option>
            <option value="title">Title</option>
            <option value="priority">Priority</option>
            <option value="duedate">Due Date</option>
          </select>
        </div>
      </div>
    </div>
  );
};

