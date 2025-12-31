
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { NotebookOutput } from '../types';

interface OutputCellProps {
  output: NotebookOutput;
}

const OutputCell: React.FC<OutputCellProps> = ({ output }) => {
  const renderContent = () => {
    switch (output.output_type) {
      case 'stream':
        const text = Array.isArray(output.text) ? output.text.join('') : output.text || '';
        return (
          <pre className={`p-3 text-xs md:text-sm font-mono whitespace-pre-wrap ${output.name === 'stderr' ? 'text-red-500 bg-red-50 dark:bg-red-950/20' : 'text-gray-700 dark:text-gray-300'}`}>
            {text}
          </pre>
        );

      case 'execute_result':
      case 'display_data':
        if (!output.data) return null;
        
        // Prioritize image/png or image/jpeg
        const imageData = output.data['image/png'] || output.data['image/jpeg'];
        if (imageData) {
          const src = `data:image/png;base64,${typeof imageData === 'string' ? imageData.replace(/\n/g, '') : imageData}`;
          return (
            <div className="p-3 bg-white dark:bg-white/5 rounded">
              <img src={src} alt="Cell Output" className="max-w-full h-auto mx-auto" />
            </div>
          );
        }

        // Handle HTML
        const htmlData = output.data['text/html'];
        if (htmlData) {
          const html = Array.isArray(htmlData) ? htmlData.join('') : htmlData;
          return (
            <div className="p-3 overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
          );
        }

        // Fallback to text
        const plainText = output.data['text/plain'];
        if (plainText) {
          const text = Array.isArray(plainText) ? plainText.join('') : plainText;
          return <pre className="p-3 text-xs md:text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{text}</pre>;
        }
        return null;

      case 'error':
        return (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 font-mono text-xs md:text-sm">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold mb-1">
              <AlertCircle className="w-4 h-4" />
              <span>{output.ename}: {output.evalue}</span>
            </div>
            {output.traceback && (
              <pre className="text-red-500/80 overflow-x-auto whitespace-pre">
                {output.traceback.join('\n')}
              </pre>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex gap-2 font-mono text-sm my-1">
      <div className="w-16 flex flex-col items-end flex-shrink-0 select-none">
        <span className="text-red-600 dark:text-red-400 font-medium">
          {output.execution_count ? `Out [${output.execution_count}]:` : ''}
        </span>
      </div>
      <div className="flex-1 rounded-md overflow-hidden bg-white/30 dark:bg-white/5">
        {renderContent()}
      </div>
    </div>
  );
};

export default OutputCell;
