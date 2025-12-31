
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Github, BookOpen } from 'lucide-react';
import HomePage from './pages/HomePage';
import LocalViewer from './pages/LocalViewer';

const AppContent: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              NotebookShare
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'}`}
            >
              Upload
            </Link>
            <Link 
              to="/local" 
              className={`text-sm font-medium transition-colors ${location.pathname === '/local' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600'}`}
            >
              Local Viewer
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </nav>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/local" element={<LocalViewer />} />
          {/* Catch-all to handle GitHub URLs pasted directly in the URL bar */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <footer className="py-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 bg-white dark:bg-gray-900 transition-colors">
        <p>© {new Date().getFullYear()} NotebookShare. All rights reserved.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
