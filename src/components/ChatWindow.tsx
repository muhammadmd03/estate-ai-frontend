'use client';

import { useEffect, useRef } from 'react';
import { Building2, User, AlertTriangle } from 'lucide-react';
import { ChatMessage, AnalysisResult } from '@/types';
import { cn } from '@/lib/utils';
import AnalysisCard from './AnalysisCard';
import ComparisonCard from './ComparisonCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatWindowProps {
    messages: ChatMessage[];
    isTyping: boolean;
    onTriggerAnalysis: (data: AnalysisResult) => void;
}

function formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(date);
}

export default function ChatWindow({ messages, isTyping, onTriggerAnalysis }: ChatWindowProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 scroll-smooth">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={cn(
                        'flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                >
                    {/* Avatar */}
                    <div
                        className={cn(
                            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm',
                            msg.role === 'ai' && msg.isError
                                ? 'bg-gradient-to-br from-red-500 to-red-600'
                                : msg.role === 'ai'
                                    ? 'bg-gradient-to-br from-blue-900 to-blue-700'
                                    : 'bg-gradient-to-br from-slate-600 to-slate-700'
                        )}
                    >
                        {msg.role === 'ai' ? (
                            msg.isError
                                ? <AlertTriangle className="w-4 h-4 text-white" />
                                : <Building2 className="w-4 h-4 text-white" />
                        ) : (
                            <User className="w-4 h-4 text-white" />
                        )}
                    </div>

                    {/* Bubble */}
                    <div
                        className={cn(
                            'flex flex-col gap-1',
                            msg.role === 'user' ? 'items-end max-w-[75%]' : 'items-start w-full max-w-full'
                        )}
                    >
                        <div
                            className={cn(
                                'rounded-2xl text-sm leading-relaxed',
                                msg.role === 'user'
                                    ? 'px-4 py-3 bg-blue-900 text-white rounded-tr-sm shadow-md shadow-blue-900/20 max-w-full'
                                    : msg.isError
                                        ? 'px-4 py-3 bg-red-50 text-red-800 border border-red-200 rounded-tl-sm shadow-sm max-w-full'
                                        : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-sm shadow-sm w-full overflow-x-auto'
                            )}
                        >
                            <div className={cn(
                                'text-sm leading-relaxed',
                                msg.role !== 'user' && !msg.isError ? 'px-4 py-3' : ''
                            )}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        // Styled comparison table
                                        table: ({ children }) => (
                                            <div className="overflow-x-auto my-2 rounded-xl border border-slate-200 shadow-sm">
                                                <table className="w-full border-collapse text-sm">
                                                    {children}
                                                </table>
                                            </div>
                                        ),
                                        thead: ({ children }) => (
                                            <thead className="bg-gradient-to-r from-blue-900 to-blue-800">
                                                {children}
                                            </thead>
                                        ),
                                        tbody: ({ children }) => (
                                            <tbody className="divide-y divide-slate-100">
                                                {children}
                                            </tbody>
                                        ),
                                        tr: ({ children, ...props }) => (
                                            <tr className="transition-colors hover:bg-blue-50/40" {...props}>
                                                {children}
                                            </tr>
                                        ),
                                        th: ({ children }) => (
                                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-white tracking-wide whitespace-nowrap">
                                                {children}
                                            </th>
                                        ),
                                        td: ({ children }) => (
                                            <td className="px-4 py-2.5 text-xs text-slate-700 whitespace-nowrap border-b border-slate-50 last:border-0">
                                                {children}
                                            </td>
                                        ),
                                        // Bold
                                        strong: ({ children }) => (
                                            <strong className="font-semibold text-slate-900">{children}</strong>
                                        ),
                                        // Links
                                        a: ({ children, href }) => (
                                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
                                                {children}
                                            </a>
                                        ),
                                        // Italic
                                        em: ({ children }) => (
                                            <em className="italic text-slate-600">{children}</em>
                                        ),
                                        // Paragraph
                                        p: ({ children }) => (
                                            <p className="mb-2 last:mb-0">{children}</p>
                                        ),
                                        // List items
                                        ul: ({ children }) => (
                                            <ul className="list-disc list-inside space-y-0.5 mb-2">{children}</ul>
                                        ),
                                        ol: ({ children }) => (
                                            <ol className="list-decimal list-inside space-y-0.5 mb-2">{children}</ol>
                                        ),
                                        li: ({ children }) => (
                                            <li className="text-sm text-slate-700">{children}</li>
                                        ),
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>

                                {/* Comparison Card — shown when 2+ properties returned */}
                                {msg.showComparison && msg.apiProperties && msg.apiProperties.length >= 2 && (
                                    <ComparisonCard properties={msg.apiProperties} />
                                )}

                                {/* Textual Property results — single property listings */}
                                {msg.showProperties && msg.apiProperties && msg.apiProperties.length > 0 && (
                                    <div className="flex flex-col gap-4 mt-4 w-full text-slate-800">
                                        {msg.apiProperties.map((p, idx) => (
                                            <div key={`${p.property_id}-${idx}`} className="flex flex-col">
                                                <div className="font-semibold text-slate-900 mb-1">
                                                    {idx + 1}. {p.title} - {p.location}
                                                </div>
                                                <div><strong>Property ID:</strong> {p.property_id}</div>
                                                <div>
                                                    <strong>Price:</strong>{' '}
                                                    {p.price_usd != null
                                                        ? `$${p.price_usd.toLocaleString()}`
                                                        : 'N/A'}
                                                </div>
                                                <div>
                                                    <strong>Specifications:</strong>{' '}
                                                    {p.bedrooms != null ? p.bedrooms : 'N/A'} Bedrooms |{' '}
                                                    {p.bathrooms != null ? p.bathrooms : 'N/A'} Bathrooms
                                                </div>
                                                {p.area_sqft != null && (
                                                    <div><strong>Size:</strong> {p.area_sqft.toLocaleString()} sq. ft.</div>
                                                )}
                                                <div><strong>Location:</strong> {p.location}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timestamp */}
                        <span className="text-[10px] text-slate-400 px-1">
                            {formatTime(msg.timestamp)}
                        </span>

                        {/* Inline Analysis Card */}
                        {msg.showAnalysis && msg.analysisData && (
                            <div className="w-full mt-2">
                                <AnalysisCard data={msg.analysisData} />
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
                <div className="flex items-start gap-3 animate-in fade-in duration-200">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center shadow-sm">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms]" />
                            </div>
                            <span className="text-xs text-slate-400 italic">Analyzing properties...</span>
                        </div>
                    </div>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
}
