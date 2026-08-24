import React, { useState } from 'react';
import { Volume2, Square } from 'lucide-react';

const ChatMessage = ({ message, onPlay, onStop }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const isAI = message.role === 'ai';

    const handlePlayToggle = () => {
        if (isPlaying) {
            onStop();
            setIsPlaying(false);
        } else {
            onPlay();
            setIsPlaying(true);
            // Rough timeout to reset icon, ideally we'd use SpeechSynthesis events 
            // but this is a simple fallback.
            setTimeout(() => setIsPlaying(false), message.text.length * 50); 
        }
    };

    return (
        <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] flex flex-col gap-1 ${isAI ? 'items-start' : 'items-end'}`}>
                
                <div className={`px-4 py-2.5 rounded-2xl relative group ${
                    isAI 
                        ? 'bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700' 
                        : 'bg-[#f15377] text-white rounded-tr-sm shadow-[0_0_10px_rgba(241,83,119,0.3)]'
                }`}>
                    
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.text}
                    </div>

                    {isAI && (
                        <button 
                            onClick={handlePlayToggle}
                            className="absolute -right-8 top-2 p-1.5 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 bg-gray-900 rounded-full border border-gray-700 shadow-md"
                            title={isPlaying ? "Stop" : "Read aloud"}
                        >
                            {isPlaying ? <Square size={14} className="fill-current" /> : <Volume2 size={14} />}
                        </button>
                    )}
                </div>

                <span className="text-[10px] text-gray-500 px-1">
                    {isAI ? 'FitVerse Coach' : 'You'}
                </span>
            </div>
        </div>
    );
};

export default ChatMessage;
