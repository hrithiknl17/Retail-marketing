import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Loader2, Sparkles, Mic, MicOff } from 'lucide-react';
import { api } from '../api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantProps {
  userRole?: 'admin' | 'customer';
}

export default function Assistant({ userRole = 'admin' }: AssistantProps) {
  const isCustomer = userRole === 'customer';
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: isCustomer 
        ? "Hello! I'm your FreshSync helper. I can help you find products and check if they are in stock. For example, 'Where can I find Organic Bananas?' or 'Is there any Whole Milk available?'"
        : 'Hello! I am your FreshSync AI Assistant. You can ask me questions about your sales, inventory, vendors, or deliveries. For example, "What were the sales for today?" or "Which items are low on stock?"' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      if (availableVoices.length > 0 && !selectedVoice) {
        const preferred = availableVoices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || availableVoices[0];
        setSelectedVoice(preferred.name);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (messageOverride?: string) => {
    const userMsg = (messageOverride || input).trim();
    if (!userMsg || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const data = await api.askAssistant(userMsg);
      const assistantMsg = data.response || 'I am sorry, I could not process that request.';
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: assistantMsg 
      }]);
      speak(assistantMsg);
    } catch (error) {
      console.error('Error calling Backend API:', error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while trying to connect to the backend.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        if (event.results[0].isFinal) {
          handleSend(transcript);
        }
      };
      recognition.start();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-zinc-50">
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm shadow-sm'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-zinc-200 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span>Analyzing store data...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-6 bg-white border-t border-zinc-200">
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isCustomer ? "Find a product or check stock..." : "Ask about sales, inventory, or vendors..."}
            className="w-full pl-12 pr-16 py-4 bg-zinc-100 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none shadow-sm"
            disabled={isLoading}
          />
          <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {voices.length > 0 && (
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="hidden md:block text-xs bg-zinc-100 border-none rounded-lg p-1 pr-6 max-w-[120px] text-zinc-600 outline-none focus:ring-0 appearance-none"
                style={{ backgroundImage: 'none' }}
              >
                {voices.filter(v => v.lang.startsWith('en')).map((v, i) => (
                  <option key={i} value={v.name}>{v.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-all ${
                isListening 
                  ? 'bg-rose-100 text-rose-600 animate-pulse' 
                  : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
              }`}
              title={isListening ? "Stop listening" : "Speak to AI"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white rounded-xl transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-xs text-zinc-400 mt-3">
          {isCustomer ? "AI Assistant helps you find items in our store." : "AI Assistant uses Gemini to analyze your store's data."}
        </p>
      </div>
    </div>
  );
}
