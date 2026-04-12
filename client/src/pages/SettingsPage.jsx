import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Settings as SettingsIcon, Moon, Sun, Monitor, Bell, Shield, KeyRound, User as UserIcon, X, Check } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  
  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Edit Profile State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || '');

  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (editUsername.trim() !== '') {
      await updateUser(editUsername.trim());
      setIsEditModalOpen(false);
    }
  };

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
            <div className="w-8 h-8 bg-gradient-to-tr from-gray-700 to-gray-900 dark:from-gray-500 dark:to-gray-700 rounded-lg flex items-center justify-center">
              <SettingsIcon className="text-white w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800/80 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl rounded-full"></div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.username || 'Guest User'}</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Personal Account</p>
              
              <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl transition-colors"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-xl transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Preferences */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white px-2">Preferences</h3>
            
            <div className="bg-white dark:bg-gray-800/80 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                    <Monitor size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Appearance</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Customize how AppCenter looks</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                      theme === 'light' 
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                        : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <Sun size={20} className={theme === 'light' ? 'text-indigo-500' : ''} />
                    <span className="text-xs font-medium">Light</span>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                      theme === 'dark' 
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                        : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <Moon size={20} className={theme === 'dark' ? 'text-indigo-500' : ''} />
                    <span className="text-xs font-medium">Dark</span>
                  </button>
                  <button 
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                      theme === 'system' 
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                        : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <Monitor size={20} className={theme === 'system' ? 'text-indigo-500' : ''} />
                    <span className="text-xs font-medium">System</span>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Notifications</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Manage email & alerts</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Push Notifications</span>
                    <div className="relative inline-flex items-center">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </div>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer pb-4 border-b border-gray-100 dark:border-gray-700/50">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Updates</span>
                    <div className="relative inline-flex items-center">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white px-2">Account Security</h3>
            
            <div className="bg-white dark:bg-gray-800/80 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-2 sm:p-4">
                
                <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                      <KeyRound size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">Change Password</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Update your security key</p>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">Two-Factor Auth</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of protection</p>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
                </div>

              </div>
              
              <div className="bg-rose-50/50 dark:bg-rose-500/5 p-6 border-t border-rose-100 dark:border-rose-500/10">
                <h4 className="font-semibold text-rose-600 dark:text-rose-400 mb-2">Danger Zone</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Permanently remove your account and all associated data.</p>
                <button className="px-4 py-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-xl transition-colors">
                  Delete Account
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsEditModalOpen(false)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                    placeholder="Enter new username"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
