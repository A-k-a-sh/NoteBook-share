
import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

declare var katex: any;

interface MarkdownCellProps {
  source: string | string[];
}

const MarkdownCell: React.FC<MarkdownCellProps> = ({ source }) => {
  const content = Array.isArray(source) ? source.join('') : source;
  const [katexReady, setKatexReady] = useState(false);
  
  useEffect(() => {
    // Wait for KaTeX to load
    const checkKatex = () => {
      if (typeof katex !== 'undefined') {
        setKatexReady(true);
      } else {
        setTimeout(checkKatex, 100);
      }
    };
    checkKatex();
  }, []);
  
  const renderMarkdown = () => {
    let output = content;
    
    // Only process if KaTeX is available
    if (katexReady && typeof katex !== 'undefined') {
      const mathBlocks: string[] = [];
      
      // 1. Shield and render display math $$...$$
      output = output.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
        const id = `SHIELDEDMATH${mathBlocks.length}ENDSHIELD`;
        try {
          const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
          mathBlocks.push(rendered);
        } catch (e) {
          mathBlocks.push(match);
        }
        return id;
      });
      
      // 2. Shield and render LaTeX environments
      output = output.replace(/\\begin\{(aligned|equation|align|gather|eqnarray)\}([\s\S]*?)\\end\{\1\}/g, (match) => {
        const id = `SHIELDEDMATH${mathBlocks.length}ENDSHIELD`;
        try {
          const rendered = katex.renderToString(match, { displayMode: true, throwOnError: false });
          mathBlocks.push(rendered);
        } catch (e) {
          mathBlocks.push(match);
        }
        return id;
      });
      
      // 3. Shield and render inline math $...$
      output = output.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
        const id = `SHIELDEDMATH${mathBlocks.length}ENDSHIELD`;
        try {
          const rendered = katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
          mathBlocks.push(rendered);
        } catch (e) {
          mathBlocks.push(match);
        }
        return id;
      });
      
      // 4. Parse markdown with shielded math
      const rawHtml = marked.parse(output) as string;
      
      // 5. Unshield math blocks - use a more aggressive replacement
      let finalHtml = rawHtml;
      mathBlocks.forEach((rendered, i) => {
        const placeholder = `SHIELDEDMATH${i}ENDSHIELD`;
        // Try multiple patterns to catch any escaping marked might have done
        finalHtml = finalHtml.split(placeholder).join(rendered);
        finalHtml = finalHtml.split(`<p>${placeholder}</p>`).join(`<div class="katex-display my-4">${rendered}</div>`);
        finalHtml = finalHtml.split(`<code>${placeholder}</code>`).join(rendered);
      });
      
      // 6. Sanitize with permissive KaTeX settings
      const cleanHtml = DOMPurify.sanitize(finalHtml, {
        ADD_TAGS: ['annotation', 'math', 'maction', 'maligngroup', 'malignmark', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mlongdiv', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mscarries', 'mscarry', 'msgroup', 'msline', 'mspace', 'msqrt', 'msrow', 'mstack', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover', 'semantics'],
        ADD_ATTR: ['accent', 'accentunder', 'align', 'alignunder', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns', 'aria-hidden']
      });
      
      return { __html: cleanHtml };
    } else {
      // Fallback without KaTeX - just render markdown
      const rawHtml = marked.parse(output);
      const cleanHtml = DOMPurify.sanitize(rawHtml as string);
      return { __html: cleanHtml };
    }
  };

  return (
    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none px-4 py-2 my-2">
      <div dangerouslySetInnerHTML={renderMarkdown()} />
    </div>
  );
};

export default MarkdownCell;
