import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, MicOff, Settings, Volume2, VolumeX, Trash2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { generateAIResponse, generateProactiveGreeting } from '../../services/api/chatService';

const SUGGESTED_PROMPTS = [
    "💪 Give me a quick workout",
    "🏆 Help me choose a sport",
    "🥗 Suggest a healthy meal",
    "🧬 What is Fitness DNA?",
];

const ChatWindow = ({ onClose }) => {
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('fitverse_chat_history');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { console.error("Failed to parse chat history"); }
        }
        // Build proactive greeting based on user data
        const authData = localStorage.getItem('auth');
        const auth = authData ? JSON.parse(authData) : null;
        const userId = auth?.user?._id || auth?.user?.id || 'local-user';
        const userName = auth?.user?.name || 'Athlete';
        const greeting = generateProactiveGreeting(userId, userName);
        return [{ id: 'welcome', role: 'ai', text: greeting }];
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Voice & TTS State
    const [isListening, setIsListening] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(false);
    
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-scroll to bottom and save history
    useEffect(() => {
        scrollToBottom();
        localStorage.setItem('fitverse_chat_history', JSON.stringify(messages));
    }, [messages, isLoading]);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                setInput(transcript);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            if (recognitionRef.current) {
                setInput('');
                recognitionRef.current.start();
                setIsListening(true);
            } else {
                alert("Speech recognition is not supported in your browser.");
            }
        }
    };

    const handleSend = async (textToSend = input) => {
        if (!textToSend.trim()) return;

        // Stop listening if active
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }

        const userMsg = { id: Date.now().toString(), role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const aiResponseText = await generateAIResponse(textToSend, autoSpeak); // If autoSpeak, tell AI to be conversational

        const aiMsg = { id: (Date.now() + 1).toString(), role: 'ai', text: aiResponseText };
        setMessages(prev => [...prev, aiMsg]);
        setIsLoading(false);

        if (autoSpeak) {
            speakText(aiResponseText);
        }
    };

    const speakText = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel(); // Stop current speech
        const utterance = new SpeechSynthesisUtterance(text);
        
        const voices = window.speechSynthesis.getVoices();
        
        // Search aggressively for Premium/Neural/Natural voices (e.g. Microsoft Natural, Google)
        const premiumVoice = voices.find(v => 
            (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Premium'))
        );
                             
        if (premiumVoice) {
            utterance.voice = premiumVoice;
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };

    const clearChat = () => {
        if (window.confirm("Clear chat history?")) {
            const authData = localStorage.getItem('auth');
            const auth = authData ? JSON.parse(authData) : null;
            const userId = auth?.user?._id || auth?.user?.id || 'local-user';
            const userName = auth?.user?.name || 'Athlete';
            const greeting = generateProactiveGreeting(userId, userName);
            const defaultMsg = [{ id: 'welcome', role: 'ai', text: greeting }];
            setMessages(defaultMsg);
            localStorage.setItem('fitverse_chat_history', JSON.stringify(defaultMsg));
        }
    };

    return (
        <div className="w-[380px] h-[600px] max-h-[80vh] flex flex-col bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl overflow-hidden font-sans">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    <div>
                        <h3 className="text-white font-bold text-sm">Fitness & Sport AI Coach</h3>
                        <p className="text-green-500 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={clearChat}
                        title="Clear chat history"
                        className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button 
                        onClick={() => setAutoSpeak(!autoSpeak)}
                        title="Auto-speak responses"
                        className={`transition-colors ${autoSpeak ? 'text-green-400' : 'text-gray-500 hover:text-white'}`}
                    >
                        {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-900 scroll-smooth">
                {messages.map((msg) => (
                    <ChatMessage 
                        key={msg.id} 
                        message={msg} 
                        onPlay={() => speakText(msg.text)} 
                        onStop={stopSpeaking}
                    />
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts (Only show if empty or few messages) */}
            {messages.length < 3 && !isLoading && (
                <div className="px-3 pb-2 flex overflow-x-auto gap-2 hide-scrollbar">
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleSend(prompt)}
                            className="whitespace-nowrap text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition-colors border border-gray-700"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-black border-t border-gray-800">
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-full pr-2">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isListening ? "Listening..." : "Type or speak..."}
                        className="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none text-sm placeholder-gray-500"
                        disabled={isLoading}
                    />
                    
                    <button 
                        onClick={toggleListening}
                        className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        title="Voice Input"
                    >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    <button 
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="p-2 bg-[#f15377] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d63a5e] transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
