import { BUSINESS_INFO } from "../data/menu";
import { signIn, signOut } from "../lib/firebase";
import { Settings, LogIn, LogOut, User } from "lucide-react";

interface SidebarInfoProps {
  isAdmin: boolean;
  user: any;
  onOpenAdmin: () => void;
  onClose?: () => void;
}

export function SidebarInfo({ isAdmin, user, onOpenAdmin, onClose }: SidebarInfoProps) {
  const Label = ({ children }: { children: React.ReactNode }) => (
    <span className="block text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 font-bold">
      {children}
    </span>
  );

  return (
    <aside className="p-6 h-full flex flex-col justify-between overflow-y-auto custom-scrollbar overflow-x-hidden">
      <div className="space-y-6">
        <div className="location-section">
          <Label>Location</Label>
          <p className="text-[13px] leading-snug text-white/90">
            {BUSINESS_INFO.address}<br />
            Manchester, NH 03101
          </p>
        </div>
        
        <div className="contact-section">
          <Label>Contact</Label>
          <p className="text-[13px] leading-snug text-white/90">
            {BUSINESS_INFO.phone}<br />
            {BUSINESS_INFO.email}
          </p>
        </div>

        <div className="hours-section pb-4 border-b border-white/5">
          <Label>Hours</Label>
          <div className="space-y-1 text-[12px] text-white/90 font-medium">
            <div className="flex justify-between">
              <span className="opacity-60">Mon-Fri</span>
              <span>{BUSINESS_INFO.hours.mon_fri}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Sat-Sun</span>
              <span>{BUSINESS_INFO.hours.sat_sun}</span>
            </div>
          </div>
          <p className="text-xs text-accent italic font-display mt-3">Breakfast served all day!</p>
        </div>

        <div className="delivery-section bg-[#141414] p-4 rounded-xl border border-white/5 shadow-inner">
          <h4 className="text-[10px] uppercase font-black text-orange-accent mb-2 tracking-[0.2em]">Delivery Details</h4>
          <p className="text-[11px] text-secondary mb-3 leading-relaxed italic">We deliver all over Manchester & Bedford.</p>
          <div className="space-y-1 pt-2 border-t border-white/5">
            <p className="flex justify-between text-[10px] tracking-widest font-bold uppercase opacity-80">
              <span className="text-secondary">Minimum</span>
              <span className="text-white">$10.00</span>
            </p>
            <p className="flex justify-between text-[10px] tracking-widest font-bold uppercase opacity-80">
              <span className="text-secondary">Delivery Fee</span>
              <span className="text-white">${BUSINESS_INFO.delivery.charge.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="management-section">
          <Label>Management</Label>
          {!user ? (
            <button 
              onClick={() => signIn()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-secondary hover:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all group border border-white/5"
            >
              <LogIn className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              Staff Login
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[9px] text-secondary font-black uppercase tracking-widest px-1">
                <User className="w-3 h-3 text-accent" />
                <span className="truncate">{user.displayName || user.email}</span>
              </div>
              <div className="flex flex-col gap-2">
                {isAdmin && (
                  <button 
                    onClick={onOpenAdmin}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-bg hover:bg-orange-accent hover:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all shadow-lg"
                  >
                    <Settings className="w-3.5 h-3.5 animate-spin-slow" />
                    Admin Portal
                  </button>
                )}
                <button 
                  onClick={() => signOut()}
                  className="w-full h-8 flex items-center justify-center gap-2 text-secondary/50 hover:text-red-400 text-[9px] font-black uppercase tracking-widest transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-[8px] uppercase tracking-[0.4em] text-secondary font-black opacity-20 text-center mt-6">
          © 2026 THE BRIDGE
        </p>
      </div>
    </aside>
  );
}
