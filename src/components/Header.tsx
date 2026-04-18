import { useState } from "react";
import { Coffee, Settings, LogIn, User, ChevronDown, Menu, X, MessageSquareText } from "lucide-react";
import { signIn } from "../lib/firebase";
import { cn } from "../lib/utils";

interface HeaderProps {
  isAdmin: boolean;
  user: any;
  onOpenAdmin: () => void;
  categories: string[];
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isAssistantOpen: boolean;
  onToggleAssistant: () => void;
}

export function Header({ isAdmin, user, onOpenAdmin, categories, isSidebarOpen, onToggleSidebar, isAssistantOpen, onToggleAssistant }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border-dim/50">
      <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between relative">
        <div className="flex items-center gap-6">
          <button 
            onClick={onToggleSidebar}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-secondary hover:text-accent"
            title={isSidebarOpen ? "Close Information" : "Open Information"}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center rotate-3 shadow-lg shadow-accent/20">
              <Coffee className="w-6 h-6 text-bg" />
            </div>
            <div>
              <span className="font-display text-lg font-black text-accent tracking-tighter block leading-none">THE BRIDGE</span>
            </div>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-secondary">
          {[
            {
              label: "Specials",
              items: ["Soups", "Specials"]
            },
            {
              label: "Food",
              items: ["Breakfast", "Lunch", "Dessert"]
            },
            {
              label: "Drinks",
              items: ["Espresso", "Tea", "Coffee", "Juice", "Smoothie"]
            }
          ].map((group) => (
            <div 
              key={group.label}
              className="relative group/nav"
              onMouseEnter={() => setShowDropdown(group.label as any)}
              onMouseLeave={() => setShowDropdown(null)}
            >
              <button 
                className={cn(
                  "flex items-center gap-2 hover:text-accent transition-colors py-4",
                  showDropdown === group.label && "text-accent"
                )}
              >
                {group.label}
                <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", showDropdown === group.label && "rotate-180")} />
              </button>
              
              <div 
                className={cn(
                  "absolute top-full left-0 w-48 bg-card border border-border-dim p-2 rounded-xl shadow-2xl transition-all duration-300 origin-top z-50",
                  showDropdown === group.label ? "opacity-100 translate-y-0 scale-100 visible" : "opacity-0 -translate-y-2 scale-95 invisible"
                )}
              >
                <div className="space-y-1">
                  {group.items.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        const el = document.getElementById(`category-${cat.toLowerCase()}`);
                        el?.scrollIntoView({ behavior: 'smooth' });
                        setShowDropdown(null);
                      }}
                      className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-accent hover:bg-white/5 rounded-lg transition-all"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              const el = document.getElementById('category-catering');
              el?.scrollIntoView({ behavior: 'smooth' });
              setShowDropdown(null);
            }}
            className="hover:text-accent transition-colors"
          >
            Catering
          </button>

          {isAdmin && (
            <button 
              onClick={onOpenAdmin}
              className="flex items-center gap-2 text-orange-accent hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4 animate-spin-slow" />
              Admin
            </button>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleAssistant}
            className="bg-accent text-bg px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.1em] hover:bg-orange-accent hover:text-white transition-all shadow-lg shadow-accent/20 active:scale-95 whitespace-nowrap min-w-[120px]"
          >
            {isAssistantOpen ? "MENU" : "ORDER"}
          </button>
        </div>
      </div>
    </header>
  );
}
