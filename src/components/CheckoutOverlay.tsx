import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, ShoppingBag, Clock, CreditCard, ArrowRight, User, Mail, Phone, ChevronLeft } from "lucide-react";
import { cn } from "../lib/utils";
import { type CartItem } from "../App";
import { BUSINESS_INFO } from "../data/menu";

interface CheckoutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  user: any;
  isDelivery: boolean;
  setIsDelivery: (v: boolean) => void;
  deliveryAddress: string;
  setDeliveryAddress: (v: string) => void;
  onInitiatePayment: (total: number) => void;
}

export function CheckoutOverlay({
  isOpen,
  onClose,
  cart,
  user,
  isDelivery,
  setIsDelivery,
  deliveryAddress,
  setDeliveryAddress,
  onInitiatePayment
}: CheckoutOverlayProps) {
  const [step, setStep] = useState<"info" | "review">("info");
  const [contactInfo, setContactInfo] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: ""
  });

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryCharge = isDelivery ? BUSINESS_INFO.delivery.charge : 0;
  const gratuity = subtotal > BUSINESS_INFO.delivery.gratuity_threshold ? subtotal * BUSINESS_INFO.delivery.gratuity_rate : 0;
  const total = subtotal + deliveryCharge + gratuity;

  const handleNext = () => {
    if (step === "info") {
      setStep("review");
    } else {
      onInitiatePayment(total);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-bg/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
    >
      <div className="max-w-4xl w-full bg-card rounded-3xl border border-border-dim shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]">
        {/* Left Side: Form */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-8">
            <button onClick={onClose} className="p-2 -ml-2 text-secondary hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="flex gap-2">
              <div className={cn("h-1 w-8 rounded-full transition-all", step === "info" ? "bg-accent" : "bg-accent/20")} />
              <div className={cn("h-1 w-8 rounded-full transition-all", step === "review" ? "bg-accent" : "bg-accent/20")} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === "info" ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Checkout</h2>
                  <p className="text-secondary text-sm font-medium">Almost there! Just need a few details.</p>
                </div>

                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Contact Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-secondary uppercase tracking-widest pl-1">Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50" />
                          <input
                            type="text"
                            value={contactInfo.name}
                            onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-accent/50 transition-all font-medium"
                            placeholder="Your Name"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-secondary uppercase tracking-widest pl-1">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50" />
                          <input
                            type="email"
                            value={contactInfo.email}
                            onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-accent/50 transition-all font-medium"
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Type */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Order Type</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setIsDelivery(false)}
                        className={cn(
                          "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group",
                          !isDelivery ? "bg-accent border-accent text-bg" : "bg-white/5 border-white/10 text-secondary hover:border-white/20"
                        )}
                      >
                        <ShoppingBag className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Pickup</span>
                      </button>
                      <button
                        onClick={() => setIsDelivery(true)}
                        className={cn(
                          "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 group",
                          isDelivery ? "bg-accent border-accent text-bg" : "bg-white/5 border-white/10 text-secondary hover:border-white/20"
                        )}
                      >
                        <MapPin className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Delivery</span>
                      </button>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {isDelivery && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Delivery Address</h3>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-4 h-4 text-secondary/50" />
                        <textarea
                          placeholder="Your address in Manchester or Bedford..."
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-accent/50 transition-all font-medium min-h-[100px] resize-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <button 
                    onClick={() => setStep("info")}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary hover:text-white transition-colors mb-4"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Back to info
                  </button>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Final Review</h2>
                  <p className="text-secondary text-sm font-medium">Double check everything before paying.</p>
                </div>

                <div className="space-y-6">
                  {/* Review Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-secondary">Contact</span>
                      <p className="text-sm font-bold text-white">{contactInfo.name}</p>
                      <p className="text-[10px] text-secondary font-mono">{contactInfo.email}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-secondary">Type</span>
                      <p className="text-sm font-bold text-white uppercase">{isDelivery ? "Delivery" : "Carry Out"}</p>
                      {isDelivery && <p className="text-[10px] text-secondary font-medium truncate">{deliveryAddress}</p>}
                    </div>
                  </div>

                  {/* Payment Alert */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex gap-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1">Secure Stripe Payment</h4>
                      <p className="text-[10px] text-secondary leading-relaxed">Proceeding will open a secure window to process your payment via Stripe. We do not store your card details.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex gap-4">
            <button
              onClick={handleNext}
              disabled={isDelivery && !deliveryAddress}
              className="flex-1 bg-accent text-bg px-8 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-30 shadow-2xl shadow-accent/20"
            >
              {step === "info" ? "Review Order" : "Proceed to Payment"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="w-full md:w-[320px] bg-bg/50 border-l border-border-dim p-6 md:p-10 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-secondary" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Your Basket</h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4 space-y-6">
            {cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-white uppercase tracking-wider">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.options && (
                    <p className="text-[9px] text-secondary font-medium leading-relaxed italic">{item.options}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 mt-8 border-t border-border-dim space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-secondary uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
              </div>
              {isDelivery && (
                <div className="flex justify-between text-[10px] font-bold text-secondary uppercase tracking-widest">
                  <span>Delivery Fee</span>
                  <span className="font-mono text-white">${deliveryCharge.toFixed(2)}</span>
                </div>
              )}
              {gratuity > 0 && (
                <div className="flex justify-between text-[10px] font-bold text-secondary uppercase tracking-widest">
                  <span>15% Gratuity</span>
                  <span className="font-mono text-white">${gratuity.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Total</span>
              <span className="text-2xl font-black text-accent font-mono tracking-tighter">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
