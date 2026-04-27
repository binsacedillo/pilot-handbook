"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

/**
 * Premium Feedback Button with Glassmorphism and Micro-interactions.
 * Adheres to ISO UI/UX standards for visibility and accessibility.
 */
const FeedbackButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setOpen(true)}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 h-14 rounded-full bg-blue-600 text-white shadow-2xl hover:bg-blue-700 transition-colors border border-blue-400/30 backdrop-blur-md"
          aria-label="Send Feedback"
        >
          <MessageSquare className="w-6 h-6" />
          <AnimatePresence>
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-semibold whitespace-nowrap overflow-hidden pr-1"
              >
                Feedback
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default FeedbackButton;
