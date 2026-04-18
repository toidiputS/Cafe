import { BadgeCheck, CreditCard, Clock, Truck, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { MenuItem } from "../data/menu";

export function Hero({ isFullHeight, specials = [] }: { isFullHeight?: boolean, specials?: MenuItem[] }) {
  return (
    <section className={cn(
      "p-10 transition-all duration-500 flex flex-col justify-center min-h-[500px]",
      isFullHeight ? "h-[calc(100vh-64px)] pb-10" : "pb-16"
    )}>
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="brand flex-1 max-w-2xl">
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-[14px] uppercase tracking-[0.6em] text-accent/60 font-black mb-4"
          >
            CAFE & GRILL
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-7xl md:text-[110px] xl:text-[130px] font-black leading-[0.8] tracking-tighter text-accent mb-12"
          >
            THE<br />
            BRIDGE.
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-xl md:text-2xl font-medium text-emerald-100/80 leading-tight italic font-display pr-12">
              At The Bridge Café on Elm, we prepare everything in-house with only the freshest ingredients, herbs, and spices.
            </p>
            
            <div className="flex flex-col gap-4 text-secondary text-sm font-medium tracking-wide">
              <p className="border-l-2 border-orange-accent/30 pl-4 py-1">
                Our items change periodically, so keep checking in with us! Craving something not on the menu? Call us – we make every item to order!
              </p>
              
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-accent" />
                  <span className="uppercase text-[10px] font-black tracking-widest">Breakfast All Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-orange-accent" />
                  <span className="uppercase text-[10px] font-black tracking-widest">Major Cards Accepted</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-orange-accent" />
                  <span className="uppercase text-[10px] font-black tracking-widest">Made In-House</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-orange-accent" />
                  <span className="uppercase text-[10px] font-black tracking-widest whitespace-nowrap">We deliver - Manchester and surrounding areas</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Specials Display (The "Red Box" Area) */}
        {specials.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full lg:w-[450px] bg-card/40 border border-white/5 p-8 rounded-3xl backdrop-blur-xl group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-32 h-32 border-4 border-dashed border-white rounded-full" />
              </motion.div>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent">FRESH TODAY</h3>
                <p className="text-[10px] font-bold text-secondary tracking-widest">Weekly Chef Specials</p>
              </div>
            </div>

            <div className="space-y-6">
              {specials.slice(0, 3).map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="relative pl-6 border-l border-white/10 group cursor-default"
                >
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h4 className="text-sm font-black uppercase tracking-wider text-white group-hover:text-accent transition-colors leading-tight">
                      {item.name}
                    </h4>
                    <span className="font-mono text-xs text-accent">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-secondary font-medium leading-relaxed italic opacity-80">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center group/btn cursor-pointer" onClick={() => {
              const el = document.getElementById('menu');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary group-hover/btn:text-white transition-colors">SCROLL FOR MENU</span>
              <ChevronRight className="w-4 h-4 text-accent transform group-hover/btn:rotate-90 transition-transform" />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
