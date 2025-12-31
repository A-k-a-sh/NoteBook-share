
import React, { useEffect, useRef } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeCellProps {
  source: string | string[];
  executionCount?: number | null;
}

const CodeCell: React.FC<CodeCellProps> = ({ source, executionCount }) => {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = React.useState(false);
  const codeContent = Array.isArray(source) ? source.join('') : source;

  useEffect(() => {
    if (codeRef.current && (window as any).Prism) {
      (window as any).Prism.highlightElement(codeRef.current);
    }
  }, [codeContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative flex gap-2 font-mono text-sm my-1">
      <div className="w-16 pt-3 flex flex-col items-end flex-shrink-0 select-none">
        <span className="text-blue-600 dark:text-blue-400 font-medium">
          In [{executionCount ?? ' '}] :
        </span>
      </div>
      
      <div className="flex-1 relative bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded bg-white/50 dark:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black"
          title="Copy code"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
        </button>
        
        <pre className="m-0 p-3 overflow-x-auto leading-relaxed">
          <code ref={codeRef} className="language-python">
            {codeContent}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeCell;
