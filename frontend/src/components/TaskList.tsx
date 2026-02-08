import { useState, useEffect } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { TaskItem } from './TaskItem';
import { TaskFilters } from './TaskFilters';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { TaskForm } from './TaskForm';
import { TaskDetail } from './TaskDetail';
import type { Task } from '../types/task';

export const TaskList = () => {
  const { tasks, loading, error, fetchTasks } = useTasks();
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('created');
  const [isCompleted, setIsCompleted] = useState<boolean | undefined>(undefined);
  const [todoStateId, setTodoStateId] = useState<number | undefined>(undefined);
  const [assignedToId, setAssignedToId] = useState<number | undefined>(undefined);
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [viewingTaskId, setViewingTaskId] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    // Handle special case: -1 means unassigned
    const assigneeFilter = assignedToId === -1 ? undefined : assignedToId;
    const unassignedOnly = assignedToId === -1 ? true : undefined;
    fetchTasks(filter || undefined, sortBy, isCompleted, todoStateId, assigneeFilter, unassignedOnly, projectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sortBy, isCompleted, todoStateId, assignedToId, projectId]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleView = (task: Task) => {
    setViewingTaskId(task.id);
  };

  const handleCreateSubtask = (parentTaskId: number) => {
    // Create a dummy task object with parentTaskId set to indicate we're creating a subtask
    const parentTask = tasks.find(t => t.id === parentTaskId);
    if (parentTask) {
      // Create a new task object with parentTaskId set, but no id (so it's treated as new)
      setEditingTask({ 
        ...parentTask, 
        id: 0, 
        title: '', 
        description: '',
        parentTaskId: parentTaskId,
        projectId: parentTask.projectId || null, // Inherit project
      } as Task);
      setShowForm(true);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (draggedIndex === null) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    e.preventDefault();

    // Reorder tasks locally
    const newTasks = [...tasks];
    const [draggedTask] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(dropIndex, 0, draggedTask);

    // Update order in backend
    try {
      setIsReordering(true);
      const taskIds = newTasks.map(t => t.id);
      await taskApi.reorder(taskIds);
      await fetchTasks(filter || undefined, sortBy, isCompleted, todoStateId, assignedToId === -1 ? undefined : assignedToId, assignedToId === -1 ? true : undefined, projectId);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to reorder tasks';
      alert(errorMsg);
      await fetchTasks(filter || undefined, sortBy, isCompleted, todoStateId, assignedToId === -1 ? undefined : assignedToId, assignedToId === -1 ? true : undefined, projectId);
    } finally {
      setIsReordering(false);
      setDraggedIndex(null);
      setDragOverIndex(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
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
            projectId={projectId}
            onFilterChange={setFilter}
            onSortChange={setSortBy}
            onStatusChange={setIsCompleted}
            onStateChange={setTodoStateId}
            onAssigneeChange={setAssignedToId}
            onProjectChange={setProjectId}
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
              {tasks.length > 1 && (
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md mb-2">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 Drag tasks by the grip icon to reorder them
                  </p>
                </div>
              )}
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`relative transition-all ${
                    draggedIndex === index
                      ? 'opacity-50 scale-95 z-50'
                      : dragOverIndex === index
                      ? 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                >
                  {/* Drag Handle */}
                  <div
                    draggable={!isReordering}
                    onDragStart={(e) => {
                      handleDragStart(index);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={handleDragEnd}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2"
                    title="Drag to reorder"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      handleDragOver(e, index);
                    }}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    className="pl-10"
                  >
                    <TaskItem task={task} onEdit={handleEdit} onView={handleView} />
                  </div>
                </div>
              ))}
              {isReordering && (
                <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Saving new order...
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Task Detail Modal */}
      {viewingTaskId !== null && (
        <TaskDetail
          taskId={viewingTaskId}
          onClose={() => setViewingTaskId(null)}
          onEdit={handleEdit}
          onCreateSubtask={handleCreateSubtask}
        />
      )}
    </div>
  );
};

