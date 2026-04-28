import { Home, Coffee, MessageSquareText, Menu as MenuIcon, User } from "lucide-react";
import { cn } from "../lib/utils";

interface MobileBottomNavProps {
  onToggleAssistant: () => void;
  onToggleSidebar: () => void;
  activeSection: string;
}

export function MobileBottomNav({ onToggleAssistant, onToggleSidebar, activeSection }: MobileBottomNavProps) {
  const scrollToTop = () => {
    const el = document.querySelector('main');
    el?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToMenu = () => {
    const el = document.getElementById('menu');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-48px)] max-w-sm pwa-safe-bottom">
      <div className="bg-bg/90 backdrop-blur-xl border border-border-dim/50 rounded-full h-16 flex items-center justify-around px-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <button 
          onClick={scrollToTop}
          className="flex flex-col items-center gap-1 text-secondary hover:text-accent transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
        </button>
        
        <button 
          onClick={scrollToMenu}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeSection === 'menu' ? "text-accent" : "text-secondary hover:text-accent"
          )}
        >
          <Coffee className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Menu</span>
        </button>

        <div className="relative -top-8 transition-transform active:scale-90">
          <button 
            onClick={onToggleAssistant}
            className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(255,107,0,0.3)] group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <MessageSquareText className="w-8 h-8 text-bg" />
          </button>
        </div>

        <button 
          onClick={() => {
             const el = document.getElementById('group-catering');
             el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-1 text-secondary hover:text-accent transition-colors"
        >
          <MenuIcon className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Catering</span>
        </button>

        <button 
          onClick={onToggleSidebar}
          className="flex flex-col items-center gap-1 text-secondary hover:text-accent transition-colors"
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Info</span>
        </button>
      </div>
    </div>
  );
}
