import React, { useState, useEffect, useMemo } from "react";
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Star, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChefHat,
  ShoppingBag,
  TrendingUp,
  Search,
  LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  onSnapshot,
  limit,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { type MenuItem } from "../data/menu";
import { cn } from "../lib/utils";

interface AdminPanelProps {
  onClose: () => void;
  menu: MenuItem[];
  onMenuUpdate: () => void;
}

type Tab = "dashboard" | "orders" | "menu" | "settings";

export function AdminPanel({ onClose, menu, onMenuUpdate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [orderFilter, setOrderFilter] = useState<string>("all");

  const categories = ["All", ...Array.from(new Set(menu.map(item => item.category)))];

  useEffect(() => {
    setItems(menu);
  }, [menu]);

  // Real-time Orders
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snap) => {
      const fetchedOrders = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(fetchedOrders);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  const dashboardStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => o.createdAt?.toDate() >= today);
    const totalSales = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingCount = orders.filter(o => o.status === "Pending" || o.status === "Preparing").length;
    return { totalSales, todayOrderCount: todayOrders.length, pendingCount };
  }, [orders]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    setError(null);
    try {
      if (editingItem.id) {
        const { id, ...data } = editingItem;
        await updateDoc(doc(db, "menu", id), data as any);
      } else {
        await addDoc(collection(db, "menu"), {
          ...editingItem,
          createdAt: new Date().toISOString()
        });
      }
      onMenuUpdate();
      setEditingItem(null);
    } catch (err) {
      console.error("Error saving menu item:", err);
      setError("Failed to save changes. Admin permissions required.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders;
    return orders.filter(o => o.status.toLowerCase() === orderFilter.toLowerCase());
  }, [orders, orderFilter]);

  const filteredItems = filterCategory === "All" 
    ? items 
    : items.filter(i => i.category === filterCategory);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="relative w-full max-w-6xl h-[85vh] bg-[#121212] border border-white/10 rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] flex overflow-hidden"
      >
        {/* Sidebar Navigation */}
        <aside className="w-20 lg:w-64 border-r border-white/10 flex flex-col bg-[#0a0a0a]">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-bg" />
            </div>
            <span className="hidden lg:block font-display font-black text-accent tracking-tighter uppercase text-lg">Control</span>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { id: "orders", icon: ShoppingBag, label: "Live Orders", badge: dashboardStats.pendingCount },
              { id: "menu", icon: ChefHat, label: "Menu Editor" },
              { id: "settings", icon: Settings, label: "Settings" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl transition-all group relative",
                  activeTab === tab.id ? "bg-accent text-bg shadow-lg shadow-accent/20" : "hover:bg-white/5 text-secondary"
                )}
              >
                <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-bg" : "group-hover:text-white")} />
                <span className="hidden lg:block font-bold text-xs uppercase tracking-widest">{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && activeTab !== tab.id && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-white/10">
            <button 
              onClick={onClose}
              className="w-full flex items-center justify-center gap-3 p-3 text-secondary hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
            >
              <LogIn className="w-4 h-4 rotate-180" />
              <span className="hidden lg:block">Exit Panel</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0d0d0d]">
            <h3 className="font-display font-black text-xs uppercase tracking-[0.2em] text-secondary">
              {activeTab} view
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase text-secondary">Kitchen Live</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 space-y-2">
                    <Label>Today\'s Sales</Label>
                    <p className="text-4xl font-display font-black text-white">${dashboardStats.totalSales.toFixed(2)}</p>
                    <div className="flex items-center gap-2 text-green-400">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-[10px] font-bold">Live Tracking</span>
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 space-y-2">
                    <Label>Orders Placed</Label>
                    <p className="text-4xl font-display font-black text-white">{dashboardStats.todayOrderCount}</p>
                    <span className="text-[10px] font-bold text-secondary uppercase">Last 24 hours</span>
                  </div>
                  <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 space-y-2">
                    <Label>Pending Action</Label>
                    <p className="text-4xl font-display font-black text-red-500">{dashboardStats.pendingCount}</p>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Immediate Attention</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                  {["all", "pending", "preparing", "ready", "completed"].map(f => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        orderFilter === f ? "bg-white text-bg" : "bg-white/5 text-secondary hover:bg-white/10"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredOrders.map(order => (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#1a1a1a] rounded-2xl border border-white/5 flex flex-col md:flex-row overflow-hidden group shadow-lg hover:border-accent/30 transition-all"
                      >
                        {/* Status Rail */}
                        <div className={cn(
                          "w-2 md:w-3",
                          order.status === "Pending" ? "bg-red-500" : 
                          order.status === "Preparing" ? "bg-orange-accent" :
                          order.status === "Ready" ? "bg-green-500" : "bg-white/20"
                        )} />

                        <div className="flex-1 p-6 flex flex-col md:flex-row gap-8">
                          <div className="md:w-64 space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono text-secondary px-2 py-0.5 bg-white/5 rounded border border-white/10">#{order.id.slice(-6).toUpperCase()}</span>
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                order.status === "Pending" ? "bg-red-500/10 text-red-400" : "bg-white/5 text-secondary"
                              )}>{order.status}</span>
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">{order.customerName || "Walk-in Customer"}</h4>
                              <p className="text-[10px] text-secondary font-medium uppercase mt-1">
                                {order.isDelivery ? `Delivery: ${order.address}` : "Carry Out Order"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-secondary">
                              <Clock className="w-3 h-3" />
                              <span className="text-[10px] font-mono">{order.createdAt?.toDate().toLocaleTimeString()}</span>
                            </div>
                          </div>

                          <div className="flex-1 border-t md:border-t-0 md:border-l border-white/10 md:pl-8 pt-4 md:pt-0">
                            <Label>Order Items</Label>
                            <div className="mt-3 space-y-2">
                              {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-start text-xs border-b border-white/5 pb-2">
                                  <div>
                                    <span className="font-bold text-white">{item.quantity}x {item.name}</span>
                                    {item.options && <p className="text-[9px] text-secondary mt-0.5">Choice: {item.options}</p>}
                                    {item.customizations && <p className="text-[9px] text-orange-accent font-bold mt-0.5 italic">! {item.customizations}</p>}
                                  </div>
                                  <span className="font-mono text-secondary">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="md:w-48 flex flex-col justify-between items-end gap-6">
                            <div className="text-right">
                              <Label>Total Value</Label>
                              <p className="text-2xl font-display font-black text-white">${(order.total || 0).toFixed(2)}</p>
                            </div>
                            
                            <div className="w-full flex gap-2">
                              {order.status === "Pending" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "Preparing")}
                                  className="flex-1 bg-white text-bg py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-accent transition-colors"
                                >
                                  Kitchen
                                </button>
                              )}
                              {order.status === "Preparing" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "Ready")}
                                  className="flex-1 bg-accent text-bg py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-orange-accent"
                                >
                                  Ready
                                </button>
                              )}
                              {order.status === "Ready" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "Completed")}
                                  className="flex-1 bg-green-500 text-white py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-green-600"
                                >
                                  Finish
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {activeTab === "menu" && (
              <div className="flex h-full gap-8">
                {/* Menu List */}
                <div className="w-1/3 flex flex-col gap-4">
                  <div className="space-y-4">
                    <button 
                      onClick={() => setEditingItem({ name: "", price: 0, category: "Breakfast" })}
                      className="w-full py-4 bg-white text-bg rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Item
                    </button>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                      <input 
                        placeholder="Search menu..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {filteredItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setEditingItem(item)}
                        className={cn(
                          "w-full p-4 rounded-xl border transition-all text-left flex justify-between items-center group",
                          editingItem?.id === item.id ? "bg-accent/10 border-accent/50" : "bg-white/5 border-transparent hover:border-white/10"
                        )}
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{item.name}</p>
                          <p className="text-[10px] text-secondary font-mono mt-1">${item.price.toFixed(2)}</p>
                        </div>
                        {item.isSpecial && <Star className="w-3.5 h-3.5 text-accent fill-accent" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor */}
                <div className="flex-1 bg-[#1a1a1a] rounded-2xl border border-white/5 p-8 overflow-y-auto custom-scrollbar">
                  {editingItem ? (
                    <form onSubmit={handleSave} className="space-y-8">
                      <div>
                        <Label>Basic Information</Label>
                        <div className="grid grid-cols-2 gap-6 mt-4">
                          <InputBlock 
                            label="Item Name" 
                            value={editingItem.name || ""} 
                            onChange={(v) => setEditingItem({...editingItem, name: v})} 
                          />
                          <InputBlock 
                            label="Price ($)" 
                            type="number"
                            value={editingItem.price || ""} 
                            onChange={(v) => setEditingItem({...editingItem, price: parseFloat(v)})} 
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Classification</Label>
                        <div className="grid grid-cols-2 gap-6 mt-4">
                          <InputBlock 
                            label="Category" 
                            value={editingItem.category || ""} 
                            onChange={(v) => setEditingItem({...editingItem, category: v})} 
                          />
                          <InputBlock 
                            label="Subcategory" 
                            value={editingItem.subcategory || ""} 
                            onChange={(v) => setEditingItem({...editingItem, subcategory: v})} 
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Description</label>
                        <textarea 
                          value={editingItem.description || ""}
                          onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                          rows={4}
                          className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-accent resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-between p-6 bg-accent/5 rounded-2xl border border-accent/20">
                        <div className="flex items-center gap-4">
                          <Star className={cn("w-6 h-6", editingItem.isSpecial ? "text-accent fill-accent" : "text-white/20")} />
                          <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-tight">Highlight as Special</h4>
                            <p className="text-[10px] text-secondary font-medium mt-1">Boost visibility and add visual accents in the menu</p>
                          </div>
                        </div>
                        <Switch 
                          checked={!!editingItem.isSpecial} 
                          onChange={(v) => setEditingItem({...editingItem, isSpecial: v})} 
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setEditingItem(null)}
                          className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-secondary hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-10 py-3 bg-white text-bg rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-accent transition-all disabled:opacity-50"
                        >
                          {isSaving ? "Syncing..." : <><Save className="w-4 h-4" /> Save Item</>}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                      <ChefHat className="w-24 h-24 mb-6" />
                      <p className="font-display font-black text-2xl uppercase tracking-tighter">Editor Standby</p>
                      <p className="text-xs uppercase tracking-widest mt-2">Select an item from the sidebar to modify</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </motion.div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="block text-[10px] font-black uppercase tracking-widest text-secondary">{children}</span>;
}

function InputBlock({ label, value, onChange, type = "text" }: { label: string, value: any, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-secondary">{label}</label>
      <input 
        type={type}
        step={type === "number" ? "0.01" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white focus:outline-none focus:border-accent transition-all"
      />
    </div>
  );
}

function Switch({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "w-14 h-7 rounded-full relative transition-colors duration-300",
        checked ? "bg-accent" : "bg-white/10"
      )}
    >
      <div className={cn(
        "absolute top-1 w-5 h-5 bg-[#0a0a0a] rounded-full transition-transform duration-300 shadow-xl",
        checked ? "left-[30px]" : "left-1"
      )} />
      {checked && (
        <motion.div 
          layoutId="switch-glow"
          className="absolute inset-0 bg-accent rounded-full blur-[10px] opacity-20" 
        />
      )}
    </button>
  );
}

function LogIn({ className }: { className?: string }) { // Recycled icon for exit
  return <X className={className} />;
}
