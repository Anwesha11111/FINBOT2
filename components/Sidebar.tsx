
import React from 'react';
import { ChatSession } from '../types';
import { SUGGESTED_TOPICS, OFFICIAL_PORTALS } from '../constants';
import { MessageSquare, Plus, ExternalLink, Trash2 } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onTopicClick: (topic: string) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onNewChat, 
  onSelectSession, 
  onDeleteSession,
  onTopicClick,
  isOpen 
}) => {
  return (
    <aside className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out flex flex-col`}>
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            F
          </div>
          <h1 className="text-xl font-bold text-slate-800">FinBot</h1>
        </div>
        
        <button 
          onClick={onNewChat}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          New Discussion
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8">
        {/* Recent Chats */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Recent Chats</h2>
          <div className="space-y-1">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  session.id === currentSessionId ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => onSelectSession(session.id)}
              >
                <MessageSquare size={18} className={session.id === currentSessionId ? 'text-blue-600' : 'text-slate-400'} />
                <span className="flex-1 truncate text-sm font-medium">{session.title}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-sm text-slate-400 px-2 italic">No history yet</p>
            )}
          </div>
        </div>

        {/* Suggested Topics */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Learn More</h2>
          <div className="grid grid-cols-1 gap-1">
            {SUGGESTED_TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => onTopicClick(topic.label)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-left"
              >
                <span className="text-blue-500">{topic.icon}</span>
                {topic.label}
              </button>
            ))}
          </div>
        </div>

        {/* Official Portals */}
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Official Portals</h2>
          <div className="space-y-2">
            {OFFICIAL_PORTALS.map((portal) => (
              <a
                key={portal.name}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 text-xs text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 rounded-md border border-slate-100"
              >
                {portal.name}
                <ExternalLink size={12} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 px-2">
          <img src="https://picsum.photos/seed/user/40/40" alt="Profile" className="w-8 h-8 rounded-full border border-slate-200" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-700 truncate">Fin Learner</p>
            <p className="text-xs text-slate-500 truncate">Standard Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
