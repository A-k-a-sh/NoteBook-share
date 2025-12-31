
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Share2, Eye, Code, Loader2, X, Download } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import NotebookViewer from '../components/NotebookViewer';
import { StoredNotebook } from '../types';
import { getAllNotebooks, deleteNotebook } from '../utils/storage';

const LocalViewer: React.FC = () => {
  const [notebooks, setNotebooks] = useState<StoredNotebook[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [viewRaw, setViewRaw] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await getAllNotebooks();
        setNotebooks(saved);
        if (saved.length > 0) {
          setActiveId(saved[0].id);
        }
      } catch (err) {
        console.error('Failed to load notebooks from storage', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteNotebook(id);
      const updated = notebooks.filter(nb => nb.id !== id);
      setNotebooks(updated);
      if (activeId === id) {
        setActiveId(updated.length > 0 ? updated[0].id : null);
      }
    } catch (err) {
      console.error('Failed to delete notebook', err);
      alert('Failed to delete notebook from database.');
    }
  };

  const handleDownload = () => {
    if (!activeNotebook) return;
    
    const jsonString = JSON.stringify(activeNotebook.data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeNotebook.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeNotebook = notebooks.find(nb => nb.id === activeId);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading your notebooks...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden relative">
      {/* Sidebar Overlay for Mobile */}
      {showSidebar && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity" 
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar - Fixed on Mobile, Relative on Desktop */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        ${showSidebar ? 'translate-x-0' : '-translate-x-full md:hidden'}
        w-80 h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900
      `}>
        <div className="md:hidden absolute top-4 right-4 z-50">
          <button onClick={() => setShowSidebar(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar 
          notebooks={notebooks} 
          activeId={activeId} 
          onSelect={(id) => {
            setActiveId(id);
            // On mobile, close sidebar after selection
            if (window.innerWidth < 768) setShowSidebar(false);
          }} 
          onDelete={handleDelete} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-950 overflow-hidden relative transition-all duration-300">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500 transition-colors"
              title="Toggle sidebar"
            >
              {showSidebar && window.innerWidth >= 768 ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-lg font-bold truncate max-w-[150px] sm:max-w-xs md:max-w-md">
              {activeNotebook ? activeNotebook.name : 'Select a Notebook'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {activeNotebook && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  title="Download notebook"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={() => setViewRaw(!viewRaw)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    viewRaw 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {viewRaw ? <Eye className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                  <span className="hidden sm:inline">{viewRaw ? 'Preview' : 'View JSON'}</span>
                </button>
                
                {/* <button
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all shadow-sm active:scale-95"
                  onClick={() => alert('Backend public link creation is disabled in this frontend-only demo.')}
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Link</span>
                </button> */}
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeNotebook ? (
            viewRaw ? (
              <div className="max-w-5xl mx-auto h-full animate-in fade-in zoom-in-95 duration-200">
                <pre className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 font-mono text-sm overflow-auto max-h-[80vh]">
                  {JSON.stringify(activeNotebook.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <NotebookViewer notebook={activeNotebook.data} />
              </div>
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
              <div className="bg-gray-100 dark:bg-gray-900 p-8 rounded-full mb-6">
                <Eye className="w-16 h-16 text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No notebook selected</h2>
              <p className="text-gray-500 max-w-xs mx-auto">
                Select a notebook from the sidebar or upload a new one to start viewing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalViewer;
