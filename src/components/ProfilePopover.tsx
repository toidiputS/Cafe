
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Award, 
  History, 
  LogOut, 
  X, 
  ChevronRight, 
  Package,
  Calendar,
  CreditCard,
  Phone,
  MapPin,
  ShoppingCart
} from "lucide-react";
import { auth, db, signOut, signIn } from "../lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { cn } from "../lib/utils";

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: any;
  items: any[];
}

interface ProfilePopoverProps {
  user: any;
  loyalty: any;
  cart: any[];
  setCart: (cart: any[]) => void;
  onClose: () => void;
  cancelOrder: (orderId: string) => Promise<string>;
}

export function ProfilePopover({ user, loyalty, cart, setCart, onClose, cancelOrder }: ProfilePopoverProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleCancelOrder = async (orderId: string) => {
    setCancellingId(orderId);
    await cancelOrder(orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
    setCancellingId(null);
  };

  const handleLogoutAction = () => {
    if (cart.length > 0) {
      setShowLogoutConfirm(true);
    } else {
      executeLogout();
    }
  };

  const executeLogout = (clearCart: boolean = true) => {
    if (clearCart) setCart([]);
    if (user) signOut();
    onClose();
  };

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, "orders"),
          where("customerId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const snap = await getDocs(q);
        const fetchedOrders = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        setOrders(fetchedOrders);
      } catch (e) {
        console.error("Error fetching orders:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pointer-events-none p-0 sm:p-4 lg:p-0">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="relative w-full max-w-[320px] h-full bg-[#121212] shadow-2xl pointer-events-auto border-l border-white/5 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#181818]">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary">
            {user ? "Rewards Profile" : "Guest Session"}
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-4 h-4 text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {user ? (
            <>
              {/* User Card */}
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-accent/10 border border-orange-accent/20 flex items-center justify-center">
                    <User className="w-7 h-7 text-orange-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-none mb-1">{user.displayName || "Member"}</h2>
                    <p className="text-[10px] text-secondary font-medium uppercase tracking-wider">{user.email}</p>
                  </div>
                </div>

                {/* Loyalty Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="block text-[9px] uppercase tracking-widest text-secondary font-bold mb-1">Points</span>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-orange-accent" />
                      <span className="text-xl font-bold text-white">{loyalty?.loyaltyPoints || 0}</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <span className="block text-[9px] uppercase tracking-widest text-secondary font-bold mb-1">Tier</span>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold text-white">GOLD</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-accent/5 p-3 rounded-lg border border-orange-accent/10">
                  <p className="text-[10px] text-orange-accent/80 leading-relaxed font-medium">
                    You're earning 1 point for every $1 spent. Every 10 points = $10 discount on your order!
                  </p>
                </div>

                {loyalty?.phoneNumber && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                    <Phone className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-xs font-medium text-white/80">{loyalty.phoneNumber}</span>
                  </div>
                )}

                {loyalty?.address && (
                  <div className="flex items-start gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                    <MapPin className="w-3.5 h-3.5 text-secondary mt-0.5" />
                    <div className="flex-1">
                      <span className="block text-[8px] uppercase tracking-widest text-secondary font-bold mb-0.5">Saved Address</span>
                      <span className="text-[11px] font-medium text-white/80 leading-tight block">{loyalty.address}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Order History */}
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-accent" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Recent Orders</h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {loading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : orders.length > 0 ? (
                    orders.map((order) => (
                      <div key={order.id} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group cursor-default">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-mono text-secondary">#{order.id.slice(-6).toUpperCase()}</span>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                            order.status === "Cancelled" ? "bg-red-500/20 text-red-400" :
                            order.status === "Delivered" || order.status === "Ready" ? "bg-green-500/20 text-green-400" : "bg-orange-accent/20 text-orange-accent"
                          )}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="block text-[11px] font-medium text-white/90">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </span>
                            <div className="flex items-center gap-1 opacity-30 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span className="text-[9px] font-medium">
                                {order.createdAt?.toDate().toLocaleDateString() || 'Today'}
                              </span>
                            </div>
                          </div>
                          {order.status === "Order Received" && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancellingId === order.id}
                              className="text-[9px] font-bold uppercase py-1 px-3 bg-white/5 hover:bg-red-500/20 text-secondary hover:text-red-400 rounded-lg transition-all"
                            >
                              {cancellingId === order.id ? "..." : "Cancel"}
                            </button>
                          )}
                          <span className="text-sm font-bold text-white">${order.total?.toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                      <Package className="w-8 h-8 text-white/10 mx-auto mb-2" />
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">No order history yet</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center h-full flex flex-col justify-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                <ShoppingCart className="w-8 h-8 text-orange-accent opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Guest Session</h3>
              <p className="text-secondary text-[11px] font-medium px-4 leading-relaxed mb-8">
                You're currently browsing as a guest. Log in to save your cart and earn rewards on every order.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={signIn}
                  className="w-full py-4 bg-orange-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-accent/10 active:scale-95 transition-all"
                >
                  Join Rewards Program
                </button>
                <div className="py-2 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">OR</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-white/5 text-secondary border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Logout */}
        <div className="p-6 border-t border-white/5 bg-[#181818]">
          <button 
            onClick={handleLogoutAction}
            className="w-full py-4 flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">{user ? "Sign Out" : "Reset Session"}</span>
          </button>
        </div>

        {/* Confirmation Overlay */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-x-0 bottom-0 bg-[#161616] border-t border-white/10 p-8 pt-10 rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-[60]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                  <LogOut className="w-5 h-5 text-red-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Wait, your cart!</h4>
                <p className="text-secondary text-[11px] font-medium leading-relaxed mb-6">
                  You have items in your cart. Would you like to clear them, or link them to an account to save for later?
                </p>

                <div className="w-full space-y-2">
                  {!user && (
                    <button
                      onClick={() => { signIn(); onClose(); }}
                      className="w-full py-4 bg-orange-accent hover:bg-orange-accent/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-accent/10 transition-all border border-orange-accent/20"
                    >
                      Login to Save Cart
                    </button>
                  )}
                  <button
                    onClick={() => executeLogout(true)}
                    className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Clear Cart & Exit
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="w-full py-2 text-[9px] font-bold text-secondary uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
