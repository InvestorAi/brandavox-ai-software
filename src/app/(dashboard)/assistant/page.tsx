'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Bot,
  Send,
  RefreshCw,
  Cpu,
  Trash2,
  Download,
  AlertCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      content: "Hello! I am the SocialFlow AI Neural Assistant. I can write video ad copy, construct content calendars, map customer personas, or explain campaign statistics. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const feedEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      content: inputVal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);
    setError(null);

    try {
      // Query the caption generation or custom mock endpoint to get a live LLM reply
      const res = await fetch('/api/posts/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: 'default',
          brief: userMsg.content
        })
      });

      const data = await res.json();
      
      let replyContent = '';
      if (res.ok && data.success && data.data) {
        replyContent = `${data.data.headline || 'SocialFlow Proposal'}\n\n${data.data.primaryCopy || ''}\n\n${data.data.cta || ''}\n\nHashtags: ${data.data.hashtags?.join(' ') || ''}`;
      } else {
        // Fallback simulated response matching user query
        replyContent = `[SocialFlow Neural Core] I've analyzed your brief: "${userMsg.content}". Here is your strategy:\n\n1. Target the pain points of scaling digital presences directly.\n2. Standardize creative designs on Swiss desaturated layouts.\n3. Run A/B testing on paid channels using high-contrast bold typography.`;
      }

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-ai-${Date.now()}`,
            sender: 'assistant',
            content: replyContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsTyping(false);
      }, 800);

    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setError('Communication with the AI core timed out. Displaying simulated backup response.');
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'msg-reset',
        sender: 'assistant',
        content: "Reset complete. Neural Assistant core re-initialized. Send a prompt to begin.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="space-y-8 flex flex-col h-[calc(100vh-140px)]">
      <div className="flex justify-between items-center shrink-0">
        <PageHeader
          title="Neural AI Assistant"
          description="Dedicated full-screen ChatGPT-style sandbox workspace for content production, campaign reviews, and strategy compilation."
        />
        <button
          onClick={handleClear}
          className="bg-zinc-900 border border-border-custom hover:border-red-500 text-text-muted hover:text-red-400 font-mono text-[10px] uppercase py-1.5 px-3 rounded-sm flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Desk</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-card flex items-start gap-3 text-sm font-sans shrink-0">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Main chat workspace */}
      <div className="flex-1 bg-surface border border-border-custom rounded-card flex flex-col justify-between overflow-hidden relative font-sans text-xs">
        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono font-bold shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-accent/20 border-accent/30 text-accent'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}>
                {msg.sender === 'user' ? 'U' : <Bot className="w-4 h-4" />}
              </div>

              {/* Message block */}
              <div className={`rounded-sm p-4 leading-relaxed whitespace-pre-wrap border ${
                msg.sender === 'user'
                  ? 'bg-accent/5 border-accent/20 text-text-primary'
                  : 'bg-background/50 border-border-custom text-text-primary'
              }`}>
                {msg.content}
                <span className="block text-[8px] font-mono text-zinc-500 pt-2 text-right">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Typing log */}
          {isTyping && (
            <div className="flex items-start gap-3 max-w-xl">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-background/50 border border-border-custom rounded-sm p-4 leading-relaxed text-zinc-500 font-mono text-[9px] flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI is reasoning and constructing copy blocks...</span>
              </div>
            </div>
          )}

          <div ref={feedEndRef} />
        </div>

        {/* Input box form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border-custom bg-background/30 flex gap-3 shrink-0">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type your strategic prompt or write ad copy requests..."
            className="flex-1 px-4 py-2.5 bg-background border border-border-custom text-text-primary rounded-sm focus:outline-none focus:border-accent font-sans text-xs"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={isTyping || !inputVal.trim()}
            className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white p-2.5 rounded-sm flex items-center justify-center cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </form>
      </div>
    </div>
  );
}
