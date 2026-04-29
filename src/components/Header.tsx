import { useState } from "react";
import { Coffee, Settings, LogIn, User, ChevronDown, Menu, X, MessageSquareText } from "lucide-react";
import { signIn } from "../lib/firebase";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

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
    <header aria-label="Main Navigation" className="fixed top-0 left-0 right-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border-dim/50 pwa-safe-top">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between relative">
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-secondary hover:text-accent"
            title={isSidebarOpen ? "Close Information" : "Open Information"}
          >
            {isAssistantOpen ? <X className="w-4 h-4 md:hidden" /> : (isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />)}
          </button>

          <button 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center rotate-3 shadow-lg shadow-accent/20">
              <Coffee className="w-5 h-5 text-bg" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-[13px] font-black text-accent tracking-tighter block leading-none">THE BRIDGE CAFÉ</span>
            </div>
          </button>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-secondary">
          {[
            {
              label: "Specials",
              id: "cat-weekly-soups-and-specials",
              items: []
            },
            {
              label: "Food",
              id: "group-food",
              items: [
                { label: "Specials", id: "cat-weekly-soups-and-specials" },
                { label: "Breakfast", id: "cat-breakfast" },
                { label: "Lunch", id: "cat-lunch" },
                { label: "Desserts", id: "cat-desserts" }
              ]
            },
            {
              label: "Drinks",
              id: "group-drinks",
              items: []
            },
            {
              label: "Catering",
              id: "group-catering",
              items: []
            }
          ].map((group) => (
            <div 
              key={group.label}
              className="relative group/nav"
              onMouseEnter={() => group.items.length > 0 && setShowDropdown(group.label as any)}
              onMouseLeave={() => setShowDropdown(null)}
            >
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(group.id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                  setShowDropdown(null);
                }}
                className={cn(
                  "flex items-center gap-2 hover:text-accent transition-colors py-4 relative",
                  showDropdown === group.label && "text-accent"
                )}
              >
                {group.label}
                {group.items.length > 0 && (
                  <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", showDropdown === group.label && "rotate-180")} />
                )}
                {(showDropdown === group.label || (group.id === 'cat-drinks' && false)) && (
                   <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
              
              {group.items.length > 0 && (
                <div 
                  className={cn(
                    "absolute top-full left-0 w-48 bg-card border border-border-dim p-2 rounded-xl shadow-2xl transition-all duration-300 origin-top z-50",
                    showDropdown === group.label ? "opacity-100 translate-y-0 scale-100 visible" : "opacity-0 -translate-y-2 scale-95 invisible"
                  )}
                >
                  <div className="space-y-1">
                    {group.items.map((cat) => (
                      <button
                        key={cat.label}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const el = document.getElementById(cat.id);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                          setShowDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary hover:text-accent hover:bg-white/10 rounded-lg transition-all"
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

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
            className="bg-accent text-bg px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.1em] hover:bg-orange-accent hover:text-white transition-all shadow-lg shadow-accent/20 active:scale-95 whitespace-nowrap min-w-[100px]"
          >
            {isAssistantOpen ? "MENU" : "ORDER"}
          </button>
        </div>
      </div>
    </header>
  );
}
