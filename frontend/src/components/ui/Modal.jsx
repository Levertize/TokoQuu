import React from 'react';

/**
 * Reusable modal wrapper component.
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {string} props.title
 * @param {Function} props.onClose
 * @param {React.ReactNode} props.children
 * @returns {React.ReactElement}
 */
export function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg w-full max-w-[500px] shadow-2xl flex flex-col max-h-[85vh] animate-[fade-in_0.2s_ease-out]">
        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-center bg-[rgba(148,163,184,0.02)] shrink-0">
          <span className="text-base font-bold text-text">{title}</span>
          <button 
            className="text-text-secondary hover:bg-bg hover:text-text text-xl w-8 h-8 rounded-full flex items-center justify-center transition-colors" 
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Contents */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
export default Modal;
