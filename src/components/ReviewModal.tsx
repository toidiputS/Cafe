import { motion, AnimatePresence } from 'motion/react';
import { ReviewSection } from './ReviewSection';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItemId: string;
  menuItemName: string;
}

export function ReviewModal({ isOpen, onClose, menuItemId, menuItemName }: ReviewModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-card border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden h-[80vh] flex flex-col"
          >
            <div className="flex-1 overflow-hidden">
              <ReviewSection menuItemId={menuItemId} menuItemName={menuItemName} onClose={onClose} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
