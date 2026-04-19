import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  ArrowLeft, Wallet, TrendingDown, TrendingUp, IndianRupee, 
  Plus, Calendar, History, Trash2, Edit3, Check, X,
  ShoppingBag, Utensils, Car, Zap, Home, MoreHorizontal
} from 'lucide-react';

const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: <Utensils size={16} />, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
  { id: 'transport', label: 'Transport', icon: <Car size={16} />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { id: 'shopping', label: 'Shopping', icon: <ShoppingBag size={16} />, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { id: 'utilities', label: 'Utilities', icon: <Zap size={16} />, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
  { id: 'housing', label: 'Housing', icon: <Home size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { id: 'other', label: 'Other', icon: <MoreHorizontal size={16} />, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-500/10' }
];

export default function MyWalletPage() {
  const navigate = useNavigate();
  
  // Base State
  const [data, setData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // Load from API
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('/api/wallet', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const fetchedData = await res.json();
          setData(fetchedData);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  // Save to API
  useEffect(() => {
    const saveData = async () => {
      if (Object.keys(data).length > 0) {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          await fetch('/api/wallet', {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
          });
        } catch (e) {
          console.error(e);
        }
      }
    };
    saveData();
  }, [data]);

  // UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form States
  const [budgetInput, setBudgetInput] = useState('');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('other');

  // Edit States
  const [editingTxId, setEditingTxId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('other');

  const [txError, setTxError] = useState('');
  const [editError, setEditError] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  const currentData = data[currentMonth] || { budget: 0, transactions: [] };
  const totalSpent = currentData.transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const remaining = currentData.budget - totalSpent;

  // Pagination Logic
  const totalPages = Math.ceil(currentData.transactions.length / transactionsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const indexOfLastTx = currentPage * transactionsPerPage;
  const indexOfFirstTx = indexOfLastTx - transactionsPerPage;
  const currentTransactions = currentData.transactions.slice(indexOfFirstTx, indexOfLastTx);

  const handleSetBudget = (e) => {
    e.preventDefault();
    if (!budgetInput || isNaN(budgetInput)) return;
    
    setData(prev => ({
      ...prev,
      [currentMonth]: {
        ...prev[currentMonth] || { transactions: [] },
        budget: parseFloat(budgetInput)
      }
    }));
    setBudgetInput('');
    setIsEditingBudget(false);
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(txAmount);
    if (!txTitle || !txAmount || isNaN(amountNum)) return;

    if (amountNum > remaining) {
      setTxError(`Cannot exceed remaining budget of ₹${remaining.toLocaleString()}`);
      return;
    }
    setTxError('');

    const newTx = {
      id: Date.now().toString(),
      title: txTitle,
      amount: amountNum,
      category: txCategory,
      date: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      [currentMonth]: {
        ...prev[currentMonth] || { budget: 0 },
        transactions: [newTx, ...(prev[currentMonth]?.transactions || [])]
      }
    }));
    setTxTitle('');
    setTxAmount('');
    setTxCategory('other');
  };

  const startEditTx = (tx) => {
    setEditingTxId(tx.id);
    setEditTitle(tx.title);
    setEditAmount(tx.amount.toString());
    setEditCategory(tx.category || 'other');
    setEditError('');
  };

  const cancelEditTx = () => {
    setEditingTxId(null);
    setEditError('');
  };

  const saveEditTx = (id) => {
    const amountNum = parseFloat(editAmount);
    if (!editTitle || !editAmount || isNaN(amountNum)) return;
    
    const oldTx = currentData.transactions.find(t => t.id === id);
    if (oldTx) {
      const difference = amountNum - oldTx.amount;
      if (difference > remaining) {
        setEditError(`Cannot exceed remaining budget of ₹${remaining.toLocaleString()}`);
        return;
      }
    }
    setEditError('');

    setData(prev => ({
      ...prev,
      [currentMonth]: {
        ...prev[currentMonth],
        transactions: prev[currentMonth].transactions.map(tx => 
          tx.id === id 
            ? { ...tx, title: editTitle, amount: amountNum, category: editCategory }
            : tx
        )
      }
    }));
    setEditingTxId(null);
  };

  const handleDeleteTx = (id) => {
    setData(prev => ({
      ...prev,
      [currentMonth]: {
        ...prev[currentMonth],
        transactions: prev[currentMonth].transactions.filter(tx => tx.id !== id)
      }
    }));
  };

  // Generate last 6 months for selector
  const getMonthsList = () => {
    const months = [];
    const d = new Date();
    for (let i = 0; i < 6; i++) {
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('default', { month: 'long', year: 'numeric' });
      months.push({ val, label });
      d.setMonth(d.getMonth() - 1);
    }
    return months;
  };

  // Group transactions by category for the chart
  const getChartData = () => {
    const categoryTotals = {};
    
    // Initialize with 0 for all categories to ensure they show up in the chart
    CATEGORIES.forEach(c => {
      categoryTotals[c.id] = {
        name: c.label,
        amount: 0,
        fill: c.color.replace('text-', 'var(--').replace('-500', ')').replace('gray', 'slate') // A slightly hacky way to get a solid color, better to define hex
      };
    });

    // Provide explicit hex colors matching the Tailwind classes
    const colorMap = {
      'food': '#f97316', // orange-500
      'transport': '#3b82f6', // blue-500
      'shopping': '#a855f7', // purple-500
      'utilities': '#eab308', // yellow-500
      'housing': '#10b981', // emerald-500
      'other': '#64748b' // slate-500
    };

    currentData.transactions.forEach(tx => {
      const catId = tx.category || 'other';
      if (categoryTotals[catId]) {
        categoryTotals[catId].amount += tx.amount;
        categoryTotals[catId].fill = colorMap[catId];
      }
    });

    return Object.values(categoryTotals).filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount);
  };

  const chartData = getChartData();
  const spentPercentage = currentData.budget > 0 ? (totalSpent / currentData.budget) * 100 : 0;

  // Prepare category data for Circular Progress Rings
  const categoryData = Object.keys(CATEGORIES).map(key => {
    // CATEGORIES is an array of objects
    const defaultCat = CATEGORIES.find(c => c.id === key) || CATEGORIES[key]; // Fallback if key is index
    if (!defaultCat) return null;

    const categorySpent = currentData.transactions
      .filter(tx => tx.category === defaultCat.id)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const percentageOfTotal = currentData.budget > 0 ? (categorySpent / currentData.budget) * 100 : 0;

    return {
      id: defaultCat.id,
      ...defaultCat,
      spent: categorySpent,
      percentage: percentageOfTotal,
      strokeDasharray: `${percentageOfTotal}, 100` // For SVG circle stroke
    };
  }).filter(cat => cat && cat.spent > 0).sort((a,b) => b.spent - a.spent);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] font-sans selection:bg-primary/30">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#1a202c]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Wallet className="text-white w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">MyWallet</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          
          {/* Mobile View: Calendar Icon Toggle */}
          <button 
            className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Calendar size={20} />
          </button>
          
          {/* Desktop View: Select Dropdown */}
          <div className="hidden sm:flex items-center gap-2">
            <Calendar className="text-gray-400 w-5 h-5" />
            <select 
              className="bg-gray-100 dark:bg-gray-800 border-none text-sm font-medium rounded-xl px-4 py-2 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary outline-none cursor-pointer"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
            >
              {getMonthsList().map(m => (
                <option key={m.val} value={m.val}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Mobile View: Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden absolute top-12 right-0 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
              <div className="p-2">
                {getMonthsList().map(m => (
                  <button
                    key={m.val}
                    className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                      currentMonth === m.val 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      setCurrentMonth(m.val);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Budget & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="md:col-span-2 bg-gradient-to-br from-gray-900 via-[#1a1c29] to-gray-800 dark:from-black dark:via-gray-900 dark:to-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-gray-400 font-medium tracking-wide uppercase text-sm">Monthly Budget</p>
                  <button 
                    onClick={() => {
                      setBudgetInput(currentData.budget > 0 ? currentData.budget.toString() : '');
                      setIsEditingBudget(true);
                    }}
                    className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>
                
                {currentData.budget === 0 || isEditingBudget ? (
                  <form onSubmit={handleSetBudget} className="flex flex-col sm:flex-row gap-3 mt-4">
                    <input
                      type="number"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="flex-1 bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
                      placeholder="Enter amount (₹)"
                      autoFocus
                    />
                    <div className="flex gap-2">
                       <button type="submit" className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors">
                        Save
                      </button>
                      <button type="button" onClick={() => { setBudgetInput(''); setIsEditingBudget(false); }} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <h3 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                    ₹{currentData.budget.toLocaleString()}
                  </h3>
                )}
              </div>
              
              <div className="mt-8">
                <div className="flex justify-between text-sm font-medium mb-3">
                  <span className="text-gray-400">Total Spent: <span className="text-white">₹{totalSpent.toLocaleString()}</span></span>
                  <span className="text-emerald-400">Remaining: ₹{remaining.toLocaleString()}</span>
                </div>
                
                {/* Total Budget Progress Bar */}
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700/50">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                      spentPercentage > 90 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 
                      spentPercentage > 75 ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 
                      'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                    }`}
                    style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800/80 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">Total Transactions</p>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {currentData.transactions.length}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">Average Expense</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{currentData.transactions.length > 0 ? Math.round(totalSpent / currentData.transactions.length).toLocaleString() : 0}
            </h3>
          </div>
        </div>

        {/* Category Progress Rings Grid */}
        {categoryData.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white px-1 mb-4">Spending by Category</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categoryData.map(cat => {
                // Simple SVG Circle logic for the ring
                const radius = 36;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (cat.percentage / 100) * circumference;

                return (
                  <div key={cat.id} className="bg-white dark:bg-gray-800/80 rounded-3xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center relative hover:-translate-y-1 transition-transform cursor-pointer group">
                    
                    {/* SVG Circular Ring */}
                    <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Background Ring */}
                        <circle 
                          cx="48" cy="48" r={radius}
                          className="stroke-gray-100 dark:stroke-gray-700 fill-none"
                          strokeWidth="8"
                        />
                        {/* Progress Ring */}
                        <circle 
                          cx="48" cy="48" r={radius}
                          className={`${cat.color.replace('text-', 'stroke-')} fill-none transition-all duration-1000 ease-out`}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                        />
                      </svg>
                      {/* Icon in Center */}
                      <div className={`absolute select-none w-12 h-12 rounded-full flex items-center justify-center ${cat.bg} ${cat.color}`}>
                        {cat.icon}
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white text-center line-clamp-1">{cat.label}</h4>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">₹{cat.spent.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{cat.percentage.toFixed(0)}% of budget</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Form & Chart */}
          <div className="lg:col-span-1">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-sm sticky top-28">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Plus className="text-blue-500" size={20} /> Add Expense
              </h3>
              
              {txError && (
                <div className="mb-4 p-3 text-sm text-rose-600 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl">
                  {txError}
                </div>
              )}
              
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Title</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Groceries"
                    value={txTitle}
                    onChange={(e) => setTxTitle(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Amount (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <IndianRupee className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="number"
                      required
                      min="1"
                      placeholder="0.00"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Category</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={currentData.budget === 0}
                  className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
                >
                  {currentData.budget === 0 ? 'Set Budget First' : 'Add Transaction'}
                </button>
              </form>
            </div>
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800/80 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <History className="text-blue-500" size={20} /> Transaction History
                </h3>
                <span className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-xs font-semibold px-3 py-1 rounded-full">
                  {currentData.transactions.length} items
                </span>
              </div>

              {currentData.transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500 dark:text-gray-400">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-4">
                    <IndianRupee size={24} className="opacity-50" />
                  </div>
                  <p>No transactions found for this month.</p>
                  <p className="text-sm mt-1 opacity-70">Add an expense to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentTransactions.map((tx) => {
                    const catObj = CATEGORIES.find(c => c.id === tx.category) || CATEGORIES.find(c => c.id === 'other');
                    const isEditing = editingTxId === tx.id;
                    
                    if (isEditing) {
                      return (
                        <div key={tx.id} className="p-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-primary/50 shadow-md transition-all space-y-4">
                          {editError && (
                            <div className="p-2 text-sm text-rose-600 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg">
                              {editError}
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input 
                              type="text" 
                              value={editTitle} 
                              onChange={(e) => setEditTitle(e.target.value)} 
                              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                            />
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                              <input 
                                type="number" 
                                value={editAmount} 
                                onChange={(e) => setEditAmount(e.target.value)} 
                                className="w-full pl-7 pr-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-sm outline-none focus:border-primary"
                              />
                            </div>
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary cursor-pointer"
                            >
                              {CATEGORIES.map(c => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button onClick={cancelEditTx} className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors">
                              Cancel
                            </button>
                            <button onClick={() => saveEditTx(tx.id)} className="px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-1">
                              <Check size={14} /> Save
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={tx.id} 
                        className="group flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${catObj.bg} ${catObj.color} rounded-xl flex items-center justify-center shadow-sm`}>
                            {catObj.icon}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{tx.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                              <span>{catObj.label}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                              <span>
                                {new Date(tx.date).toLocaleDateString('en-US', { 
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                })}
                              </span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900 dark:text-white mr-2">
                            -₹{tx.amount.toLocaleString()}
                          </span>
                          <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => startEditTx(tx)}
                              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-all"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTx(tx.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                          currentPage === i + 1 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
