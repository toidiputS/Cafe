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
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  limit,
  Timestamp,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { type MenuItem, MENU as STATIC_MENU } from "../data/menu";
import { cn } from "../lib/utils";

interface AdminPanelProps {
  onClose: () => void;
  menu: MenuItem[];
  onMenuUpdate: (newMenu?: MenuItem[]) => void;
}

type Tab = "dashboard" | "orders" | "menu" | "analytics" | "settings";

export function AdminPanel({ onClose, menu, onMenuUpdate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");

  const categories = ["All", ...Array.from(new Set(menu.map(item => item.category)))];

  useEffect(() => {
    setItems(menu);
  }, [menu]);

  // Real-time Orders
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(50));
    const path = "orders";
    const unsubscribe = onSnapshot(q, (snap) => {
      const fetchedOrders = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(fetchedOrders);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, "orders", orderId), { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const dashboardStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => o.createdAt?.toDate() >= today);
    const totalSales = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingCount = orders.filter(o => o.status === "Pending" || o.status === "Preparing").length;
    
    // Additional metrics
    const averageOrderValue = todayOrders.length > 0 ? totalSales / todayOrders.length : 0;
    const completedCount = orders.filter(o => o.status === "Completed").length;
    const cancellationCount = orders.filter(o => o.status === "Cancelled").length;
    
    return { totalSales, todayOrderCount: todayOrders.length, pendingCount, averageOrderValue, completedCount, cancellationCount };
  }, [orders]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    setError(null);
    const path = "menu";
    try {
      if (editingItem.id) {
        const { id, ...data } = editingItem;
        await updateDoc(doc(db, path, id), data as any);
      } else {
        await addDoc(collection(db, path), {
          ...editingItem,
          createdAt: new Date().toISOString()
        });
      }
      onMenuUpdate();
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders;
    return orders.filter(o => o.status.toLowerCase() === orderFilter.toLowerCase());
  }, [orders, orderFilter]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = filterCategory === "All" || item.category === filterCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [items, filterCategory, searchQuery]);

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
        className="relative w-full max-w-6xl h-[95dvh] lg:h-[85vh] bg-[#121212] border border-white/10 rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] flex overflow-hidden pwa-safe-top pwa-safe-bottom"
      >
        {/* Sidebar Navigation */}
        <aside aria-label="Admin Navigation" className="w-16 lg:w-64 border-r border-white/10 flex flex-col bg-[#0a0a0a]">
          <div className="p-4 lg:p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5 text-bg" />
            </div>
            <span className="hidden lg:block font-display font-black text-accent tracking-tighter uppercase text-lg">Control</span>
          </div>

          <nav className="flex-1 p-2 lg:p-4 space-y-1 lg:space-y-2">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { id: "orders", icon: ShoppingBag, label: "Live Orders", badge: dashboardStats.pendingCount },
              { id: "menu", icon: ChefHat, label: "Menu Editor" },
              { id: "analytics", icon: TrendingUp, label: "Analytics" },
              { id: "settings", icon: Settings, label: "Settings" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 lg:p-4 rounded-xl transition-all group relative",
                  activeTab === tab.id ? "bg-accent text-bg shadow-lg shadow-accent/20" : "hover:bg-white/5 text-secondary"
                )}
                title={tab.label}
              >
                <tab.icon className={cn("w-5 h-5 shrink-0", activeTab === tab.id ? "text-bg" : "group-hover:text-white")} />
                <span className="hidden lg:block font-bold text-xs uppercase tracking-widest truncate">{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && activeTab !== tab.id && (
                  <span className="absolute top-1 right-1 lg:top-2 lg:right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 lg:p-6 border-t border-white/10 font-black">
            <button 
              onClick={onClose}
              className="w-full flex items-center justify-center gap-3 p-3 text-secondary hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden lg:block">Exit</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 lg:px-8 bg-[#0d0d0d] shrink-0">
            <h3 className="font-display font-black text-[10px] uppercase tracking-[0.2em] text-secondary truncate mr-2">
              {activeTab}
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="hidden sm:inline text-[9px] font-black uppercase text-secondary">Kitchen Live</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                    <Label>Average Ticket</Label>
                    <p className="text-4xl font-display font-black text-accent">${dashboardStats.averageOrderValue.toFixed(2)}</p>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Per Customer</span>
                  </div>
                  <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 space-y-2">
                    <Label>Pending Action</Label>
                    <p className="text-4xl font-display font-black text-red-500">{dashboardStats.pendingCount}</p>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Immediate Attention</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-secondary mb-6 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recent Activity
                    </h4>
                    <div className="space-y-4">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                          <div>
                            <p className="text-xs font-bold text-white">{order.customerName || "Customer"}</p>
                            <p className="text-[10px] text-secondary font-mono mt-0.5">${(order.total || 0).toFixed(2)} • {order.status}</p>
                          </div>
                          <span className="text-[9px] text-secondary font-mono uppercase">{order.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-secondary mb-6 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Orders Summary
                    </h4>
                    <div className="space-y-6">
                      {[
                        { label: "Completed", count: dashboardStats.completedCount, color: "bg-green-500" },
                        { label: "Pending", count: dashboardStats.pendingCount, color: "bg-red-500" },
                        { label: "Cancelled", count: dashboardStats.cancellationCount, color: "bg-white/20" }
                      ].map(stat => (
                        <div key={stat.label} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-secondary">{stat.label}</span>
                            <span className="text-white">{stat.count}</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full transition-all duration-500", stat.color)} 
                              style={{ width: `${orders.length > 0 ? (stat.count / orders.length) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 pb-4 border-b border-white/10">
                  {["all", "pending", "preparing", "ready", "completed"].map(f => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      className={cn(
                        "w-full md:w-auto px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all text-left md:text-center",
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

            {activeTab === "analytics" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-secondary mb-8">Sales Overview (MTD)</h4>
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                      {/* Simple Bar Chart Concept */}
                      {[40, 60, 45, 90, 75, 55, 30].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                          <div className="w-full bg-accent/20 rounded-t-lg group-hover:bg-accent/40 transition-all relative overflow-hidden" style={{ height: `${h}%` }}>
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: "100%" }}
                              className="absolute bottom-0 left-0 right-0 bg-accent transition-all"
                            />
                          </div>
                          <span className="text-[9px] font-black text-secondary tracking-widest">DAY {i+1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-secondary mb-8 text-center sm:text-left">Popular Categories</h4>
                    <div className="space-y-8">
                      {[
                        { label: "Breakfast", count: 124, price: 1540 },
                        { label: "Lunch", count: 98, price: 1210 },
                        { label: "Drinks", count: 245, price: 890 }
                      ].map(cat => (
                        <div key={cat.label} className="flex items-center gap-6">
                           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                             <Label>{cat.label[0]}</Label>
                           </div>
                           <div className="flex-1 space-y-1.5">
                             <div className="flex justify-between text-xs font-bold text-white">
                               <span>{cat.label}</span>
                               <span className="text-accent">${cat.price}</span>
                             </div>
                             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-accent/40 w-full" style={{ width: `${(cat.count / 300) * 100}%` }} />
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 overflow-x-auto">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-secondary mb-6">Top Performing Items</h4>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-secondary">Item Name</th>
                          <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-secondary">Units Sold</th>
                          <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-secondary">Revenue</th>
                          <th className="pb-4 text-[9px] font-black uppercase tracking-widest text-secondary text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.slice(0, 5).map(item => (
                          <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 text-xs font-bold text-white uppercase tracking-tight">{item.name}</td>
                            <td className="py-4 text-xs font-mono text-secondary">{(Math.random() * 100).toFixed(0)}</td>
                            <td className="py-4 text-xs font-mono text-white">${(Math.random() * 1000).toFixed(2)}</td>
                            <td className="py-4 text-right">
                              <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-[8px] font-black uppercase tracking-widest">Trending</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </div>
            )}
            {activeTab === "menu" && (
              <div className="flex flex-col md:flex-row h-full gap-8">
                {/* Menu Sidebar */}
                <div className="w-full md:w-1/3 flex flex-col min-h-0">
                  <div className="space-y-4 pb-6 border-b border-white/10 shrink-0">
                    <button 
                      onClick={() => setEditingItem({ name: "", price: 0, category: "Breakfast" })}
                      className="w-full py-4 bg-white text-bg rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-accent transition-all shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Item
                    </button>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                      <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search menu..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent text-white"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category Filters (Scrollable on Mobile) */}
                  <div className="py-4 shrink-0">
                    <Label>Categories</Label>
                    <div className="flex md:flex-wrap gap-2 mt-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide no-scrollbar">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setFilterCategory(cat)}
                          className={cn(
                            "whitespace-nowrap px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border shrink-0",
                            filterCategory === cat ? "bg-accent text-bg border-accent shadow-lg" : "bg-white/5 text-secondary border-transparent hover:border-white/10"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scrollable Item List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar min-h-0">
                    {filteredItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setEditingItem(item)}
                        className={cn(
                          "w-full p-4 rounded-xl border transition-all text-left flex justify-between items-center group",
                          editingItem?.id === item.id ? "bg-accent/10 border-accent/50 shadow-inner" : "bg-white/5 border-transparent hover:border-white/10"
                        )}
                      >
                        <div className="min-w-0 flex-1 mr-4">
                          <p className="text-xs font-bold text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-secondary font-mono mt-1">
                            ${Array.isArray(item.price) 
                              ? item.price.map(p => p.toFixed(2)).join(", ") 
                              : item.price.toFixed(2)}
                          </p>
                        </div>
                        {item.isSpecial && <Star className="w-3.5 h-3.5 text-accent fill-accent shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor */}
                <div className="flex-1 bg-[#1a1a1a] rounded-2xl border border-white/5 p-4 md:p-8 overflow-y-auto custom-scrollbar shadow-2xl min-h-0">
                  {editingItem ? (
                    <form onSubmit={handleSave} className="space-y-6 md:space-y-8">
                      <div>
                        <Label>Basic Information</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
                        <Label>Classification & Inventory</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
                          <InputBlock 
                            label="Stock Quantity" 
                            type="number"
                            value={editingItem.stockQuantity ?? ""} 
                            onChange={(v) => setEditingItem({...editingItem, stockQuantity: parseInt(v)})} 
                          />
                          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 mt-6 lg:mt-5">
                            <div>
                               <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Active Status</h4>
                               <p className="text-[9px] text-secondary mt-1">Hide item from customer view</p>
                            </div>
                            <Switch 
                              checked={editingItem.isActive !== false} 
                              onChange={(v) => setEditingItem({...editingItem, isActive: v})} 
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Special Pricing & Badges</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          <InputBlock 
                            label="Discounted Price ($)" 
                            type="number"
                            value={editingItem.discountedPrice ?? ""} 
                            onChange={(v) => setEditingItem({...editingItem, discountedPrice: parseFloat(v)})} 
                          />
                          <InputBlock 
                            label="Badge Text (e.g. HAPPY HOUR)" 
                            value={editingItem.discountLabel || ""} 
                            onChange={(v) => setEditingItem({...editingItem, discountLabel: v})} 
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

                      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setEditingItem(null)}
                          className="w-full sm:w-auto px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-secondary hover:text-white transition-colors bg-white/5 border border-white/10 sm:border-none"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="w-full sm:w-auto px-10 py-4 bg-white text-bg rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-accent transition-all disabled:opacity-50 shadow-xl"
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

            {activeTab === "settings" && (
              <div className="max-w-2xl mx-auto space-y-12">
                <div className="bg-[#1a1a1a] rounded-3xl border border-accent/20 p-8 space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:bg-accent/10 transition-all" />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20">
                      <LayoutDashboard className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">Database Sync</h3>
                      <p className="text-[10px] text-secondary font-medium uppercase tracking-widest mt-1">Force update menu from source code</p>
                    </div>
                  </div>

                  <p className="text-xs text-secondary leading-relaxed max-w-lg">
                    This will overwrite your existing cloud-stored menu with the static menu items defined in the application's source code. 
                    <span className="text-orange-accent block font-bold mt-2">Warning: All manual edits performed in this panel will be lost.</span>
                  </p>

                    {!showSyncConfirm ? (
                      <button
                        onClick={() => {
                          setShowSyncConfirm(true);
                          setSyncStatus("idle");
                        }}
                        disabled={isSaving || syncStatus === "success"}
                        className={cn(
                          "w-full sm:w-auto px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10",
                          syncStatus === "success" ? "bg-green-500 text-white" : "bg-accent text-bg hover:bg-orange-accent"
                        )}
                      >
                        {syncStatus === "success" ? "Restore Complete ✓" : "Sync Database with Code"}
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <button
                          onClick={async () => {
                            setIsSaving(true);
                            const path = "menu";
                            try {
                              // 1. Delete all existing menu docs
                              const snap = await getDocs(collection(db, path));
                              const deleteBuffer = snap.docs;
                              
                              let currentBatch = writeBatch(db);
                              let count = 0;

                              for (const d of deleteBuffer) {
                                currentBatch.delete(d.ref);
                                count++;
                                if (count >= 400) {
                                  await currentBatch.commit();
                                  currentBatch = writeBatch(db);
                                  count = 0;
                                }
                              }
                              if (count > 0) await currentBatch.commit();

                              // 2. Add static items
                              const staticItems = STATIC_MENU;
                              
                              currentBatch = writeBatch(db);
                              count = 0;

                              for (const item of staticItems) {
                                const { id, ...data } = item;
                                const docRef = doc(db, path, id);
                                currentBatch.set(docRef, data);
                                count++;
                                if (count >= 400) {
                                  await currentBatch.commit();
                                  currentBatch = writeBatch(db);
                                  count = 0;
                                }
                              }
                              if (count > 0) await currentBatch.commit();

                              onMenuUpdate(staticItems);
                              setSyncStatus("success");
                              setShowSyncConfirm(false);
                            } catch (err) {
                              handleFirestoreError(err, OperationType.WRITE, path);
                              setSyncStatus("error");
                              setError(err instanceof Error ? err.message : "Unknown error");
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                          disabled={isSaving}
                          className="w-full sm:w-auto px-10 py-4 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50 relative z-10 animate-pulse"
                        >
                          {isSaving ? "Overwriting..." : "Confirm: Wipe & Sync"}
                        </button>
                        <button
                          onClick={() => setShowSyncConfirm(false)}
                          disabled={isSaving}
                          className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {syncStatus === "error" && (
                      <p className="text-red-500 text-[10px] font-bold uppercase mt-2">{error}</p>
                    )}
                    {syncStatus === "success" && (
                      <p className="text-green-500 text-[10px] font-bold uppercase mt-2">Menu has been reverted to the original code version.</p>
                    )}
                </div>

                <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                      <Settings className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">System Info</h3>
                      <p className="text-[10px] text-secondary font-medium uppercase tracking-widest mt-1">Active Database & Node Status</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-[10px] text-secondary uppercase font-bold tracking-widest">Environment</span>
                      <span className="text-[10px] text-white font-mono">Production</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-[10px] text-secondary uppercase font-bold tracking-widest">Menu Items</span>
                      <span className="text-[10px] text-white font-mono">{menu.length}</span>
                    </div>
                  </div>
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
