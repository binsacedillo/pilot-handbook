"use client";
import React, { useState } from 'react';

interface FeedbackModalProps {
    open: boolean;
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, onClose }) => {
    const [feedback, setFeedback] = useState('');
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback, email }),
            });
            if (!res.ok) throw new Error('Failed to send feedback');
            setSubmitted(true);
            setTimeout(() => {
                setFeedback('');
                setEmail('');
                setSubmitted(false);
                onClose();
            }, 1500);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: string }).message === 'string') {
                setError((err as { message: string }).message);
            } else {
                setError('Something went wrong');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-1100 flex items-center justify-center bg-black/30">
            <div className="relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-8 min-w-[320px] max-w-[90vw]">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-2xl text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-white focus:outline-none"
                    aria-label="Close"
                >
                    ×
                </button>
                <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Send Feedback</h2>
                {submitted ? (
                    <div className="text-blue-600 font-medium">Thank you for your feedback!</div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            placeholder="Your feedback..."
                            required
                            maxLength={1000}
                            rows={5}
                            className="w-full mb-3 rounded-md border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-zinc-500 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Your email (optional)"
                            className="w-full mb-4 rounded-md border border-slate-300 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-zinc-500 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {error && <div className="text-red-600 mb-2">{error}</div>}
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-5 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            Submit
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;
