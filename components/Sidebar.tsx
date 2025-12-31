
import React from 'react';
import { FileText, Trash2, ExternalLink, Clock, HardDrive } from 'lucide-react';
import { StoredNotebook } from '../types';

interface SidebarProps {
  notebooks: StoredNotebook[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ notebooks, activeId, onSelect, onDelete }) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-800 h-full flex flex-col bg-gray-50 dark:bg-gray-900/50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-blue-600" />
          Local Files
        </h2>
        <span className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">
          {notebooks.length} files
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {notebooks.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No notebooks uploaded yet.</p>
          </div>
        ) : (
          notebooks.map((nb) => (
            <div
              key={nb.id}
              onClick={() => onSelect(nb.id)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                activeId === nb.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className={`w-5 h-5 flex-shrink-0 ${activeId === nb.id ? 'text-white' : 'text-blue-500'}`} />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate" title={nb.name}>
                    {nb.name}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] opacity-70">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(nb.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{formatSize(nb.size)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(nb.id);
                  }}
                  className={`p-1.5 rounded-md hover:bg-red-500 hover:text-white transition-colors`}
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
