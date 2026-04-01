import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['1'], description: 'Go to Overview' },
        { keys: ['2'], description: 'Go to Snippets' },
        { keys: ['3'], description: 'Go to Collections' },
        { keys: ['4'], description: 'Go to Members' },
        { keys: ['5'], description: 'Go to Settings' }
      ]
    },
    {
      category: 'Quick Actions',
      items: [
        { keys: ['⌘', 'N'], description: 'Create New Snippet' },
        { keys: ['⌘', 'K'], description: 'Open Search' },
        { keys: ['Esc'], description: 'Close Modal' }
      ]
    },
    {
      category: 'Search & Filter',
      items: [
        { keys: ['/', 'focus'], description: 'Focus Search' },
        { keys: ['⌘', 'F'], description: 'Advanced Search' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-card rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden transform transition-all"
        onClick={(e) => e?.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-card/20 rounded-lg flex items-center justify-center">
                <Icon name="Keyboard" size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
                <p className="text-purple-100 text-sm">Navigate faster with shortcuts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-8">
            {shortcuts?.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
                  {section?.category}
                </h3>
                <div className="space-y-3">
                  {section?.items?.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors"
                    >
                      <span className="text-foreground">{item?.description}</span>
                      <div className="flex items-center gap-1">
                        {item?.keys?.map((key, keyIdx) => (
                          <React.Fragment key={keyIdx}>
                            <kbd className="px-3 py-1.5 text-sm font-semibold bg-muted border-2 border-border rounded-lg shadow-sm">
                              {key}
                            </kbd>
                            {keyIdx < item?.keys?.length - 1 && (
                              <span className="text-muted-foreground mx-1">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 bg-background">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Press <kbd className="px-2 py-1 text-xs bg-card border border-border rounded shadow-sm">?</kbd> anytime to view shortcuts
            </p>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}