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
import { supabase } from "./lib/supabase";
import { AdminPanel } from "./components/AdminPanel";
import { ReviewSection } from "./components/ReviewSection";
import { CheckoutOverlay } from "./components/CheckoutOverlay";
import { LogIn } from "lucide-react";
import { cn } from "./lib/utils";
import { OnboardingModal } from "./components/OnboardingModal";


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
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
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
      const { data, error } = await supabase
        .from('menu')
        .select('*')
        .eq('is_active', true);
      
      if (error || !data || data.length === 0) {
        console.warn('Supabase menu fetch failed or empty, using static fallback');
        setMenu(MENU);
        return;
      }

      const fetchedMenu = data.map(item => ({
        ...item,
        price: Number(item.price) // Convert decimal string to number
      })) as MenuItem[];
      setMenu(fetchedMenu);
    } catch (e) {
      console.error('Supabase Error:', e);
      setMenu(MENU); // Fallback to static menu on error
    }
  }, []);

  const migrateMenu = useCallback(async () => {
    try {
      console.log("Migrating static menu to Supabase...");
      const { error } = await supabase
        .from('menu')
        .upsert(MENU.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          sub_category: item.subcategory || "",
          image: item.image,
          options: item.options,
          is_active: true
        })));
      
      if (error) throw error;
      fetchMenu();
    } catch (e) {
      console.error('Migration failed:', e);
      setMenu(MENU);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const sbUser = session?.user || null;
      setUser(sbUser as any);
      
      if (sbUser) {
        // Check admin status in profiles table
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', sbUser.id)
            .single();

          if (profile?.is_admin) {
            setIsAdmin(true);
          } else if (sbUser.email === "klutchkanobi@gmail.com") {
            // Bootstrap first admin
            await supabase.from('profiles').upsert({
              id: sbUser.id,
              email: sbUser.email,
              is_admin: true
            });
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (e) {
          console.error("Auth profile check failed:", e);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
    return `Order ${orderId} has been cancelled successfully.`;
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
      <OnboardingModal />
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
        "flex flex-col flex-1 transition-all duration-500",
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

        {/* Click-away Backdrop */}
        <AnimatePresence>
          {(isSidebarOpen || (isAssistantOpen && window.innerWidth < 1024)) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsSidebarOpen(false);
                if (window.innerWidth < 1024) setIsAssistantOpen(false);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]"
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
        <div className="flex-1 flex flex-col">
          <main id="main-content" aria-label="Menu and Featured Items" className="flex-1 pwa-safe-bottom">
            <Hero isFullHeight={isSidebarOpen} specials={heroSpecials} />
            
            <MenuSection 
              menu={sortedMenu}
              cart={cart}
              onOrder={addToCart} 
              highlightedItemId={highlightedItemId} 
              highlightedCategory={highlightedCategory}
            />

            <ReviewSection />
          </main>

          <footer aria-label="Contact and Legal Information" className="relative p-8 pb-24 md:pb-8 bg-card flex flex-col items-center gap-5 pwa-safe-bottom">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex gap-8 text-[8px] font-black uppercase tracking-[0.25em] text-secondary/60">
              <button 
                onClick={() => {
                  const el = document.getElementById('menu');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }} 
                className="hover:text-accent transition-colors"
              >
                Menu
              </button>
              <button onClick={() => setIsAssistantOpen(true)} className="lg:hidden hover:text-accent transition-colors">Order</button>
              <button 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className="hover:text-accent transition-colors"
              >
                Back to Top
              </button>
            </div>
            <p className="text-[9px] text-secondary font-medium tracking-[0.3em] opacity-20 uppercase">
              © 2026 The Bridge Café · 1117 Elm Street, Manchester NH
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
            onOpenCheckout={() => {
              setIsCheckoutOpen(true);
              setIsAssistantOpen(false);
            }}
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
          {isCheckoutOpen && (
            <CheckoutOverlay 
              isOpen={isCheckoutOpen}
              onClose={() => setIsCheckoutOpen(false)}
              cart={cart}
              user={user}
              isDelivery={isDelivery}
              setIsDelivery={setIsDelivery}
              deliveryAddress={deliveryAddress}
              setDeliveryAddress={setDeliveryAddress}
              onInitiatePayment={(total) => {
                setIsCheckoutOpen(false);
                initiatePayment(total);
              }}
            />
          )}
        </AnimatePresence>

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
