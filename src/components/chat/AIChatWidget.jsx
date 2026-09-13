import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import { MessageCircle, X } from 'lucide-react';

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            
            {/* Chat Window Container */}
            <div className={`transition-all duration-300 ease-in-out transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 h-0 w-0 mb-0 pointer-events-none'}`}>
                <ChatWindow onClose={() => setIsOpen(false)} />
            </div>

            {/* Floating Action Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 bg-[#f15377] hover:bg-[#d63a5e] text-white px-5 py-3 rounded-full shadow-2xl hover:-translate-y-1 transition-all group border border-pink-500/30"
                >
                    <span className="text-xl group-hover:scale-110 transition-transform">🤖</span>
                    <span className="font-bold">Fitness & Sport AI Coach</span>
                </button>
            )}
        </div>
    );
};

export default AIChatWidget;
