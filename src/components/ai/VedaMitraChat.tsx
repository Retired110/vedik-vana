'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  ThumbsUp,
  ThumbsDown,
  Globe,
  Bot,
  User,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageOption } from '@/lib/botanical-knowledge';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  interactionId?: string;
  feedback?: 'HELPFUL' | 'UNHELPFUL' | null;
  timestamp: string;
  modelUsed?: string;
}

export function VedaMitraChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [userLocation, setUserLocation] = useState<string>('India');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session & auto-detect location/language
  useEffect(() => {
    let sid = localStorage.getItem('vv_bot_session');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('vv_bot_session', sid);
    }
    setSessionId(sid);

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
      setUserLocation(tz);

      const navLang = navigator.language?.toLowerCase() || '';
      let detectedCode = 'en';

      if (navLang.startsWith('hi')) detectedCode = 'hi';
      else if (navLang.startsWith('ta')) detectedCode = 'ta';
      else if (navLang.startsWith('te')) detectedCode = 'te';
      else if (navLang.startsWith('bn')) detectedCode = 'bn';
      else if (navLang.startsWith('mr')) detectedCode = 'mr';
      else if (navLang.startsWith('gu')) detectedCode = 'gu';
      else if (navLang.startsWith('kn')) detectedCode = 'kn';
      else if (navLang.startsWith('ml')) detectedCode = 'ml';
      else if (navLang.startsWith('pa')) detectedCode = 'pa';
      else if (tz === 'Asia/Kolkata') detectedCode = 'hi';

      setSelectedLang(detectedCode);

      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === detectedCode) || SUPPORTED_LANGUAGES[0];
      setMessages([
        {
          id: 'initial_greeting',
          sender: 'bot',
          text: langObj.greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'Veda Mitra Neural AI',
        },
      ]);
    } catch {
      setSelectedLang('en');
    }
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Switch language
  const handleLanguageChange = (newCode: string) => {
    setSelectedLang(newCode);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === newCode) || SUPPORTED_LANGUAGES[0];
    setMessages((prev) => [
      ...prev,
      {
        id: 'lang_switch_' + Date.now(),
        sender: 'bot',
        text: `🙏 ${langObj.greeting}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'Veda Mitra Neural AI',
      },
    ]);
  };

  // Reset conversation
  const handleResetChat = () => {
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];
    setMessages([
      {
        id: 'initial_greeting_' + Date.now(),
        sender: 'bot',
        text: langObj.greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'Veda Mitra Neural AI',
      },
    ]);
  };

  // Send message to AI
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isTyping) return;

    const userMsgId = 'user_' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const currentHistory = [...messages, userMsg].slice(-6).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          languageCode: selectedLang,
          sessionId,
          location: userLocation,
          history: currentHistory,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot_' + Date.now(),
            sender: 'bot',
            text: data.botResponse,
            interactionId: data.interactionId,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelUsed: data.modelUsed || 'Veda Mitra Neural AI',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot_err_' + Date.now(),
            sender: 'bot',
            text: 'With deep humility, I encountered a brief connection delay. Please feel free to ask again or browse our Sacred Catalog.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot_err_' + Date.now(),
          sender: 'bot',
          text: 'Namaste! Please forgive my brief silence. Kindly verify your connection and ask again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle feedback loop
  const handleFeedback = async (msgId: string, interactionId?: string, feedbackType: 'HELPFUL' | 'UNHELPFUL' = 'HELPFUL') => {
    if (!interactionId) return;

    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedback: feedbackType } : m))
    );

    try {
      await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interactionId, feedback: feedbackType }),
      });
    } catch (e) {
      console.error('Failed to record feedback:', e);
    }
  };

  // Helper to render markdown text with bolding and links
  const renderMessageContent = (text: string) => {
    // Split by markdown link pattern: [label](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const label = match[1];
      const url = match[2];
      parts.push(
        <Link
          key={match.index}
          href={url}
          className="inline-flex items-center gap-1 text-brand-gold font-semibold underline underline-offset-2 hover:text-white transition-colors"
        >
          <span>{label}</span>
          <ExternalLink className="w-3 h-3 inline" />
        </Link>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return (
      <div className="whitespace-pre-wrap leading-relaxed">
        {parts.map((part, i) => {
          if (typeof part !== 'string') return <React.Fragment key={i}>{part}</React.Fragment>;
          // Simple bold parser for **text**
          const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
          return (
            <React.Fragment key={i}>
              {boldParts.map((bp, j) => {
                if (bp.startsWith('**') && bp.endsWith('**')) {
                  return <strong key={j} className="font-semibold text-white">{bp.slice(2, -2)}</strong>;
                }
                return bp;
              })}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-brand-forest-900 text-brand-gold border border-brand-gold/40 shadow-2xl hover:bg-brand-forest hover:scale-105 active:scale-95 transition-all group"
          aria-label="Open Veda Mitra Botanical AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-brand-gold" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-bold font-cinzel block text-white leading-tight">
              Veda Mitra
            </span>
            <span className="text-[10px] text-brand-gold/90 uppercase tracking-widest font-medium">
              Multilingual AI Concierge
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] h-[590px] max-h-[85vh] bg-brand-forest-950 text-white rounded-3xl border border-brand-forest-800 shadow-2xl flex flex-col overflow-hidden animate-scale">
          {/* Header */}
          <div className="bg-brand-forest-900/95 backdrop-blur-md px-4 py-3.5 border-b border-brand-forest-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-brand-forest border border-brand-gold/40 flex items-center justify-center text-brand-gold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-cinzel text-sm font-bold text-white leading-none">
                    Veda Mitra
                  </h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] text-brand-gold/80 block mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-gold inline" /> Generative Botanical AI
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Selector */}
              <div className="relative flex items-center bg-brand-forest-950/80 rounded-xl px-2 py-1 border border-brand-forest-800 text-[11px]">
                <Globe className="w-3.5 h-3.5 text-brand-gold mr-1" />
                <select
                  value={selectedLang}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-transparent text-white text-[11px] focus:outline-none cursor-pointer pr-1"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-brand-forest-900 text-white">
                      {l.nativeName} ({l.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Chat */}
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-brand-forest-800 transition-colors"
                title="Reset Conversation"
                aria-label="Reset Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-brand-forest-800 transition-colors"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Questions Chips */}
          <div className="bg-brand-forest-900/40 px-3 py-2 border-b border-brand-forest-900 flex gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <button
              onClick={() => handleSendMessage('How to take Himalayan Shilajit and what are its benefits?')}
              className="px-2.5 py-1 rounded-full bg-brand-forest-800/80 hover:bg-brand-forest text-stone-300 hover:text-brand-gold border border-brand-forest-700 whitespace-nowrap transition-colors"
            >
              🏔️ Shilajit Dosage
            </button>
            <button
              onClick={() => handleSendMessage('What are the skin and sleep benefits of Kashmiri Mongra Saffron?')}
              className="px-2.5 py-1 rounded-full bg-brand-forest-800/80 hover:bg-brand-forest text-stone-300 hover:text-brand-gold border border-brand-forest-700 whitespace-nowrap transition-colors"
            >
              🌸 Kashmiri Saffron
            </button>
            <button
              onClick={() => handleSendMessage('What active discount coupon codes are available?')}
              className="px-2.5 py-1 rounded-full bg-brand-forest-800/80 hover:bg-brand-forest text-stone-300 hover:text-brand-gold border border-brand-forest-700 whitespace-nowrap transition-colors"
            >
              🏷️ Discount Coupons
            </button>
            <button
              onClick={() => handleSendMessage('How does the 4-digit Delivery Verification OTP work?')}
              className="px-2.5 py-1 rounded-full bg-brand-forest-800/80 hover:bg-brand-forest text-stone-300 hover:text-brand-gold border border-brand-forest-700 whitespace-nowrap transition-colors"
            >
              🔐 Delivery OTP Policy
            </button>
          </div>

          {/* Message History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-brand-gold text-brand-forest-950 font-medium rounded-br-xs'
                      : 'bg-brand-forest-900/90 text-stone-200 border border-brand-forest-800 rounded-bl-xs'
                  }`}
                >
                  {renderMessageContent(msg.text)}
                </div>

                {/* Bot Feedback Loop & Model Badge */}
                {msg.sender === 'bot' && (
                  <div className="mt-1 flex items-center justify-between w-full max-w-[88%] text-[10px] text-stone-400 pl-1 pr-1">
                    <span className="text-[9px] text-stone-500 font-mono">
                      {msg.modelUsed || 'Veda Mitra AI'}
                    </span>
                    {msg.interactionId && (
                      <div className="flex items-center gap-1.5">
                        {msg.feedback ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            {msg.feedback === 'HELPFUL' ? 'Helpful' : 'Noted'}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleFeedback(msg.id, msg.interactionId, 'HELPFUL')}
                              className="p-1 hover:text-brand-gold transition-colors"
                              title="Helpful"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(msg.id, msg.interactionId, 'UNHELPFUL')}
                              className="p-1 hover:text-rose-400 transition-colors"
                              title="Needs Improvement"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-brand-forest-900/60 border border-brand-forest-800 text-stone-400 text-xs w-36">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-spin" />
                <span className="text-[11px] text-brand-gold/90 font-medium">Veda Mitra is meditating...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 bg-brand-forest-900/80 border-t border-brand-forest-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask in ${activeLangObj.nativeName} or English...`}
                className="flex-1 bg-brand-forest-950 text-white placeholder:text-stone-500 text-xs px-3.5 py-2.5 rounded-xl border border-brand-forest-800 focus:outline-none focus:border-brand-gold"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-2.5 rounded-xl bg-brand-gold text-brand-forest-950 hover:bg-brand-gold-light transition-all disabled:opacity-40"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-[10px] text-center text-stone-500 mt-1.5 flex items-center justify-center gap-1">
              <span>Grounded in Vedik Vana Ayurvedic catalog</span>
              <span>•</span>
              <span className="text-brand-gold/70">FSSAI: 10024011000918</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
