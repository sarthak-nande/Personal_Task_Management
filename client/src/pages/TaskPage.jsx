import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, CheckCircle, Circle, Plus, Trash2, ListTodo, PartyPopper } from 'lucide-react';

const CATEGORIES = [
  'Work',
  'Personal',
  'Shopping',
  'Health',
  'General'
];

export default function TaskPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('General');
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error('Failed to fetch tasks', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTaskTitle, category: newTaskCategory })
      });

      if (res.ok) {
        const newTask = await res.json();
        setTasks([newTask, ...tasks]);
        setNewTaskTitle('');
        checkAllCompleted([newTask, ...tasks], false);
      }
    } catch (e) {
      console.error('Failed to add task', e);
    }
  };

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      // Optimistic upate
      const updatedTasks = tasks.map(t => t._id === taskId ? { ...t, isCompleted: !currentStatus } : t);
      setTasks(updatedTasks);
      
      if (!currentStatus) {
        checkAllCompleted(updatedTasks, true);
      } else {
        setShowCelebration(false);
      }

      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isCompleted: !currentStatus })
      });
    } catch (e) {
      console.error('Failed to update task', e);
      // Revert on failure
      fetchTasks();
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const updatedTasks = tasks.filter(t => t._id !== taskId);
      setTasks(updatedTasks);
      
      // If we deleted the last uncompleted task, maybe celebrate? 
      // But only if there are tasks left.
      if (updatedTasks.length > 0) {
        checkAllCompleted(updatedTasks, false);
      } else {
        setShowCelebration(false);
      }

      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error('Failed to delete task', e);
      fetchTasks();
    }
  };

  const checkAllCompleted = (currentTasks, triggeredByCompletion) => {
    if (currentTasks.length === 0) return;
    const allDone = currentTasks.every(t => t.isCompleted);
    if (allDone && triggeredByCompletion) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000); // hide after 5s
    } else if (!allDone) {
      setShowCelebration(false);
    }
  };

  // Group tasks by category
  const tasksByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = tasks.filter(t => t.category === cat);
    return acc;
  }, {});

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progressPercent = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-sm animate-in fade-in duration-500"></div>
          <div className="relative z-10 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center animate-in zoom-in spin-in-12 duration-500">
            <PartyPopper size={64} className="text-emerald-500 mb-4 animate-bounce" />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Congratulations!</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">You've completed all your tasks.</p>
          </div>
          {/* Confetti Particles CSS Animation */}
          {Array.from({ length: 50 }).map((_, i) => (
            <div 
              key={i}
              className={`absolute w-3 h-3 rounded-full ${['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'][i % 5]}`}
              style={{
                left: `${Math.random() * 100}vw`,
                top: `-5vh`,
                animation: `fall ${Math.random() * 3 + 2}s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            />
          ))}
          <style>{`
            @keyframes fall {
              to {
                transform: translateY(110vh) rotate(360deg);
              }
            }
          `}</style>
        </div>
      )}

      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-[#1a202c]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ListTodo className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Daily Tasks</h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-tight">Stay productive</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 w-full">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Today's Progress</h2>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
              {completedCount} of {tasks.length} tasks completed
            </p>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-500 shrink-0">
            <span className="text-xl font-bold">{progressPercent}%</span>
          </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
              required
            />
          </div>
          <div className="flex gap-3">
            <select
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-2xl px-4 py-4 text-gray-700 dark:text-gray-300 font-medium focus:ring-4 focus:ring-emerald-500/20 outline-none cursor-pointer appearance-none transition-all"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button 
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white rounded-2xl px-6 py-4 font-bold transition-all flex items-center justify-center shadow-lg shadow-emerald-500/30 group"
            >
              <Plus className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </form>

        {/* Categories & Tasks */}
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 px-4 bg-gray-100/50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <ListTodo className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No tasks yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Add your first task above to start organizing your day.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {CATEGORIES.map(category => {
              const catTasks = tasksByCategory[category];
              if (!catTasks || catTasks.length === 0) return null;

              return (
                <div key={category} className="animate-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">
                    {category}
                  </h3>
                  <div className="bg-white dark:bg-[#1a202c]/50 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                    {catTasks.map((task) => (
                      <div 
                        key={task._id} 
                        className={`group flex items-center justify-between p-4 sm:p-5 transition-all ${
                          task.isCompleted ? 'bg-gray-50/50 dark:bg-gray-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <div 
                          className="flex items-center gap-4 flex-1 cursor-pointer"
                          onClick={() => toggleTaskCompletion(task._id, task.isCompleted)}
                        >
                          <button 
                            className={`flex-shrink-0 transition-colors ${
                              task.isCompleted ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600 hover:text-emerald-400'
                            }`}
                          >
                            {task.isCompleted ? <CheckCircle size={24} className="fill-emerald-500/[0.1]" /> : <Circle size={24} />}
                          </button>
                          <span 
                            className={`text-base sm:text-lg font-medium transition-all duration-300 select-none flex-1 ${
                              task.isCompleted 
                                ? 'text-gray-400 dark:text-gray-600 line-through' 
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <button 
                          onClick={() => deleteTask(task._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                          title="Delete task"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
