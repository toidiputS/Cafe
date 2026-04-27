/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { MenuSection } from "./components/MenuSection";
import { Receptionist } from "./components/Receptionist";
import { SidebarInfo } from "./components/SidebarInfo";
import { MENU, type MenuItem, CATEGORY_METADATA, SUBCATEGORY_ORDER } from "./data/menu";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentForm } from "./components/PaymentForm";
import { motion, AnimatePresence } from "motion/react";
import { auth, db } from "./lib/firebase";
import { doc, updateDoc, serverTimestamp, collection, query, getDocs, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { AdminPanel } from "./components/AdminPanel";
import { ReviewSection } from "./components/ReviewSection";
import { Settings } from "lucide-react";
import { cn } from "./lib/utils";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  options?: string;
  customizations?: string;
}

export default function App() {
  const [menu, setMenu] = useState<MenuItem[]>(MENU);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [isDelivery, setIsDelivery] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastInteraction, setLastInteraction] = useState<{ type: 'click' | 'add', name: string } | null>(null);

  useEffect(() => {
    if (isAssistantOpen) {
      setIsSidebarOpen(false);
    }
  }, [isAssistantOpen]);

  const fetchMenu = useCallback(async (newMenu?: MenuItem[]) => {
    if (newMenu) {
      setMenu(newMenu);
      return;
    }
    try {
      const q = query(collection(db, "menu"));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setMenu(MENU);
        return;
      }

      const fetchedMenu = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      setMenu(fetchedMenu);
    } catch (e) {
      console.error("Error fetching menu:", e);
      setMenu(MENU); // Fallback to static menu on error
    }
  }, []);

  const migrateMenu = useCallback(async () => {
    try {
      console.log("Migrating static menu to Firestore...");
      for (const item of MENU) {
        await setDoc(doc(db, "menu", item.id), item);
      }
      fetchMenu();
    } catch (e) {
      console.error("Migration failed:", e);
    }
  }, [fetchMenu]);

  useEffect(() => {
    fetchMenu();
    
    return onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        // Check admin status
        const adminDoc = await getDoc(doc(db, "admins", fbUser.uid));
        let isUserAdmin = false;
        
        if (adminDoc.exists()) {
          isUserAdmin = true;
          setIsAdmin(true);
        } else if (fbUser.email === "klutchkanobi@gmail.com") {
          // Bootstrap first admin
          try {
            await setDoc(doc(db, "admins", fbUser.uid), {
              email: fbUser.email,
              boostrapped: true,
              createdAt: serverTimestamp()
            });
            isUserAdmin = true;
            setIsAdmin(true);
          } catch (e) {
            console.error("Admin bootstrap failed:", e);
          }
        } else {
          setIsAdmin(false);
        }

        // If admin and menu is empty, trigger migration
        if (isUserAdmin) {
          const q = query(collection(db, "menu"));
          const snap = await getDocs(q);
          if (snap.empty) {
            migrateMenu();
          }
        }
      } else {
        setIsAdmin(false);
      }
    });
  }, [fetchMenu, migrateMenu]);

  const addToCart = useCallback((itemName: string, quantity: number = 1, options?: string, customizations?: string, specificPrice?: number) => {
    const item = menu.find(m => m.name.toLowerCase().includes(itemName.toLowerCase()));
    if (!item) return `Sorry, I couldn't find "${itemName}" on our menu.`;
    
    const priceToUse = specificPrice ?? (Array.isArray(item.price) ? item.price[0] : item.price);

    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.options === options && i.customizations === customizations);
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: priceToUse, quantity, options, customizations }];
    });

    setHighlightedItemId(item.id);
    setHighlightedCategory(null);
    setLastInteraction({ type: 'add', name: item.name });

    // When an item is added (from menu board), pop the waitress back out and show cart
    setIsAssistantOpen(true);
    setIsCartOpen(true);

    // Auto-reset highlight
    setTimeout(() => setHighlightedItemId(prev => prev === item.id ? null : prev), 3000);

    return `Added ${quantity}x ${item.name} to your cart${customizations ? ` with customizations: ${customizations}` : ""}.`;
  }, [menu]);

  const removeFromCart = useCallback((itemName: string) => {
    const item = menu.find(m => m.name.toLowerCase().includes(itemName.toLowerCase()));
    if (!item) return `Item "${itemName}" not found in cart.`;
    setCart(prev => prev.filter(i => i.id !== item.id));
    return `Removed ${item.name} from your cart.`;
  }, [menu]);

  const highlightMenuItem = useCallback((itemName: string) => {
    const item = menu.find(m => m.name.toLowerCase().includes(itemName.toLowerCase()));
    if (!item) return `Item "${itemName}" not found on menu.`;
    setHighlightedItemId(item.id);
    setHighlightedCategory(null); // Clear category highlight if item is targeted
    
    setTimeout(() => setHighlightedItemId(prev => prev === item.id ? null : prev), 15000);
    return `Highlighted ${item.name} for you on the menu!`;
  }, [menu]);

  const highlightCategory = useCallback((categoryName: string) => {
    const validCategory = menu.find(m => m.category.toLowerCase().includes(categoryName.toLowerCase()))?.category;
    if (!validCategory) return `Category "${categoryName}" not found.`;
    setHighlightedCategory(validCategory);
    setHighlightedItemId(null); 
    
    setTimeout(() => setHighlightedCategory(prev => prev === validCategory ? null : prev), 15000);
    return `Showing the ${validCategory} section of the menu.`;
  }, [menu]);

  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "Cancelled",
        updatedAt: serverTimestamp()
      });
      return `Order ${orderId} has been cancelled successfully.`;
    } catch (e) {
      console.error("Error cancelling order:", e);
      return `Failed to cancel order ${orderId}.`;
    }
  }, []);

  const initiatePayment = useCallback(async (amount: number) => {
    try {
      setPaymentAmount(amount);
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: Math.round(amount * 100),
          metadata: {
            items: cart.map(i => `${i.quantity}x ${i.name}`).join(", "),
            delivery: isDelivery ? "Yes" : "No",
            address: deliveryAddress || "N/A"
          }
        }),
      });
      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error(data.error || "Failed to create payment intent");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      alert("Could not start payment. Please check your Stripe keys in Settings.");
    }
  }, []);

  const stripeOptions = useMemo(() => ({
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#E8D5C4',
      },
    },
  }), [clientSecret]);

  const categories = useMemo(() => Object.keys(CATEGORY_METADATA).filter(cat => menu.some(m => m.category === cat)), [menu]);

  const sortedMenu = useMemo(() => {
    return [...menu].sort((a, b) => {
      const aCatIdx = categories.indexOf(a.category);
      const bCatIdx = categories.indexOf(b.category);
      
      if (aCatIdx !== bCatIdx) return (aCatIdx === -1 ? 999 : aCatIdx) - (bCatIdx === -1 ? 999 : bCatIdx);

      // Within category, sort by subcategory order
      const subcatOrder = SUBCATEGORY_ORDER[a.category] || [];
      const aSubIdx = subcatOrder.indexOf(a.subcategory || "");
      const bSubIdx = subcatOrder.indexOf(b.subcategory || "");
      
      if (aSubIdx !== bSubIdx) return (aSubIdx === -1 ? 999 : aSubIdx) - (bSubIdx === -1 ? 999 : bSubIdx);

      // Within subcategory, sort by sortOrder (defaulting to high value to put un-ordered items at end)
      const aSort = a.sortOrder !== undefined ? a.sortOrder : 999;
      const bSort = b.sortOrder !== undefined ? b.sortOrder : 999;
      
      if (aSort !== bSort) return aSort - bSort;

      // Stable sort: use original array index as fallback
      return MENU.indexOf(a) - MENU.indexOf(b);
    });
  }, [menu, categories]);

  const heroSpecials = useMemo(() => sortedMenu.filter(m => m.isSpecial).slice(0, 3), [sortedMenu]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-bg font-sans selection:bg-orange-accent/30 selection:text-orange-accent pt-16 overflow-x-hidden relative">
      <Header 
        isAdmin={isAdmin} 
        user={user} 
        onOpenAdmin={() => setShowAdminPanel(true)} 
        categories={categories}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isAssistantOpen={isAssistantOpen}
        onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
      />

      <div className={cn(
        "flex flex-col h-[calc(100vh-64px)] h-[calc(100dvh-64px)] overflow-hidden relative transition-all duration-500",
        isAssistantOpen ? "lg:pr-[400px]" : "lg:pr-0"
      )}>
        {/* Admin Panel */}
        <AnimatePresence>
          {showAdminPanel && (
            <AdminPanel 
              onClose={() => setShowAdminPanel(false)} 
              menu={sortedMenu} 
              onMenuUpdate={fetchMenu} 
            />
          )}
        </AnimatePresence>

        {/* Left Sidebar: Info (Pop out over everything) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-16 bottom-0 w-[320px] bg-bg border-r border-border-dim overflow-y-auto custom-scrollbar z-50 shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <SidebarInfo isAdmin={isAdmin} user={user} onOpenAdmin={() => setShowAdminPanel(true)} onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: Hero & Menu */}
        <main className="flex-1 overflow-y-auto custom-scrollbar border-r border-border-dim">
          <Hero isFullHeight={isSidebarOpen} specials={heroSpecials} />
          
          <MenuSection 
            menu={sortedMenu}
            onOrder={addToCart} 
            highlightedItemId={highlightedItemId} 
            highlightedCategory={highlightedCategory}
          />

          <ReviewSection />

          <footer className="p-10 border-t border-border-dim bg-card flex flex-col items-center gap-6">
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
              <button 
                onClick={() => {
                  const el = document.getElementById('menu');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }} 
                className="hover:text-accent transition-colors"
              >
                Menu
              </button>
              <button onClick={() => setIsAssistantOpen(true)} className="lg:hidden hover:text-accent transition-colors">AI WAITRESS</button>
              <button 
                onClick={() => {
                  const el = document.querySelector('main');
                  el?.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className="hover:text-accent transition-colors"
              >
                Back to Top
              </button>
            </div>
            <p className="text-[10px] text-secondary font-medium tracking-widest opacity-30">
              © 2026 THE BRIDGE • 1117 ELM STREET, MANCHESTER NH
            </p>
          </footer>
        </main>

        {/* Right Sidebar: AI Assistant (Fixed on desktop, Slider on mobile) */}
        <div className={cn(
          "transition-all duration-500 overflow-visible bg-card border-l border-border-dim shadow-2xl z-40",
          "fixed right-0 top-16 bottom-0 w-[92%] sm:w-[400px]",
          "lg:fixed lg:inset-y-0 lg:top-16 lg:right-0",
          isAssistantOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <Receptionist 
            menu={sortedMenu}
            cart={cart} 
            setCart={setCart} 
            addToCart={addToCart} 
            removeFromCart={removeFromCart} 
            highlightMenuItem={highlightMenuItem}
            highlightCategory={highlightCategory}
            cancelOrder={cancelOrder}
            deliveryAddress={deliveryAddress}
            setDeliveryAddress={setDeliveryAddress}
            isDelivery={isDelivery}
            setIsDelivery={setIsDelivery}
            onInitPayment={initiatePayment}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            onClose={() => setIsAssistantOpen(false)}
            lastInteraction={lastInteraction}
          />
        </div>

        <AnimatePresence>
          {clientSecret && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-bg/80 backdrop-blur-md flex items-center justify-center p-6"
            >
              <Elements stripe={stripePromise} options={stripeOptions}>
                <PaymentForm 
                  amount={paymentAmount * 100} 
                  cart={cart}
                  onSuccess={(id) => {
                    setClientSecret(null);
                    setCart([]);
                  }}
                  onCancel={() => setClientSecret(null)}
                />
              </Elements>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
