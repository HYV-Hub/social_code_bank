import React, { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import php from 'highlight.js/lib/languages/php';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import dart from 'highlight.js/lib/languages/dart';

const langs = { javascript, python, typescript, java, cpp, csharp, ruby, go, rust, php, sql, xml, css, bash, json, yaml, markdown, swift, kotlin, dart };
Object.entries(langs).forEach(([name, lang]) => hljs.registerLanguage(name, lang));

// Alias mappings
const aliasMap = { js: 'javascript', ts: 'typescript', py: 'python', rb: 'ruby', rs: 'rust', sh: 'bash', shell: 'bash', jsx: 'javascript', tsx: 'typescript', vue: 'xml', svelte: 'xml', html: 'xml', htm: 'xml' };

const CodeBlock = ({ code, language, maxLines, showLineNumbers = false, showCopy = true, className = '' }) => {
  const codeRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const resolvedLang = aliasMap[language?.toLowerCase()] || language?.toLowerCase() || 'plaintext';

  useEffect(() => {
    if (codeRef.current && code) {
      try {
        if (hljs.getLanguage(resolvedLang)) {
          const result = hljs.highlight(code, { language: resolvedLang, ignoreIllegals: true });
          codeRef.current.innerHTML = result.value;
        } else {
          const result = hljs.highlightAuto(code);
          codeRef.current.innerHTML = result.value;
        }
      } catch {
        codeRef.current.textContent = code;
      }
    }
  }, [code, resolvedLang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const displayCode = maxLines ? code?.split('\n').slice(0, maxLines).join('\n') : code;
  const truncated = maxLines && code?.split('\n').length > maxLines;

  return (
    <div className={`relative group rounded-lg overflow-hidden border border-border ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {language || 'code'}
        </span>
        {showCopy && (
          <button
            onClick={handleCopy}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        )}
      </div>

      {/* Code area */}
      <pre className={`overflow-x-auto p-4 text-sm leading-relaxed ${showLineNumbers ? 'pl-12' : ''}`}
        style={{ background: 'var(--color-card)' }}
      >
        {showLineNumbers && (
          <div className="absolute left-0 top-[34px] bottom-0 w-10 flex flex-col items-end pr-2 pt-4 text-xs text-muted-foreground select-none border-r border-border"
            style={{ background: 'var(--color-muted)' }}
          >
            {displayCode?.split('\n').map((_, i) => (
              <div key={i} className="leading-relaxed">{i + 1}</div>
            ))}
          </div>
        )}
        <code ref={codeRef} className="hljs font-mono">
          {displayCode}
        </code>
      </pre>

      {truncated && (
        <div className="px-3 py-1.5 bg-muted/30 border-t border-border text-xs text-muted-foreground text-center">
          +{code.split('\n').length - maxLines} more lines
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
