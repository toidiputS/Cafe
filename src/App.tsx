/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { MenuSection } from "./components/MenuSection";
import { Receptionist } from "./components/Receptionist";
import { SidebarInfo } from "./components/SidebarInfo";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { MENU, type MenuItem, CATEGORY_METADATA, SUBCATEGORY_ORDER } from "./data/menu";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentForm } from "./components/PaymentForm";
import { motion, AnimatePresence } from "motion/react";
import { auth, db, handleFirestoreError, OperationType } from "./lib/firebase";
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
    const path = "menu";
    try {
      const q = query(collection(db, path));
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
      handleFirestoreError(e, OperationType.LIST, path);
      setMenu(MENU); // Fallback to static menu on error
    }
  }, []);

  const migrateMenu = useCallback(async () => {
    const path = "menu";
    try {
      console.log("Migrating static menu to Firestore...");
      for (const item of MENU) {
        await setDoc(doc(db, path, item.id), item);
      }
      fetchMenu();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  }, [fetchMenu]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  useEffect(() => {
    if (isAdmin && user && menu.length > 0) {
      const hasSpecials = menu.some(m => m.category === "Weekly Soups and Specials");
      const chickenRice = menu.find(m => m.id === "s-chicken-rice");
      const bagelButter = menu.find(m => m.id === "b-bag-butter");
      
      const needsUpdate = !hasSpecials || 
                          (chickenRice && !Array.isArray(chickenRice.price)) ||
                          (bagelButter && !bagelButter.description);
      
      if (needsUpdate) {
        migrateMenu();
      }
    }
  }, [menu, isAdmin, user, migrateMenu]);

  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        // Check admin status
        const path = `admins/${fbUser.uid}`;
        try {
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
              handleFirestoreError(e, OperationType.WRITE, path);
            }
          } else {
            setIsAdmin(false);
          }

          // If admin and menu is empty, trigger migration
          if (isUserAdmin) {
            const menuPath = "menu";
            try {
              const q = query(collection(db, menuPath));
              const snap = await getDocs(q);
              if (snap.empty) {
                migrateMenu();
              }
            } catch (e) {
              handleFirestoreError(e, OperationType.LIST, menuPath);
            }
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, path);
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
    const path = `orders/${orderId}`;
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "Cancelled",
        updatedAt: serverTimestamp()
      });
      return `Order ${orderId} has been cancelled successfully.`;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
      return `Failed to cancel order ${orderId}.`;
    }
  }, []);

  const paymentSuccessRef = useRef<((id: string) => void) | null>(null);

  const finalizeOrder = useCallback(async (paymentIntentId: string) => {
    if (paymentSuccessRef.current) {
      paymentSuccessRef.current(paymentIntentId);
    }
    setClientSecret(null);
  }, []);

  const onPaymentSuccessRegister = useCallback((callback: (id: string) => void) => {
    paymentSuccessRef.current = callback;
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
            address: deliveryAddress || "N/A",
            customer: user?.email || "Guest"
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
  }, [cart, isDelivery, deliveryAddress, user]);

  const stripeOptions = useMemo(() => ({
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#ff6b00',
        colorBackground: '#1a1a1a',
        colorText: '#ffffff',
        colorDanger: '#df1b41',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '12px',
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
    <div id="app-container" className="min-h-screen min-h-[100dvh] bg-bg font-sans selection:bg-orange-accent/30 selection:text-orange-accent pt-16 overflow-x-hidden relative">
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
              className="fixed left-0 top-16 bottom-0 w-[320px] bg-bg border-r border-border-dim overflow-y-auto custom-scrollbar z-50 shadow-[20px_0_50px_rgba(0,0,0,0.5)] pwa-safe-top"
            >
              <SidebarInfo isAdmin={isAdmin} user={user} onOpenAdmin={() => setShowAdminPanel(true)} onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: Hero & Menu */}
        <div className="flex-1 overflow-visible border-r border-border-dim flex flex-col">
          <main id="main-content" aria-label="Menu and Featured Items" className="flex-1 overflow-y-auto custom-scrollbar pwa-safe-bottom">
            <Hero isFullHeight={isSidebarOpen} specials={heroSpecials} />
            
            <MenuSection 
              menu={sortedMenu}
              onOrder={addToCart} 
              highlightedItemId={highlightedItemId} 
              highlightedCategory={highlightedCategory}
            />

            <ReviewSection />
          </main>

          <footer aria-label="Contact and Legal Information" className="p-10 pb-32 md:pb-10 border-t border-border-dim bg-card flex flex-col items-center gap-6 pwa-safe-bottom">
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
        </div>

        {/* Right Sidebar: AI Assistant (Fixed on desktop, Slider on mobile) */}
        <div className={cn(
          "transition-all duration-500 overflow-visible bg-card border-l border-border-dim shadow-2xl z-[110]",
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
            onPaymentSuccess={onPaymentSuccessRegister}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            onClose={() => setIsAssistantOpen(false)}
            lastInteraction={lastInteraction}
          />
        </div>

        <MobileBottomNav 
          onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeSection={highlightedCategory || ""}
        />
 
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
                    finalizeOrder(id);
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
