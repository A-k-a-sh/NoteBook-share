
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, FileCode, CheckCircle2, AlertCircle, ArrowRight, Github, Globe, Loader2 } from 'lucide-react';
import { StoredNotebook } from '../types';
import { saveNotebook } from '../utils/storage';

const HomePage: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const processNotebookData = async (data: any, name: string, size: number) => {
    try {
      if (!data.cells || !Array.isArray(data.cells)) {
        throw new Error(`Invalid format in ${name}`);
      }

      const newNotebook: StoredNotebook = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        data: data,
        createdAt: Date.now(),
        size: size
      };

      await saveNotebook(newNotebook);
    } catch (err: any) {
      console.error('Storage error for:', name, err);
      throw err;
    }
  };

  const handleGithubFetch = async (targetUrl: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      let url = targetUrl.trim();
      
      if (!url.startsWith('http') && (url.includes('/') || url.includes('.ipynb'))) {
        url = `https://github.com/${url}`;
      }

      if (url.includes('github.com') && url.includes('/blob/')) {
        url = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch notebook: ${response.statusText}`);
      }

      const data = await response.json();
      const fileName = url.split('/').pop()?.split('?')[0] || 'remote-notebook.ipynb';
      const size = JSON.stringify(data).length;

      await processNotebookData(data, decodeURIComponent(fileName), size);
      setIsProcessing(false);
      navigate('/local');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notebook from source.');
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const path = location.pathname;
    if (path && path !== '/' && path !== '/local' && path.endsWith('.ipynb')) {
      handleGithubFetch(path.startsWith('/') ? path.substring(1) : path);
    }
  }, [location.pathname]);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    
    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!file.name.endsWith('.ipynb')) {
        errors.push(`${file.name}: Only .ipynb files supported.`);
        errorCount++;
        continue;
      }

      if (file.size > 15 * 1024 * 1024) { // Increased to 15MB for convenience
        errors.push(`${file.name}: Exceeds 15MB limit.`);
        errorCount++;
        continue;
      }

      try {
        const content = await file.text();
        const notebookData = JSON.parse(content);
        await processNotebookData(notebookData, file.name, file.size);
        processedCount++;
      } catch (err) {
        errors.push(`${file.name}: Parsing failed.`);
        errorCount++;
      }
    }

    if (errorCount > 0) {
      setError(`Processed ${processedCount} files. Errors: ${errors.join(' ')}`);
      setIsProcessing(false);
      // Even if some failed, if some succeeded, we might want to let the user see them
      if (processedCount > 0) {
        setTimeout(() => navigate('/local'), 3000);
      }
    } else if (processedCount > 0) {
      setIsProcessing(false);
      navigate('/local');
    } else {
      setIsProcessing(false);
    }
  }, [navigate]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Visualize & Share <br />
          <span className="text-blue-600">Jupyter Notebooks</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          The easiest way to view .ipynb files in your browser. Render markdown, 
          code outputs, and plots with high fidelity.
        </p>
      </div>

      <div className="space-y-8">
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative group border-2 border-dashed rounded-3xl p-10 md:p-16 transition-all duration-300 flex flex-col items-center justify-center text-center ${
            isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]' 
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 shadow-sm'
          }`}
        >
          <div className={`mb-6 p-6 rounded-2xl transition-transform duration-300 ${isDragging ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:scale-110'}`}>
            {isProcessing ? (
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            ) : (
              <Upload className="w-12 h-12" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold">
              {isDragging ? 'Drop them here!' : 'Drop your notebooks here'}
            </h3>
            <p className="text-gray-500">
              or click to select multiple files from your computer
            </p>
          </div>

          <input
            type="file"
            accept=".ipynb"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold">Import from GitHub</h4>
              <p className="text-xs text-gray-500">Paste a public .ipynb file URL</p>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleGithubFetch(githubUrl); }} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="https://github.com/user/repo/blob/main/notebook.ipynb"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
                disabled={isProcessing}
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing || !githubUrl.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 min-w-[120px]"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch'}
            </button>
          </form>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/20 px-6 py-4 rounded-2xl text-sm border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium whitespace-pre-wrap">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Multiple Uploads', desc: 'Select or drop multiple notebooks at once to build your local collection.' },
          { title: 'GitHub Integration', desc: 'Instantly view notebooks by pasting a URL or navigating to it in the URL bar.' },
          { title: 'Large File Support', desc: 'Optimized IndexedDB storage handles notebooks with many images and outputs.' }
        ].map((feature, i) => (
          <div key={i} className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
            <h4 className="font-bold mb-2">{feature.title}</h4>
            <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center">
        <button 
          onClick={() => navigate('/local')}
          className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
        >
          View your collection <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default HomePage;
