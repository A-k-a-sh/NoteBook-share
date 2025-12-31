
import React from 'react';
import { NotebookData } from '../types';
import CodeCell from './CodeCell';
import MarkdownCell from './MarkdownCell';
import OutputCell from './OutputCell';

interface NotebookViewerProps {
  notebook: NotebookData;
  title?: string;
}

const NotebookViewer: React.FC<NotebookViewerProps> = ({ notebook, title }) => {
  if (!notebook || !notebook.cells) {
    return (
      <div className="p-12 text-center text-gray-500">
        No notebook content found.
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      {title && (
        <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">{title}</h1>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>Kernel: {notebook.metadata?.kernelspec?.display_name || 'Unknown'}</span>
            <span>Format: v{notebook.nbformat}.{notebook.nbformat_minor}</span>
          </div>
        </div>
      )}

      {notebook.cells.map((cell, idx) => (
        <div key={idx} className="notebook-cell">
          {cell.cell_type === 'markdown' && (
            <MarkdownCell source={cell.source} />
          )}
          
          {cell.cell_type === 'code' && (
            <div className="space-y-1">
              <CodeCell 
                source={cell.source} 
                executionCount={cell.execution_count} 
              />
              {cell.outputs && cell.outputs.map((output, oIdx) => (
                <OutputCell key={oIdx} output={output} />
              ))}
            </div>
          )}

          {cell.cell_type === 'raw' && (
            <pre className="p-4 bg-gray-100 dark:bg-gray-800 text-sm overflow-auto">
              {Array.isArray(cell.source) ? cell.source.join('') : cell.source}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotebookViewer;
