import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
      {/* Overlay to ensure readability */}
      <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px]"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 m-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full mb-4 shadow-inner">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Log in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80 ml-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <input
                type="password"
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
