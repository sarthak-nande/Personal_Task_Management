import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Wallet, LogOut, LayoutGrid, Settings, User, Utensils, Car, ShoppingBag, Zap, Home, Coffee, ArrowRight, ChevronRight, CheckSquare, Circle, CheckCircle, Plus, FolderPlus, ListTodo } from 'lucide-react';

const CATEGORIES = {
  food: { label: 'Food & Dining', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/10' },
  transport: { label: 'Transport', icon: Car, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/10' },
  shopping: { label: 'Shopping', icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/10' },
  utilities: { label: 'Utilities', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-500/10' },
  housing: { label: 'Housing', icon: Home, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-500/10' },
  other: { label: 'Other', icon: Coffee, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-500/10' },
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate Balance and Recent Transactions from API
  const [balance, setBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  // Lists and Tasks state
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const [walletRes, listsRes, tasksRes] = await Promise.all([
          fetch('/api/wallet', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/customlists', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (walletRes.ok) {
          const data = await walletRes.json();
          const today = new Date();
          const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
          const monthData = data[currentMonth];
          if (monthData) {
            if (monthData.budget !== undefined) {
              const totalExpense = monthData.transactions ? monthData.transactions.reduce((acc, tx) => acc + (tx.type === 'income' ? 0 : tx.amount), 0) : 0;
              const totalIncome = monthData.transactions ? monthData.transactions.reduce((acc, tx) => acc + (tx.type === 'income' ? tx.amount : 0), 0) : 0;
              setBalance(monthData.budget + totalIncome - totalExpense);
            }
            if (monthData.transactions && monthData.transactions.length > 0) {
              const sorted = [...monthData.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
              setRecentTransactions(sorted.slice(0, 3));
            }
          }
        }
        
        if (listsRes.ok) setLists(await listsRes.json());
        if (tasksRes.ok) setTasks(await tasksRes.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      setTasks(tasks.map(t => t._id === taskId ? { ...t, isCompleted: !currentStatus } : t));
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isCompleted: !currentStatus })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const apps = [
    {
      id: 'wallet',
      name: 'MyWallet',
      description: 'Track your monthly expenses and manage your budget.',
      icon: <Wallet className="w-10 h-10 mb-4 text-white" />,
      color: 'from-blue-500 to-indigo-600',
      path: '/wallet'
    },
    {
      id: 'tasks',
      name: 'Daily Tasks',
      description: 'Manage and track your daily tasks effectively.',
      icon: <CheckSquare className="w-10 h-10 mb-4 text-white" />,
      color: 'from-emerald-400 to-teal-600',
      path: '/tasks',
      disabled: false
    },
    {
      id: 'lists',
      name: 'My Lists',
      description: 'Create and manage custom checklists and notes.',
      icon: <FolderPlus className="w-10 h-10 mb-4 text-white" />,
      color: 'from-purple-400 to-pink-500',
      path: '/lists',
      disabled: false
    },
    {
      id: 'settings',
      name: 'Settings',
      description: 'Account and appearance settings.',
      icon: <Settings className="w-10 h-10 mb-4 text-white" />,
      color: 'from-gray-500 to-gray-700 dark:from-gray-600 dark:to-gray-800',
      path: '/settings',
      disabled: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419]">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#1a202c]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <LayoutGrid className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            AppCenter
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-sm">
              <User size={16} />
            </div>
            <div className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
              {user?.username || 'Guest'}
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2.5 text-gray-600 hover:text-destructive dark:text-gray-400 dark:hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-all"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Premium Payment App Balance Card */}
        <div 
          className="bg-gradient-to-tr from-gray-900 via-[#1a1c29] to-gray-800 dark:from-black dark:via-gray-900 dark:to-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl shadow-gray-900/30 dark:shadow-black/50 relative overflow-hidden mb-10 w-full flex flex-col items-center justify-center text-center border border-gray-700/50"
        >
          {/* Abstract background glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full"></div>
          
          <div className="relative z-10 space-y-2">
            <p className="text-gray-400 text-sm md:text-base font-medium tracking-wide uppercase flex items-center justify-center gap-2">
              <Wallet size={18} className="text-blue-400" /> Total Balance
            </p>
            <h3 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 tracking-tight">
              ₹{balance.toLocaleString()}
            </h3>
            <p className="text-emerald-400/90 text-sm font-medium pt-2">
              Available to spend this month
            </p>
          </div>
        </div>



        {/* Micro Apps Mobile View (Payment App Style Icons) */}
        <div className="sm:hidden grid grid-cols-4 gap-y-6 gap-x-2 mb-12">
          {apps.map((app) => (
            <div 
              key={app.id} 
              className={`flex flex-col items-center gap-2 cursor-pointer group ${app.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform'}`}
              onClick={() => !app.disabled && navigate(app.path)}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${app.color} shadow-lg shadow-gray-500/20`}>
                <div className="text-white transform scale-75">
                  {app.icon}
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center leading-tight">
                {app.name}
              </span>
            </div>
          ))}
        </div>

        {/* Micro Apps Desktop Layout */}
        <div className="hidden sm:block">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white px-1 mb-4">All Applications</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {apps.map((app) => (
            <div
              key={app.id}
              onClick={() => !app.disabled && navigate(app.path)}
              className={`
                relative group overflow-hidden rounded-3xl p-6 aspect-square cursor-pointer
                transition-all duration-300 transform outline-none
                ${app.disabled ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-2 hover:shadow-2xl'}
              `}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-90 transition-opacity group-hover:opacity-100`}></div>
              
              {/* Glass Overlay effect */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-block p-3 rounded-2xl bg-white/20 backdrop-blur-md mb-4 shadow-inner border border-white/20">
                    {app.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{app.name}</h3>
                </div>
                
                <div>
                  <p className="text-white/80 text-sm font-medium line-clamp-2">
                    {app.description}
                  </p>
                </div>
              </div>

              {/* Decorative Circle */}
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
            </div>
          ))}
        </div>
        </div>
      </main>
    </div>
  );
}
