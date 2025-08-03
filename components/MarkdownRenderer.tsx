import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import '@/app/styles.css';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <div className="markdown-content max-w-none prose prose-gray prose-invert">
            <ReactMarkdown
                components={{
                    h1: ({children}) => (
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4 mt-6 first:mt-0">
                            {children}
                        </h1>
                    ),
                    h2: ({children}) => (
                        <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-300 to-blue-300 bg-clip-text text-transparent mb-3 mt-5 first:mt-0">
                            {children}
                        </h2>
                    ),
                    h3: ({children}) => (
                        <h3 className="text-lg font-medium text-gray-200 mb-2 mt-4 first:mt-0">
                            {children}
                        </h3>
                    ),
                    p: ({children}) => (
                        <p className="text-gray-200 mb-3 leading-relaxed">
                            {children}
                        </p>
                    ),
                    ul: ({children}) => (
                        <ul className="list-disc list-inside mb-4 space-y-1">
                            {children}
                        </ul>
                    ),
                    ol: ({children}) => (
                        <ol className="list-decimal list-inside mb-4 space-y-1">
                            {children}
                        </ol>
                    ),
                    li: ({children}) => (
                        <li className="text-gray-200 leading-relaxed">
                            {children}
                        </li>
                    ),
                    strong: ({children}) => (
                        <strong className="font-semibold text-emerald-300">
                            {children}
                        </strong>
                    ),
                    em: ({children}) => (
                        <em className="italic text-blue-300">
                            {children}
                        </em>
                    ),
                    code: ({children, className}) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';
                        
                        return !language ? (
                            <code className="bg-gray-800/70 text-emerald-300 px-2 py-1 rounded text-sm font-mono">
                                {children}
                            </code>
                        ) : (
                            <div className="my-4">
                                <SyntaxHighlighter
                                    style={{
                                        ...oneDark,
                                        'pre[class*="language-"]': {
                                            ...oneDark['pre[class*="language-"]'],
                                            background: 'transparent !important',
                                        },
                                        'code[class*="language-"]': {
                                            ...oneDark['code[class*="language-"]'],
                                            background: 'transparent !important',
                                        }
                                    }}
                                    language={language}
                                    customStyle={{
                                        background: 'transparent !important',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(75, 85, 99, 0.5)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        margin: 0,
                                    }}
                                    codeTagProps={{
                                        style: {
                                            background: 'transparent !important'
                                        }
                                    }}
                                    PreTag="div"
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        );
                    },
                    pre: ({children}) => (
                        <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 mb-4 overflow-x-auto">
                            {children}
                        </div>
                    ),
                    blockquote: ({children}) => (
                        <blockquote className="border-l-4 border-emerald-400 pl-4 py-2 bg-gray-800/30 rounded-r-lg mb-4 italic text-gray-300">
                            {children}
                        </blockquote>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;