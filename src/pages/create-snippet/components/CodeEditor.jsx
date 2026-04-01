import React, { useState } from 'react';



const CodeEditor = ({ 
  code, 
  setCode,
  errors 
}) => {
  const [lineNumbers, setLineNumbers] = useState(true);

  const handleCodeChange = (e) => {
    setCode(e?.target?.value);
  };

  const getLineCount = () => {
    return code?.split('\n')?.length;
  };

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(code);
  };

  const formatCode = () => {
    // Basic formatting - add proper indentation
    const lines = code?.split('\n');
    let indentLevel = 0;
    const formatted = lines?.map(line => {
      const trimmed = line?.trim();
      if (trimmed?.endsWith('{')) {
        const result = '  '?.repeat(indentLevel) + trimmed;
        indentLevel++;
        return result;
      } else if (trimmed?.startsWith('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
        return '  '?.repeat(indentLevel) + trimmed;
      }
      return '  '?.repeat(indentLevel) + trimmed;
    });
    setCode(formatted?.join('\n'));
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Code</h2>
        <p className="text-sm text-muted-foreground">
          Write your code below. AI will automatically detect the programming language.
        </p>
      </div>
      
      <div className="relative">
        {lineNumbers && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted border-r border-border py-4 text-right pr-2 select-none">
            {Array.from({ length: getLineCount() }, (_, i) => (
              <div key={i} className="text-xs text-muted-foreground leading-6 font-mono">
                {i + 1}
              </div>
            ))}
          </div>
        )}
        
        <textarea
          className={`w-full min-h-[500px] p-4 ${lineNumbers ? 'pl-16' : 'pl-4'} font-mono text-sm text-foreground focus:outline-none resize-none bg-card`}
          placeholder="// Start typing or paste your code here...\n\nfunction example() {\n  return 'Hello World';\n}"
          value={code}
          onChange={handleCodeChange}
          spellCheck="false"
        />
      </div>
      {errors?.code && (
        <div className="px-4 py-3 bg-error/10 border-t border-error/20">
          <p className="text-sm text-error">{errors?.code}</p>
        </div>
      )}
      <div className="px-4 py-2 bg-muted border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{getLineCount()} lines</span>
          <span>{code?.length} characters</span>
          <span>{code?.split(/\s+/)?.filter(w => w?.length > 0)?.length} words</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;