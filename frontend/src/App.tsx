import { TaskProvider } from './contexts/TaskContext';
import { TaskList } from './components/TaskList';
import { TaskStats } from './components/TaskStats';

function App() {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Todo App</h1>
            <p className="text-gray-600">Manage your tasks efficiently</p>
          </header>

          <TaskStats />
          <TaskList />
        </div>
      </div>
    </TaskProvider>
  );
}

export default App;
