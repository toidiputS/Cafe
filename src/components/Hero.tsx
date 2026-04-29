import { BadgeCheck, CreditCard, Clock, Truck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { MenuItem } from "../data/menu";

const features = [
  {
    id: "breakfast",
    icon: Clock,
    label: "Breakfast All Day",
    info: "Waffles, Omelettes, and Breakfast Sandwiches are available from open to close. Mon-Fri: 6am-5pm, Sat-Sun: 6am-4pm."
  },
  {
    id: "cards",
    icon: CreditCard,
    label: "Cards Accepted",
    info: "We accept all major credit cards and mobile payments. Fast and secure checkout for your convenience."
  },
  {
    id: "house",
    icon: BadgeCheck,
    label: "Made In-House",
    info: "Award-winning muffins, roasted meats, and signature dressings prepared fresh daily in our kitchen."
  },
  {
    id: "delivery",
    icon: Truck,
    label: "Local Delivery",
    info: "Available 7am-5pm daily. Serving Manchester ($10 min) & Bedford. $2 delivery charge. 15% gratuity on $100+."
  }
];

export function Hero({ isFullHeight }: { isFullHeight?: boolean, specials?: MenuItem[] }) {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  return (
    <section className={cn(
      "px-6 md:px-16 pt-8 pb-12 transition-all duration-500 bg-bg",
      !isFullHeight && "h-auto"
    )}>
      <div className="flex flex-col gap-12 max-w-7xl mx-auto w-full">
        <div className="brand w-full flex flex-col items-center">
          <motion.div
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.8em] text-accent/80 mb-4 pt-[20px]"
          >
            CAFÉ & GRILL
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-display text-[32px] sm:text-[70px] md:text-[90px] font-black leading-[0.82] tracking-tighter text-accent mb-8 flex flex-col items-center text-center"
          >
            <span className="pt-[21px]">THE BRIDGE</span>
            <span className="pt-[21px]">CAFÉ.</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center w-full"
          >
            <p className="text-[13px] sm:text-[18px] md:text-[22px] font-semibold text-[#8EB08E]/90 leading-tight italic font-display text-center mb-6 max-w-2xl px-4 pt-[21px]">
              At The Bridge Café on Elm, we prepare everything in-house with only the freshest ingredients, herbs, and spices.
            </p>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative border-l-2 border-orange-accent/30 pl-6 max-w-lg mx-4"
            >
              <p className="text-[10px] md:text-[14px] text-secondary font-medium leading-relaxed tracking-tight text-left italic opacity-80 pt-[21px]">
                "Our items change periodically, so keep checking in with us! Craving something not on the menu? Call us – we make every item to order!"
              </p>
            </motion.div>

            {/* Features (Desktop & Mobile) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8 w-full mt-12 px-2 max-w-5xl border-t border-white/5 pt-[69px] relative">
              {features.map((feature) => (
                <div 
                  key={feature.id}
                  className="flex flex-col items-center gap-3 text-center relative group"
                  onMouseEnter={() => setHoveredFeature(feature.id)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <AnimatePresence>
                    {hoveredFeature === feature.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: -10, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 w-64 p-5 bg-card border border-accent/20 rounded-2xl shadow-2xl z-50 pointer-events-none"
                      >
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-card border-r border-b border-accent/20" />
                        <div className="flex flex-col gap-2 relative z-10">
                          <span className="text-[10px] font-black uppercase tracking-widest text-accent">{feature.label}</span>
                          <p className="text-[11px] text-secondary leading-relaxed font-medium">
                            {feature.info}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={cn(
                      "w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center transition-all duration-300",
                      hoveredFeature === feature.id ? "bg-accent/20 shadow-lg shadow-accent/10" : "group-hover:bg-accent/10"
                    )}
                  >
                    <feature.icon className={cn(
                      "w-5 h-5 transition-colors duration-300",
                      hoveredFeature === feature.id ? "text-accent" : "text-orange-accent"
                    )} />
                  </motion.div>
                  <span className={cn(
                    "uppercase text-[9px] font-black tracking-widest transition-colors duration-300",
                    hoveredFeature === feature.id ? "text-white" : "text-secondary"
                  )}>
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
