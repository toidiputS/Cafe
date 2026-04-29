import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Send, X, User } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit, where } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { type MenuItem } from '../data/menu';

interface Review {
  id?: string;
  userId?: string;
  userName: string;
  rating: number;
  comment: string;
  menuItemId?: string;
  createdAt: any;
}

interface ReviewSectionProps {
  menuItemId?: string;
  menuItemName?: string;
  onClose?: () => void;
}

export function ReviewSection({ menuItemId, menuItemName, onClose }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState(auth.currentUser?.displayName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(10));
    if (menuItemId) {
      q = query(collection(db, 'reviews'), where('menuItemId', '==', menuItemId), orderBy('createdAt', 'desc'), limit(10));
    }

    const path = 'reviews';
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(fetchedReviews);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [menuItemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim() || !userName.trim()) return;

    setIsSubmitting(true);
    const path = 'reviews';
    try {
      await addDoc(collection(db, path), {
        userId: auth.currentUser?.uid || null,
        userName,
        rating,
        comment,
        menuItemId: menuItemId || null,
        createdAt: serverTimestamp(),
      });
      setRating(0);
      setComment('');
      setShowForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn(
      "w-full flex flex-col bg-[#0a0a0a] text-white",
      menuItemId ? "h-full p-0" : "min-h-[500px] p-6 md:p-10 border-t border-white/5"
    )}>
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full flex-1">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-display text-2xl italic text-orange-accent">
              {menuItemName ? `${menuItemName} Reviews` : 'Guest Book'}
            </h2>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary mt-1">
              {menuItemName ? 'What people are saying' : 'Share your dining experience'}
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-secondary hover:text-white transition-colors">
              <X size={24} />
            </button>
          )}
        </div>

        <div className={cn(
          "flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar mb-8",
          reviews.length === 0 && "flex items-center justify-center p-12 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10"
        )}>
          <AnimatePresence mode="popLayout">
            {reviews.length === 0 ? (
              <div className="text-center space-y-6">
                <div className="italic text-secondary/60 text-lg">
                  "No reviews yet. Be the first to share your thoughts!"
                </div>
                {!showForm && (
                   <button
                    onClick={() => setShowForm(true)}
                    className="px-8 py-4 bg-accent text-bg rounded-xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-orange-accent transition-all mx-auto"
                  >
                    <MessageSquare size={16} />
                    Sign the Guest Book
                  </button>
                )}
              </div>
            ) : (
              reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <User size={16} className="text-accent" />
                      </div>
                      <div>
                        <span className="text-sm font-bold block">{review.userName}</span>
                        <span className="text-[10px] text-secondary opacity-50 uppercase tracking-widest leading-none">
                          {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={cn(s <= review.rating ? "text-accent fill-accent" : "text-white/10")}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed italic">"{review.comment}"</p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className={cn(
          "shrink-0 bg-card/40 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm",
          reviews.length === 0 && !showForm && "hidden"
        )}>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-4 bg-accent text-bg rounded-xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-orange-accent transition-all"
            >
              <MessageSquare size={16} />
              Leave a Review
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Your Rating</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onMouseEnter={() => setHoverRating(num)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(num)}
                      className="transition-transform active:scale-90"
                    >
                      <Star
                        size={24}
                        className={cn(
                          "transition-colors",
                          num <= (hoverRating || rating) ? "text-accent fill-accent" : "text-white/10"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                required
              />

              <textarea
                placeholder="What did you think? Give us your honest feedback..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                required
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-white/10 text-secondary font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="flex-[2] py-3 bg-white text-bg font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-accent transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Posting...' : <><Send size={14} /> Submit Review</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
