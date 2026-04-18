import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { type MenuItem, CATEGORY_METADATA } from "../data/menu";
import { Star } from "lucide-react";

interface MenuSectionProps {
  menu: MenuItem[];
  onOrder: (itemName: string) => void;
  highlightedItemId: string | null;
  highlightedCategory: string | null;
}

export function MenuSection({ menu, onOrder, highlightedItemId, highlightedCategory }: MenuSectionProps) {
  const categories = Array.from(new Set(menu.map(item => item.category)));
  const itemRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const categoryRefs = useRef<{ [key: string]: HTMLHeadingElement | null }>({});

  useEffect(() => {
    if (highlightedItemId && itemRefs.current[highlightedItemId]) {
      itemRefs.current[highlightedItemId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightedItemId]);

  useEffect(() => {
    if (highlightedCategory && categoryRefs.current[highlightedCategory]) {
      categoryRefs.current[highlightedCategory]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [highlightedCategory]);

  return (
    <section id="menu" className="p-10 pt-0">
      <div className="space-y-12">
        {categories.map((category) => (
          <div key={category} id={`category-${category.toLowerCase()}`} className="menu-category scroll-mt-24 relative">
            <AnimatePresence>
              {highlightedCategory === category && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="absolute inset-x-[-15px] inset-y-[-8px] bg-orange-accent/10 border border-orange-accent/30 rounded-xl pointer-events-none z-0 shadow-[0_0_20px_rgba(255,107,53,0.1)]"
                />
              )}
            </AnimatePresence>
            
            <h3 
              ref={(el) => { categoryRefs.current[category] = el; }}
              className={cn(
                "font-display italic text-2xl border-b pb-3 mb-2 transition-colors duration-500 relative z-10",
                highlightedCategory === category 
                  ? "text-orange-accent border-orange-accent" 
                  : "text-primary border-border-dim"
              )}
            >
              {category}
            </h3>

            {CATEGORY_METADATA[category]?.subHeader && (
              <h4 className="text-accent font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                {CATEGORY_METADATA[category].subHeader}
              </h4>
            )}

            {CATEGORY_METADATA[category]?.description && (
              <p className="text-secondary text-sm italic mb-6 opacity-80 max-w-2xl leading-relaxed">
                {CATEGORY_METADATA[category].description}
              </p>
            )}

            {!CATEGORY_METADATA[category] && menu.find(m => m.category === category && m.subcategory)?.subcategory && (
              <p className="text-secondary text-sm italic mb-6 opacity-80 max-w-2xl leading-relaxed">
                {menu.find(m => m.category === category && m.subcategory)?.subcategory}
              </p>
            )}

            <div className="space-y-12">
              {Array.from(new Set(menu.filter(item => item.category === category).map(i => i.subcategory || ""))).map((subcatName) => {
                const subcatItems = menu.filter(item => item.category === category && (item.subcategory || "") === subcatName);
                if (subcatItems.length === 0) return null;

                return (
                  <div key={subcatName} className="space-y-6">
                    {subcatName && (
                      <h4 className="text-accent text-[12px] uppercase tracking-[0.3em] font-black flex items-center gap-4">
                        <span className="shrink-0">{subcatName}</span>
                        <div className="h-px bg-accent/20 flex-1" />
                      </h4>
                    )}
                    <div className="space-y-4">
                      {subcatItems.map((item) => {
                        const isHighlighted = highlightedItemId === item.id;
                        
                        return (
                          <button 
                            key={item.id} 
                            ref={(el) => { itemRefs.current[item.id] = el; }}
                            onClick={() => onOrder(item.name)}
                            className={cn(
                              "w-full text-left flex flex-col group cursor-pointer transition-all border-l-2 p-2 rounded-r-lg relative overflow-hidden",
                              isHighlighted 
                                ? "border-orange-accent bg-orange-accent/5 ring-1 ring-orange-accent/20" 
                                : "border-transparent hover:border-orange-accent/50 hover:bg-white/5",
                              item.isSpecial && !isHighlighted && "bg-orange-accent/[0.02] border-orange-accent/10"
                            )}
                          >
                            <AnimatePresence>
                              {isHighlighted && (
                                <motion.div
                                  initial={{ x: "-100%" }}
                                  animate={{ x: "0%" }}
                                  exit={{ x: "100%" }}
                                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                                  className="absolute inset-0 bg-gradient-to-r from-orange-accent/0 via-orange-accent/10 to-orange-accent/0 pointer-events-none"
                                />
                              )}
                            </AnimatePresence>

                            <div className="flex justify-between items-baseline gap-4 relative z-10">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "text-sm font-medium transition-colors",
                                    isHighlighted ? "text-orange-accent" : "text-white group-hover:text-accent"
                                  )}>
                                    {item.name}
                                  </span>
                                  {item.isSpecial && (
                                    <div className="flex items-center gap-1 bg-orange-accent text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shadow-lg shadow-orange-accent/20">
                                      <Star className="w-2 h-2 fill-white" />
                                      Chef's Special
                                    </div>
                                  )}
                                </div>
                                {item.description && (
                                  <span className="text-[11px] text-secondary leading-tight mt-0.5">
                                    {item.description}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 border-b border-dotted border-secondary/20 h-0 my-auto hidden md:block" />
                              <span className="font-mono text-sm text-accent font-bold">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="mt-1.5 flex gap-2 relative z-10">
                              {(item.options || item.subcategory === "Signature Paninis and Sandwiches") && (
                                <span className="text-[9px] uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded text-white/40 font-bold">Customizable</span>
                              )}
                              {item.category === 'Breakfast' && <span className="text-[9px] uppercase tracking-wider bg-orange-accent/10 px-1.5 py-0.5 rounded text-orange-accent/60 font-bold">All Day</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
