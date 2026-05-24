import React from 'react';

/**
 * MessageBubble component. Renders chat bubble for user or AI messages, and handles loading indicator.
 * @param {Object} props
 * @param {Object} props.msg message content structure
 * @returns {React.ReactElement}
 */
export function MessageBubble({ msg }) {
  const isUser = msg.sender === 'user';
  const now = new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  if (msg.isTyping) {
    return (
      <div className="flex flex-col gap-1 max-w-[85%] self-start items-start animate-[slide-up-msg_0.25s_ease-out]">
        <div className="flex items-center gap-1.5 py-3 px-4 bg-bg border border-border rounded-2xl shadow-sm">
          <div className="w-1.5 h-1.5 bg-purple rounded-full animate-[bounce-dot_1.2s_infinite_ease-in-out]" />
          <div className="w-1.5 h-1.5 bg-purple rounded-full animate-[bounce-dot_1.2s_infinite_ease-in-out_0.2s]" />
          <div className="w-1.5 h-1.5 bg-purple rounded-full animate-[bounce-dot_1.2s_infinite_ease-in-out_0.4s]" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col gap-1 max-w-[85%] animate-[slide-up-msg_0.25s_ease-out] ${
        isUser ? 'self-end items-end' : 'self-start items-start'
      }`}
    >
      <div 
        className={`py-2.5 px-4 text-[12.5px] leading-relaxed shadow-sm transition-all duration-200 ${
          isUser 
            ? 'bg-gradient-to-br from-purple to-indigo-600 text-white rounded-[16px_16px_4px_16px] font-semibold border border-purple-pale/10' 
            : 'bg-surface border border-border/80 text-text rounded-[16px_16px_16px_4px] hover:border-purple/30'
        }`}
        dangerouslySetInnerHTML={{ __html: msg.text }}
      />
      <span className="text-[9px] text-text-muted px-1.5 font-bold">{now}</span>
    </div>
  );
}
export default MessageBubble;
