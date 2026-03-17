'use client';

import { useState, FormEvent, KeyboardEvent, useRef } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    brandColor?: string;
}

const suggestions = [
    'Book a meeting',
    'Calculate mortgage for NYC condo',
    'Analyze ROI for Beverly Hills villa',
    'Show me commercial offices in Chicago',
];

export default function ChatInput({ onSend, disabled, brandColor }: ChatInputProps) {
    const [value, setValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e?: FormEvent) => {
        e?.preventDefault();
        if (!value.trim() || disabled) return;
        onSend(value);
        setValue('');
        setShowSuggestions(false);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleInput = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    };

    return (
        <div className="px-4 py-4 border-t border-slate-100 bg-white">
            {/* Quick Suggestion chips */}
            {showSuggestions && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide animate-in slide-in-from-bottom-2 duration-200">
                    {suggestions.map((s) => (
                        <button
                            key={s}
                            onClick={() => {
                                setValue(s);
                                setShowSuggestions(false);
                                textareaRef.current?.focus();
                            }}
                            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-800 hover:bg-blue-100 transition-colors whitespace-nowrap"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
                <div
                    className={cn(
                        'flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 transition-all duration-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white',
                        disabled && 'opacity-60 pointer-events-none'
                    )}
                >
                    {/* File Upload */}
                    <button
                        type="button"
                        title="Upload CSV"
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                        <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onInput={handleInput}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Find me a 3 bedroom apartment in New York under $1.5M..."
                        rows={1}
                        className="flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none max-h-[120px] leading-relaxed"
                    />

                    {/* Voice */}
                    <button
                        type="button"
                        title="Voice input"
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                        <Mic className="w-4 h-4" />
                    </button>

                    {/* Send */}
                    <button
                        type="submit"
                        disabled={!value.trim() || disabled}
                        className={cn(
                            'flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200',
                            value.trim() && !disabled
                                ? 'text-white shadow-md hover:scale-105 active:scale-95'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        )}
                        style={value.trim() && !disabled && brandColor
                            ? { backgroundColor: brandColor }
                            : value.trim() && !disabled
                                ? { backgroundColor: '#059669' } /* emerald-600 fallback */
                                : undefined
                        }
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-center text-[10px] text-slate-400 mt-2">
                    Press <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-500 text-[10px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-500 text-[10px]">Shift+Enter</kbd> for newline
                </p>
            </form>
        </div>
    );
}
