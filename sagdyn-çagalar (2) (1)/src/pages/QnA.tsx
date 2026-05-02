import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2, MessageSquare, ArrowDown } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

export default function QnA() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    
    // Show button if we are scrolled up by more than 100px from the bottom
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollButton(isScrolledUp);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'ai',
          text: t('qa.subtitle') + '\n\n' + t('qa.disclaimer'),
        }
      ]);
    } else if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([
        {
          id: 'welcome',
          role: 'ai',
          text: t('qa.subtitle') + '\n\n' + t('qa.disclaimer'),
        }
      ]);
    }
  }, [language, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = `You are a specialized medical and wellness web-based assistant for parents, specifically focusing on child health, pediatric care, and Tuina massage.

Follow these strict steps to provide high-quality and relevant answers:
1. Language Detection: Detect the language of the user's question. Support languages including Turkmen, English, German, Korean, or Russian.
2. Information Retrieval: Use web scraping and search tools (like Google Search) to retrieve the most up-to-date, accurate, and factual information from reliable medical, pediatric, and wellness websites. Do NOT answer solely from your internal memory.
3. Content Refinement: Summarize the found information clearly and compassionately. Structure the answer to be easily readable for a parent.
4. Language Match: Provide the final answer in the EXACT same language as the user's question. If the language is unknown, ask the user to clarify.

Subject Matter Focus (Crucial):
- Deeply prioritize topics related to child health, common childhood diseases, parenting, and pediatric Tuina massage techniques. 
- When explaining Tuina massage, emphasize its gentle nature, describe techniques clearly, and mention appropriate age groups and conditions (e.g., digestive issues, sleep, immunity).
- For medical topics, give safe, general advice. NEVER diagnose or prescribe. ALWAYS conclude medical advice with a clear recommendation to consult a qualified pediatrician or healthcare provider.

Behavior rules:
- If the information is unclear or cannot be found online, politely inform the user and suggest they consult a medical professional or rephrase their question.
- Avoid technical jargon unless explained simply.
- Do NOT mention "AI model", "Gemini", or any system/search details. Do NOT show links.
- Output rule: Only return the final answered summarized text. No extra text, no labels, no system text, no explanations about your search process.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction,
          temperature: 0.7,
          tools: [{ googleSearch: {} }]
        }
      });

      if (response.text) {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: response.text }]);
      } else {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: t('qa.error.empty') }]);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: t('qa.error.connect') }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[700px]">
        
        {/* Header */}
        <div className="bg-slate-800 p-6 flex flex-col sm:flex-row items-center gap-4 text-white shrink-0">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{t('nav.ai_qna')}</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              {t('qa.subtitle')} <br/>
              <span className="text-xs pt-1 block">{t('qa.disclaimer')}</span>
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50 relative" ref={chatContainerRef} onScroll={handleScroll}>
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map(msg => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'
                }`}>
                  {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={`px-6 py-4 rounded-3xl max-w-[85%] shadow-sm text-base ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed m-0">{msg.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-md">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="px-6 py-4 rounded-3xl bg-white text-slate-800 rounded-tl-none border border-slate-100 flex items-center gap-3 text-sm shadow-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                  <span className="text-slate-500">{t('qa.thinking')}</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Scroll to Bottom Button */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={scrollToBottom}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-slate-800 p-3 rounded-full shadow-lg border border-slate-100 hover:bg-slate-50 transition-colors z-10"
                aria-label="Scroll to bottom"
              >
                <ArrowDown className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('qa.placeholder')}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-slate-800 text-white px-8 py-4 flex items-center justify-center gap-2 rounded-2xl hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-bold"
            >
              <span className="hidden sm:inline">{t('qa.send')}</span>
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
