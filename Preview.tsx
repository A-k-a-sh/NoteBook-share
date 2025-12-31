
import React, { useMemo, useRef } from 'react';

declare var katex: any;

interface PreviewProps {
  content: string;
}

const Preview: React.FC<PreviewProps> = ({ content }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const translateUnicodeToLatex = (text: string) => {
    const map: Record<string, string> = {
      '√': '\\sqrt',
      'ᾱ': '\\bar{\\alpha}',
      'α': '\\alpha',
      'β': '\\beta',
      'ε': '\\epsilon',
      'λ': '\\lambda',
      'μ': '\\mu',
      'σ': '\\sigma',
      'π': '\\pi',
      'θ': '\\theta',
      'δ': '\\delta',
      'Δ': '\\Delta',
      'Σ': '\\Sigma',
      'Ω': '\\Omega',
      '∞': '\\infty',
      '≈': '\\approx',
      '≠': '\\neq',
      '±': '\\pm',
      '×': '\\times',
      '÷': '\\div',
      '≤': '\\le',
      '≥': '\\ge',
      '→': '\\rightarrow',
      '⇒': '\\Rightarrow',
      '∫': '\\int',
      '∂': '\\partial',
      '∇': '\\nabla',
      '⋅': '\\cdot',
      '∗': '\\ast',
      '…': '\\dots'
    };
    
    let processed = text;
    processed = processed.replace(/√\((.*?)\)/g, '\\sqrt{$1}');
    processed = processed.replace(/√([a-zA-Z0-9_ᾱα-ωΑ-Ω]+)/g, '\\sqrt{$1}');
    
    Object.keys(map).forEach(char => {
      processed = processed.split(char).join(map[char]);
    });
    
    return processed;
  };

  const htmlContent = useMemo(() => {
    if (!content) return '';
    let output = content;

    // 1. Shield Code Blocks
    const codeBlocks: string[] = [];
    output = output.replace(/```([\s\S]*?)```/g, (match, p1) => {
      const id = `__CODE_BLOCK_${codeBlocks.length}__`;
      const lines = p1.split('\n');
      const firstLine = lines[0].trim();
      const isMathBlock = firstLine === 'math';
      
      if (isMathBlock && typeof katex !== 'undefined') {
        let mathContent = translateUnicodeToLatex(lines.slice(1).join('\n').trim());
        try {
          codeBlocks.push(`<div class="katex-display">${katex.renderToString(mathContent, { displayMode: true, throwOnError: false })}</div>`);
        } catch { codeBlocks.push(`<pre><code>${escapeHtml(mathContent)}</code></pre>`); }
      } else {
        const langHint = lines.length > 1 && !firstLine.includes(' ') && firstLine.length > 0 ? firstLine : '';
        const codeContent = langHint ? lines.slice(1).join('\n') : p1;
        let processedCode = escapeHtml(codeContent.trim());
        
        if (typeof katex !== 'undefined') {
          processedCode = processedCode.replace(/\$([^\$\n]+?)\$/g, (m, math) => {
            try { return katex.renderToString(translateUnicodeToLatex(math), { displayMode: false, throwOnError: false }); }
            catch { return m; }
          });
        }
        codeBlocks.push(`<pre>${langHint ? `<span class="absolute top-2 right-3 text-[10px] text-slate-500 uppercase font-bold select-none">${langHint}</span>` : ''}<code>${processedCode}</code></pre>`);
      }
      return id;
    });

    // 2. Shield Math Blocks
    const mathBlocks: string[] = [];
    if (typeof katex !== 'undefined') {
      output = output.replace(/\$\$([\s\S]*?)\$\$/g, (match, p1) => {
        const id = `__MATH_BLOCK_${mathBlocks.length}__`;
        try { mathBlocks.push(`<div class="katex-display">${katex.renderToString(translateUnicodeToLatex(p1.trim()), { displayMode: true, throwOnError: false })}</div>`); }
        catch { mathBlocks.push(escapeHtml(match)); }
        return id;
      });
      output = output.replace(/\$([^\$\n]+?)\$/g, (match, p1) => {
        const id = `__MATH_BLOCK_${mathBlocks.length}__`;
        try { mathBlocks.push(katex.renderToString(translateUnicodeToLatex(p1.trim()), { displayMode: false, throwOnError: false })); }
        catch { mathBlocks.push(escapeHtml(match)); }
        return id;
      });
    }

    // 3. Process Markdown
    output = output
      .replace(/^# (.*$)/gm, (_, title) => `<h1 id="${slugify(title)}">${title}</h1>`)
      .replace(/^## (.*$)/gm, (_, title) => `<h2 id="${slugify(title)}">${title}</h2>`)
      .replace(/^### (.*$)/gm, (_, title) => `<h3 id="${slugify(title)}">${title}</h3>`)
      .replace(/^---$/gm, '<hr />')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" class="rounded-lg my-4" />')
      .replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
        if (url.startsWith('#')) {
          return `<a href="${url}" class="text-blue-400 hover:underline transition-all" data-anchor="true">${text}</a>`;
        }
        return `<a href="${url}" class="text-blue-400 underline" target="_blank">${text}</a>`;
      })
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');

    const lines = output.split('\n');
    let inBlockquote = false;
    let bqContent: string[] = [];
    const finalLines: string[] = [];

    lines.forEach(line => {
      if (line.startsWith('> ')) {
        inBlockquote = true;
        bqContent.push(line.substring(2));
      } else if (inBlockquote && (line.trim() === '' || !line.startsWith('> '))) {
        finalLines.push(`<blockquote>${bqContent.join('<br />')}</blockquote>`);
        bqContent = [];
        inBlockquote = false;
        if (line.trim() !== '') finalLines.push(line);
      } else {
        finalLines.push(line);
      }
    });
    if (inBlockquote) finalLines.push(`<blockquote>${bqContent.join('<br />')}</blockquote>`);
    output = finalLines.join('\n');
    
    output = output.replace(/(<li>.*<\/li>)/gs, (match) => {
      const isOrdered = /^\d+/.test(match.trim());
      const tag = isOrdered ? 'ol' : 'ul';
      const cls = isOrdered ? 'list-decimal pl-5 mb-4' : 'list-disc pl-5 mb-4';
      return `<${tag} class="${cls}">${match}</${tag}>`;
    });

    output = output.replace(/^(?!<[h|b|p|u|o|l|i|h|p|d|s])(.*$)/gm, '<p>$1</p>');

    // 4. Unshield
    mathBlocks.forEach((rendered, i) => output = output.replace(`__MATH_BLOCK_${i}__`, rendered));
    codeBlocks.forEach((rendered, i) => output = output.replace(`__CODE_BLOCK_${i}__`, rendered));

    return `<div class="preview-inner">${output}</div>`;
  }, [content]);

  const handleLinkClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor && anchor.dataset.anchor === 'true') {
      e.preventDefault();
      const id = anchor.getAttribute('href')?.substring(1);
      if (id) {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  return (
    <div 
      ref={scrollContainerRef}
      onClick={handleLinkClick}
      className="h-full w-full overflow-y-auto custom-scrollbar p-8 lg:p-12 bg-slate-900 scroll-smooth"
    >
      <div 
        className="max-w-3xl mx-auto markdown-content text-slate-300"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

function escapeHtml(text: string) {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export default Preview;
