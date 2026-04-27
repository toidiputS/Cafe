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
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="font-display font-black text-[14px] text-white uppercase tracking-widest mb-4">
      {children}
    </h3>
  );

  return (
    <aside className="p-8 h-full flex flex-col justify-between overflow-y-auto custom-scrollbar bg-bg text-secondary border-r border-border-dim">
      <div className="space-y-10">
        {/* Location & Contact Section */}
        <section>
          <SectionTitle>Location & Contact</SectionTitle>
          <div className="space-y-1 text-[13px] leading-relaxed">
            <p className="text-white font-medium">Downtown Manchester</p>
            <p>Next to Anthem</p>
            <p className="underline text-accent decoration-accent/30 hover:decoration-accent cursor-pointer transition-all">1117 Elm Street</p>
            <p className="underline text-accent decoration-accent/30 hover:decoration-accent cursor-pointer transition-all">Manchester, NH 03101</p>
            <p>Tel: <span className="underline text-accent decoration-accent/30 hover:decoration-accent cursor-pointer transition-all">603.647.9991</span></p>
            <p>email: {BUSINESS_INFO.email}</p>
          </div>
        </section>
        
        {/* Hours Section */}
        <section>
          <SectionTitle>Hours</SectionTitle>
          <div className="space-y-1 text-[13px] leading-relaxed">
            <p><span className="text-white font-medium">{BUSINESS_INFO.hours.mon_fri}</span> Mon-Fri</p>
            <p><span className="text-white font-medium">{BUSINESS_INFO.hours.sat_sun}</span> Sat & Sun</p>
            <p className="text-accent italic font-display">Breakfast served all day!</p>
            <p>Delivery <span className="text-white font-medium">{BUSINESS_INFO.hours.delivery}</span></p>
          </div>
        </section>

        {/* Delivery Section */}
        <section>
          <SectionTitle>Delivery</SectionTitle>
          <div className="space-y-1 text-[13px] leading-relaxed">
            <p>Did you know that we deliver all over Manchester AND Bedford?</p>
            <p className="text-white font-black bg-accent/10 px-2 py-0.5 rounded inline-block">($2.00 delivery charge)</p>
            <p className="italic font-medium text-orange-accent">There is a $10 minimum on deliveries to Manchester</p>
            <p>All Deliveries over $100 will have 15% gratuity included.</p>
          </div>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-white/5">
        <div className="management-section">
          <SectionTitle>Management</SectionTitle>
          {!user ? (
            <button 
              onClick={() => signIn()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-secondary hover:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all group border border-white/5"
            >
              <LogIn className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              Staff Login
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-secondary font-black uppercase tracking-widest px-1">
                <User className="w-3 h-3 text-accent" />
                <span className="truncate">{user.displayName || user.email}</span>
              </div>
              <div className="flex flex-col gap-2">
                {isAdmin && (
                  <button 
                    onClick={onOpenAdmin}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-bg hover:bg-orange-accent hover:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all shadow-lg"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Admin Portal
                  </button>
                )}
                <button 
                  onClick={() => signOut()}
                  className="w-full py-2 text-secondary/30 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-[8px] uppercase tracking-[0.4em] text-secondary font-black opacity-10 text-center mt-8">
          © 2026 THE BRIDGE CAFE
        </p>
      </div>
    </aside>
  );
}
