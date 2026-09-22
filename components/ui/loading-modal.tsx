'use client';

import { AnimatePresence, motion } from 'motion/react';

interface LoadingModalProps {
  open: boolean;
  title?: string;
  description?: string;
}

export const LoadingModal = ({
  open,
  title = 'Scoring your resume…',
  description = 'This usually takes a few seconds.',
}: LoadingModalProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: -32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-xl"
        >
          <p className="text-sm font-semibold text-zinc-900">{title}</p>
          <p className="mt-1 text-xs text-zinc-500">{description}</p>

          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <motion.div
              className="h-full w-1/3 rounded-full bg-primary-500"
              animate={{ x: ['-100%', '250%'] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
