
import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

interface PaymentFormProps {
  amount: number;
  cart: any[];
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

export function PaymentForm({ amount, cart, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "An unexpected error occurred.");
      setLoading(false);
      return;
    }

    // Confirm the payment
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed.");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(paymentIntent.id);
      }, 3000);
    }

    setLoading(false);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a1a] p-10 rounded-2xl border border-[#00FF44]/30 shadow-[0_0_50px_rgba(0,255,68,0.1)] flex flex-col items-center justify-center text-center space-y-6 max-w-md w-full"
      >
        <div className="w-20 h-20 bg-[#00FF44]/10 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="w-12 h-12 text-[#00FF44]" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Payment Received</h2>
          <p className="text-secondary text-sm font-medium">Your order from The Bridge Cafe is now being prepared. You can track your status in the chat.</p>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5 }}
            className="h-full bg-[#00FF44]"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6 max-w-md w-full"
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Secure Payment</h2>
          <p className="text-secondary text-sm font-medium tracking-wide">Complete your order from The Bridge Cafe</p>
        </div>
        <CreditCard className="w-8 h-8 text-accent" />
      </div>

      <div className="bg-[#121212] p-4 rounded-lg border border-white/5 space-y-3 mb-2">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Summary</span>
          <span className="text-xs font-bold text-accent">{cart.length} Items</span>
        </div>
        <div className="max-h-[100px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-[11px]">
              <span className="text-white/80 font-medium">{item.quantity}x {item.name}</span>
              <span className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Order Total</span>
          <span className="text-xl font-bold text-accent">${(amount / 100).toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <PaymentElement 
            options={{
              layout: "tabs",
            }} 
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-accent text-bg font-black py-4 rounded-xl uppercase tracking-widest text-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay Now - $${(amount / 100).toFixed(2)}`
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full bg-transparent text-secondary font-bold py-3 text-xs uppercase tracking-widest hover:text-white transition-colors"
          >
            Back to Chat
          </button>
        </div>
      </form>

      <div className="flex items-center justify-center gap-2 pt-2 opacity-30">
        <ShieldCheck className="w-4 h-4" />
        <span className="text-[9px] font-bold uppercase tracking-widest">Secured by Stripe</span>
      </div>
    </motion.div>
  );
}
