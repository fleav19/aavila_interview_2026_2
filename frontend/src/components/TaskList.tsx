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
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    fetchTasks(filter || undefined, sortBy, isCompleted, todoStateId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sortBy, isCompleted, todoStateId]);

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
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + New Task
            </button>
          </div>

          <TaskFilters
            filter={filter}
            sortBy={sortBy}
            isCompleted={isCompleted}
            todoStateId={todoStateId}
            onFilterChange={setFilter}
            onSortChange={setSortBy}
            onStatusChange={setIsCompleted}
            onStateChange={setTodoStateId}
          />

          {loading && <LoadingSpinner message="Refreshing..." />}

          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-lg">
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

