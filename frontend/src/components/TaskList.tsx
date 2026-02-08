import { useState, useEffect } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { TaskItem } from './TaskItem';
import { TaskFilters } from './TaskFilters';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { TaskForm } from './TaskForm';
import type { Task } from '../types/task';

export const TaskList = () => {
  const { tasks, loading, error, fetchTasks } = useTasks();
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('created');
  const [isCompleted, setIsCompleted] = useState<boolean | undefined>(undefined);
  const [todoStateId, setTodoStateId] = useState<number | undefined>(undefined);
  const [assignedToId, setAssignedToId] = useState<number | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    // Handle special case: -1 means unassigned
    const assigneeFilter = assignedToId === -1 ? undefined : assignedToId;
    const unassignedOnly = assignedToId === -1 ? true : undefined;
    fetchTasks(filter || undefined, sortBy, isCompleted, todoStateId, assigneeFilter, unassignedOnly);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sortBy, isCompleted, todoStateId, assignedToId]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  if (loading && tasks.length === 0) {
    return <LoadingSpinner message="Loading tasks..." />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} />}

      {showForm ? (
        <TaskForm
          task={editingTask}
          onCancel={handleCancel}
          onSubmitSuccess={handleFormSuccess}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
            >
              + New Task
            </button>
          </div>

          <TaskFilters
            filter={filter}
            sortBy={sortBy}
            isCompleted={isCompleted}
            todoStateId={todoStateId}
            assignedToId={assignedToId}
            onFilterChange={setFilter}
            onSortChange={setSortBy}
            onStatusChange={setIsCompleted}
            onStateChange={setTodoStateId}
            onAssigneeChange={setAssignedToId}
          />

          {loading && <LoadingSpinner message="Refreshing..." />}

          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {filter ? 'No tasks match your search.' : 'No tasks yet. Create your first task!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskItem key={task.id} task={task} onEdit={handleEdit} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

