import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CodeViewer = ({ snippet }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('code'); // 'code' or 'preview'
  const [previewError, setPreviewError] = useState(null);
  const [previewHTML, setPreviewHTML] = useState('');
  const [validationWarnings, setValidationWarnings] = useState([]);
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  // Validate code for common visibility issues
  const validateCode = (code) => {
    const warnings = [];
    
    if (!code) {
      warnings?.push({
        type: 'error',
        message: 'No code content found',
        suggestion: 'Add code to the snippet to enable preview'
      });
      return warnings;
    }

    // Check for broken/incorrect image URLs
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    const imgMatches = [...code?.matchAll(imgRegex)];
    imgMatches?.forEach(match => {
      const src = match?.[1];
      if (src?.startsWith('http://')) {
        warnings?.push({
          type: 'warning',
          message: `Insecure image URL detected: ${src?.substring(0, 50)}...`,
          suggestion: 'Replace http:// with https:// for secure loading'
        });
      }
      if (src && !src?.startsWith('http') && !src?.startsWith('data:') && !src?.startsWith('/')) {
        warnings?.push({
          type: 'warning',
          message: `Relative image path may not load: ${src}`,
          suggestion: 'Use absolute URLs or data URIs for images in snippets'
        });
      }
    });

    // Check for broken/incorrect links
    const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
    const linkMatches = [...code?.matchAll(linkRegex)];
    linkMatches?.forEach(match => {
      const href = match?.[1];
      if (href === '#' || href === '') {
        warnings?.push({
          type: 'info',
          message: 'Empty or placeholder link detected',
          suggestion: 'Add valid href attributes to links for proper functionality'
        });
      }
    });

    // Check for external CSS/JS that might fail to load
    const cssLinkRegex = /<link[^>]+href=["']([^"']+)["'][^>]*>/gi;
    const cssMatches = [...code?.matchAll(cssLinkRegex)];
    cssMatches?.forEach(match => {
      const href = match?.[1];
      if (href && !href?.startsWith('http') && !href?.startsWith('//')) {
        warnings?.push({
          type: 'warning',
          message: `External CSS may not load: ${href}`,
          suggestion: 'Use CDN URLs (https://) for external stylesheets'
        });
      }
    });

    // Check for external scripts that might fail
    const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
    const scriptMatches = [...code?.matchAll(scriptRegex)];
    scriptMatches?.forEach(match => {
      const src = match?.[1];
      if (src && !src?.startsWith('http') && !src?.startsWith('//')) {
        warnings?.push({
          type: 'warning',
          message: `External script may not load: ${src}`,
          suggestion: 'Use CDN URLs (https://) for external scripts'
        });
      }
      // Check for blocked sandbox features
      if (code?.includes('localStorage') || code?.includes('sessionStorage')) {
        warnings?.push({
          type: 'error',
          message: 'Code uses localStorage/sessionStorage which is blocked in preview sandbox',
          suggestion: 'Remove storage API calls for preview compatibility'
        });
      }
    });

    // Check for React component issues
    if (snippet?.language?.toLowerCase() === 'jsx' || code?.includes('React')) {
      if (!code?.includes('export default') && !code?.includes('export function')) {
        warnings?.push({
          type: 'warning',
          message: 'React component may not export properly',
          suggestion: 'Ensure component is exported with "export default ComponentName"'
        });
      }
      
      // Check for missing imports in JSX
      if (code?.includes('useState') && !code?.includes('import')) {
        warnings?.push({
          type: 'error',
          message: 'React hooks used without proper imports',
          suggestion: 'Add "import { useState } from \'react\'" at the top'
        });
      }
    }

    // Check for CORS-prone external resources
    const externalResourceRegex = /(https?:\/\/[^"'\s<>]+)/gi;
    const externalMatches = [...code?.matchAll(externalResourceRegex)];
    const domains = new Set();
    externalMatches?.forEach(match => {
      try {
        const url = new URL(match[1]);
        domains?.add(url?.hostname);
      } catch (e) {
        // Invalid URL, skip
      }
    });
    
    if (domains?.size > 3) {
      warnings?.push({
        type: 'warning',
        message: `Loading resources from ${domains?.size} external domains`,
        suggestion: 'Some resources may fail due to CORS restrictions'
      });
    }

    return warnings;
  };

  // Detect if snippet is a UX/UI component
  const isUXComponent = () => {
    const uxLanguages = ['html', 'css', 'jsx', 'tsx'];
    const hasHTMLTags = snippet?.code?.includes('<') && snippet?.code?.includes('>');
    const hasReactJSX = snippet?.language === 'javascript' && (
      snippet?.code?.includes('return (') || 
      snippet?.code?.includes('return(') ||
      snippet?.code?.includes('React.createElement')
    );
    
    return uxLanguages?.includes(snippet?.language?.toLowerCase()) || hasHTMLTags || hasReactJSX;
  };

  // Generate preview HTML for sandboxed iframe
  const generatePreviewHTML = () => {
    if (!snippet?.code) return '';

    const code = snippet?.code;
    const language = snippet?.language?.toLowerCase();

    // For HTML snippets
    if (language === 'html' || (code?.includes('<html') && code?.includes('</html>'))) {
      return code;
    }

    // For CSS snippets
    if (language === 'css') {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${code}</style>
          </head>
          <body>
            <div class="preview-demo">
              <h2>CSS Preview</h2>
              <div class="demo-element">Demo Element</div>
              <button class="demo-button">Button</button>
              <div class="demo-box">Box</div>
            </div>
          </body>
        </html>
      `;
    }

    // For React/JSX components
    if ((language === 'javascript' || language === 'typescript' || language === 'jsx' || language === 'tsx') && 
        (code?.includes('return (') || code?.includes('return('))) {
      
      // Extract component code
      let componentCode = code;
      
      // Wrap in minimal React app
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              }
              * { box-sizing: border-box; }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel">
              ${componentCode}
              
              // Find the component function
              const componentNames = Object.keys(window).filter(key => 
                typeof window[key] === 'function' && 
                key[0] === key[0].toUpperCase() &&
                !['React', 'ReactDOM', 'Babel'].includes(key)
              );
              
              const Component = componentNames.length > 0 ? window[componentNames[0]] : null;
              
              if (Component) {
                const root = ReactDOM.createRoot(document.getElementById('root'));
                root.render(React.createElement(Component));
              } else {
                document.getElementById('root').innerHTML = '<p style="color: red;">Could not find React component</p>';
              }
            </script>
          </body>
        </html>
      `;
    }

    // For HTML fragments (no full HTML structure)
    if (code?.includes('<') && code?.includes('>')) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              }
            </style>
          </head>
          <body>
            ${code}
          </body>
        </html>
      `;
    }

    return '';
  };

  // Monitor iframe loading and detect issues
  const handleIframeLoad = () => {
    try {
      const iframe = iframeRef?.current;
      if (!iframe) return;

      // Check if iframe content is blank/empty
      setTimeout(() => {
        try {
          // Note: We can't access iframe content due to sandbox, but we can detect if it loaded
          const contentLoaded = iframe?.contentWindow !== null;
          if (!contentLoaded && validationWarnings?.length === 0) {
            setPreviewError('Preview failed to load. The content may contain errors or blocked resources.');
          }
        } catch (e) {
          // Expected error due to sandbox - this is normal
          console.log('Iframe sandbox restriction (expected):', e?.message);
        }
      }, 1000);
    } catch (error) {
      console.error('Iframe load monitoring error:', error);
    }
  };

  // Update preview HTML when switching to preview mode
  useEffect(() => {
    if (viewMode === 'preview' && isUXComponent()) {
      try {
        // Validate code first
        const warnings = validateCode(snippet?.code);
        setValidationWarnings(warnings);

        // Check for critical errors that prevent rendering
        const criticalErrors = warnings?.filter(w => w?.type === 'error');
        if (criticalErrors?.length > 0) {
          setPreviewError(`Cannot render preview: ${criticalErrors?.[0]?.message}`);
          setPreviewHTML('');
          return;
        }

        const html = generatePreviewHTML();
        if (!html) {
          setPreviewError('Unable to generate preview for this code type');
          setPreviewHTML('');
          return;
        }

        setPreviewHTML(html);
        setPreviewError(null);
      } catch (error) {
        console.error('Preview error:', error);
        setPreviewError('Failed to render preview. Please check code syntax.');
        setValidationWarnings([{
          type: 'error',
          message: error?.message,
          suggestion: 'Fix syntax errors in the code'
        }]);
      }
    }
  }, [viewMode, snippet?.code]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(snippet?.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([snippet?.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snippet?.title?.replace(/\s+/g, '_')}.${snippet?.language}`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewAIReport = () => {
    navigate(`/ai-optimization-report?snippetId=${snippet?.id}`);
  };

  const canShowPreview = isUXComponent();

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Icon name="Code2" size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{snippet?.language}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {snippet?.code?.split('\n')?.length} lines
          </span>
          {canShowPreview && (
            <span className="px-2 py-0.5 bg-primary/100/10 border border-purple-500/20 rounded text-xs text-primary font-medium">
              UX Component
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canShowPreview && (
            <div className="flex items-center gap-1 mr-2 bg-background border border-border rounded-md p-1">
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'code' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Code2" size={14} className="inline mr-1" />
                Code
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  viewMode === 'preview' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Eye" size={14} className="inline mr-1" />
                Preview
              </button>
            </div>
          )}
          <Button
            variant="primary"
            size="sm"
            iconName="Sparkles"
            iconPosition="left"
            onClick={handleViewAIReport}
            className="bg-gradient-to-r from-primary to-secondary hover:from-purple-700 hover:to-blue-700"
          >
            AI Report
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName={copied ? "Check" : "Copy"}
            iconPosition="left"
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={handleDownload}
          >
            Download
          </Button>
        </div>
      </div>
      {/* Validation Warnings Banner */}
      {validationWarnings?.length > 0 && viewMode === 'preview' && (
        <div className="border-b border-border bg-warning/10 dark:bg-yellow-900/10">
          <div className="px-4 py-3">
            <div className="flex items-start gap-2 mb-2">
              <Icon name="AlertTriangle" size={18} className="text-warning dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                  Preview Visibility Issues Detected ({validationWarnings?.length})
                </h4>
                <div className="space-y-2">
                  {validationWarnings?.map((warning, index) => (
                    <div key={index} className="text-xs">
                      <div className="flex items-start gap-2">
                        <Icon 
                          name={warning?.type === 'error' ? 'XCircle' : warning?.type === 'warning' ? 'AlertCircle' : 'Info'} 
                          size={14} 
                          className={`mt-0.5 flex-shrink-0 ${
                            warning?.type === 'error' ? 'text-error' : 
                            warning?.type === 'warning'? 'text-warning' : 'text-primary'
                          }`}
                        />
                        <div>
                          <p className="text-foreground dark:text-muted-foreground font-medium">
                            {warning?.message}
                          </p>
                          <p className="text-muted-foreground dark:text-muted-foreground mt-0.5">
                            💡 {warning?.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => setViewMode('code')}
            >
              View Code to Fix Issues
            </Button>
          </div>
        </div>
      )}
      {/* Content */}
      <div className="relative">
        {viewMode === 'code' ? (
          // Code View
          (<pre className="p-4 overflow-x-auto bg-background text-foreground font-mono text-sm leading-relaxed">
            <code>{snippet?.code}</code>
          </pre>)
        ) : (
          // Preview View
          (<div className="relative bg-card" style={{ minHeight: '400px' }}>
            {previewError ? (
              <div className="p-8 text-center">
                <Icon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
                <p className="text-error font-medium mb-2">Preview Error</p>
                <p className="text-sm text-muted-foreground mb-4">{previewError}</p>
                {validationWarnings?.length > 0 && (
                  <div className="mb-4 text-left max-w-md mx-auto">
                    <p className="text-xs font-semibold text-foreground mb-2">Common causes:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      {validationWarnings?.slice(0, 3)?.map((w, i) => (
                        <li key={i}>{w?.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setViewMode('code')}
                >
                  View Code Instead
                </Button>
              </div>
            ) : previewHTML ? (
              <iframe
                ref={iframeRef}
                title="Component Preview"
                srcDoc={previewHTML}
                sandbox="allow-scripts"
                className="w-full border-0"
                style={{ minHeight: '400px', height: '100%' }}
                onLoad={handleIframeLoad}
              />
            ) : (
              <div className="p-8 text-center">
                <Icon name="Eye" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium mb-2">No Preview Available</p>
                <p className="text-sm text-muted-foreground">
                  This code type cannot be previewed in the browser
                </p>
              </div>
            )}
            {previewHTML && !previewError && (
              <div className="absolute top-2 right-2 bg-black/10 backdrop-blur-sm px-3 py-1.5 rounded-md">
                <span className="text-xs font-medium text-white flex items-center gap-1">
                  <Icon name="Eye" size={12} />
                  Live Preview
                </span>
              </div>
            )}
          </div>)
        )}
      </div>
    </div>
  );
};

export default CodeViewer;