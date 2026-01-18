
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { Message, ChatSession } from './types';
import { geminiService } from './services/gemini';
import { INITIAL_GREETING, QUICK_START_QUERIES } from './constants';
import { Menu, X, Info, TrendingUp, DollarSign, Wallet } from 'lucide-react';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('finbot_sessions');
    if (saved) {
      const parsed = JSON.parse(saved).map((s: any) => ({
        ...s,
        updatedAt: new Date(s.updatedAt),
        messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
      }));
      setSessions(parsed);
      if (parsed.length > 0) {
        setCurrentSessionId(parsed[0].id);
      }
    } else {
      createNewChat();
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('finbot_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Discussion',
      messages: [{
        id: uuidv4(),
        role: 'model',
        content: INITIAL_GREETING,
        timestamp: new Date(),
        suggestions: ["How to start investing?", "What is ITR?"]
      }],
      updatedAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const currentSession = sessions.find(s => s.id === currentSessionId);
    if (!currentSession) return;

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    // Update session locally first
    const updatedMessages = [...currentSession.messages, userMsg];
    let newTitle = currentSession.title;
    if (currentSession.messages.length === 1) {
      newTitle = text.slice(0, 30) + (text.length > 30 ? '...' : '');
    }

    setSessions(prev => prev.map(s => 
      s.id === currentSessionId 
        ? { ...s, messages: updatedMessages, title: newTitle, updatedAt: new Date() } 
        : s
    ));

    setIsLoading(true);

    try {
      // Prepare history for Gemini
      const history = updatedMessages.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await geminiService.generateResponse(history, text);

      const botMsg: Message = {
        id: uuidv4(),
        role: 'model',
        content: response.answer,
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages: [...s.messages, botMsg], updatedAt: new Date() } 
          : s
      ));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = (id: string) => {
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (filtered.length === 0) {
      createNewChat();
    } else if (currentSessionId === id) {
      setCurrentSessionId(filtered[0].id);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessions, isLoading]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="flex h-screen overflow-hidden text-slate-900">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={createNewChat}
        onSelectSession={(id) => {
          setCurrentSessionId(id);
          setIsSidebarOpen(false);
        }}
        onDeleteSession={deleteSession}
        onTopicClick={(topic) => handleSendMessage(`Tell me about ${topic}`)}
        isOpen={isSidebarOpen}
      />

      <main className="flex-1 flex flex-col h-full bg-slate-50 relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-slate-800 leading-none mb-1">
                {currentSession?.title || 'FinBot'}
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">AI Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Info size={14} />
              Help
            </button>
            <div className="w-[1px] h-6 bg-slate-200 hidden sm:block" />
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <TrendingUp size={20} />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8"
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {currentSession?.messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                onSuggestionClick={handleSendMessage}
              />
            ))}
            
            {isLoading && (
              <div className="flex justify-start items-center gap-4 animate-pulse">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="p-4 bg-white border border-slate-100 rounded-2xl w-32 h-12 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" />
                </div>
              </div>
            )}

            {/* Quick Start Suggestions for empty chat (or just starting) */}
            {currentSession?.messages.length === 1 && !isLoading && (
              <div className="pt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUICK_START_QUERIES.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(query)}
                    className="flex items-center gap-4 p-4 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all rounded-xl text-left group"
                  >
                    <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 rounded-lg transition-colors">
                      {idx % 2 === 0 ? <Wallet size={18} /> : <DollarSign size={18} />}
                    </div>
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">{query}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
        />
      </main>
    </div>
  );
};

export default App;
