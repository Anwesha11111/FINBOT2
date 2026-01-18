
import React from 'react';
import { Message } from '../types';
import { User, Bot, Clock } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onSuggestionClick: (suggestion: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSuggestionClick }) => {
  const isBot = message.role === 'model';

  // Simple Markdown-like renderer
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold headers
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace('### ', '')}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>;
      
      // List items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return <li key={i} className="ml-6 list-disc mb-1">{line.trim().substring(2)}</li>;
      }
      
      // Step numbers
      if (/^\d+\./.test(line.trim())) {
        return <li key={i} className="ml-6 list-decimal mb-1 font-medium text-slate-800">{line.trim()}</li>;
      }

      // Regular text with bold support
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-2 leading-relaxed">
          {parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={idx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className={`flex w-full mb-8 ${isBot ? 'justify-start' : 'justify-end animate-in fade-in slide-in-from-bottom-2'}`}>
      <div className={`flex max-w-[85%] lg:max-w-[70%] ${isBot ? 'flex-row' : 'flex-row-reverse'} gap-4`}>
        <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
          isBot ? 'bg-blue-100 text-blue-600' : 'bg-slate-800 text-white'
        }`}>
          {isBot ? <Bot size={20} /> : <User size={20} />}
        </div>
        
        <div className="flex flex-col gap-2">
          <div className={`p-4 rounded-2xl shadow-sm ${
            isBot 
              ? 'bg-white text-slate-700 border border-slate-100' 
              : 'bg-blue-600 text-white'
          }`}>
            <div className="text-sm">
              {renderContent(message.content)}
            </div>
            
            <div className={`flex items-center gap-1 mt-3 text-[10px] ${isBot ? 'text-slate-400' : 'text-blue-100'}`}>
              <Clock size={10} />
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {isBot && message.suggestions && message.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs rounded-full border border-slate-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
