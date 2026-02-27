"use client";
import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';

const FeedbackButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 56,
          height: 56,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: 28,
          cursor: 'pointer',
        }}
        aria-label="Send Feedback"
      >
        💬
      </button>
      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default FeedbackButton;
