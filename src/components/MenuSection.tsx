import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { type MenuItem, CATEGORY_METADATA, SUBCATEGORY_METADATA, SUBCATEGORY_ORDER } from "../data/menu";
import { Star, MessageSquare, Plus } from "lucide-react";
import { ReviewModal } from "./ReviewModal";
import { ItemCustomizerModal } from "./ItemCustomizerModal";

import Markdown from "react-markdown";

interface MenuSectionProps {
  menu: MenuItem[];
  onOrder: (name: string, qty?: number, options?: string, customizations?: string, specificPrice?: number) => void;
  highlightedItemId: string | null;
  highlightedCategory: string | null;
}

export function MenuSection({ menu, onOrder, highlightedItemId, highlightedCategory }: MenuSectionProps) {
  // Use the order from CATEGORY_METADATA for rendering
  const categories = Object.keys(CATEGORY_METADATA);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const categoryRefs = useRef<{ [key: string]: HTMLHeadingElement | null }>({});

  const [reviewModalItem, setReviewModalItem] = useState<{ id: string, name: string } | null>(null);
  const [customizerItem, setCustomizerItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (highlightedItemId && itemRefs.current[highlightedItemId]) {
      itemRefs.current[highlightedItemId]?.scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    }
  }, [highlightedItemId]);

  useEffect(() => {
    if (highlightedCategory && categoryRefs.current[highlightedCategory]) {
      categoryRefs.current[highlightedCategory]?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    }
  }, [highlightedCategory]);

  return (
    <section id="menu" className="p-4 md:p-10 pt-0 overflow-hidden relative">
      <ReviewModal 
        isOpen={!!reviewModalItem} 
        onClose={() => setReviewModalItem(null)} 
        menuItemId={reviewModalItem?.id || ''} 
        menuItemName={reviewModalItem?.name || ''} 
      />

      <ItemCustomizerModal 
        item={customizerItem}
        onClose={() => setCustomizerItem(null)}
        onAdd={(item, qty, opts, cust) => onOrder(item.name, qty, opts, cust, Array.isArray(item.price) ? item.price[0] : item.price)}
      />

      <div className="mb-24 mt-12 max-w-5xl mx-auto px-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-8 opacity-50">Quick Navigation</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-12 gap-y-12">
          {categories.map((category) => {
            const catMenu = menu.filter(item => item.category === category);
            if (catMenu.length === 0) return null;
            const subcatNames = Array.from(new Set(catMenu.map(i => i.subcategory || ""))).filter(Boolean);
            
            return (
              <div key={category} className="space-y-4">
                <button
                  onClick={() => {
                    const el = document.getElementById(`cat-${category.toLowerCase().replace(/\s+/g, '-')}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="font-display italic text-2xl text-primary hover:text-accent transition-colors font-black uppercase tracking-tighter text-left group"
                >
                  {CATEGORY_METADATA[category]?.navLabel || category}
                  <div className="h-0.5 w-0 group-hover:w-full bg-accent transition-all duration-300" />
                </button>
                <div className="flex flex-col gap-2">
                  {subcatNames.map(sub => (
                    <button
                      key={sub}
                      onClick={() => {
                        const el = document.getElementById(`subcat-${category.toLowerCase().replace(/\s+/g, '-')}-${sub.toLowerCase().replace(/\s+/g, '-')}`);
                        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-[11px] font-bold uppercase tracking-widest text-secondary hover:text-white transition-colors text-left"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-32">
        {categories.map((category, index) => {
          const catMenu = menu.filter(item => item.category === category);
          const meta = CATEGORY_METADATA[category];
          if (catMenu.length === 0) return null;

          const lastMeta = index > 0 ? CATEGORY_METADATA[categories[index - 1]] : null;
          const showGroupLabel = meta?.groupLabel && meta.groupLabel !== lastMeta?.groupLabel;

          // Use the strict order defined in metadata
          const definedSubcatOrder = SUBCATEGORY_ORDER[category] || [];
          const actualSubcatNames = Array.from(new Set(catMenu.map(i => i.subcategory || "")));
          const subcatNames = definedSubcatOrder.length > 0 
            ? definedSubcatOrder.filter(s => actualSubcatNames.includes(s))
            : actualSubcatNames;

          return (
            <React.Fragment key={category}>
              {showGroupLabel && (
                <div id={`group-${meta.groupLabel.toLowerCase()}`} className="relative border-y border-white/5 bg-white/[0.01] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-orange-accent/5 to-transparent pointer-events-none" />
                  <div className="max-w-7xl mx-auto py-16 px-6 relative z-10">
                    <h2 className="font-display text-center text-[100px] leading-[0.8] text-orange-accent italic font-black uppercase tracking-tighter opacity-10 absolute left-1/2 -translate-x-1/2 top-4 select-none whitespace-nowrap">
                      {meta.groupLabel}
                    </h2>
                    <div className="text-center">
                      <h2 className="font-display text-6xl text-primary italic font-black uppercase tracking-tighter mb-12 relative inline-block">
                        {meta.groupLabel}
                        <div className="absolute -bottom-4 left-0 w-full h-1 bg-orange-accent shadow-[0_0_15px_rgba(255,107,0,0.5)]" />
                      </h2>
                      
                      {/* Sub-navigation for the group */}
                      <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 pt-4">
                        {Object.keys(CATEGORY_METADATA)
                          .filter(c => CATEGORY_METADATA[c].groupLabel === meta.groupLabel)
                          .map(c => (
                            <button
                              key={c}
                              onClick={() => {
                                const el = document.getElementById(`cat-${c.toLowerCase().replace(/\s+/g, '-')}`);
                                el?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                              }}
                              className="group relative px-2 py-1"
                            >
                              <span className="text-[14px] font-black uppercase tracking-[0.3em] text-secondary group-hover:text-accent transition-colors">
                                {CATEGORY_METADATA[c].navLabel || c}
                              </span>
                              <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full" />
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div id={`cat-${category.toLowerCase().replace(/\s+/g, '-')}`} className={cn("menu-category scroll-mt-24 relative max-w-5xl mx-auto", !meta?.hideHeader && "pt-16")}>
                {!meta?.hideHeader && (
                  <div className="mb-12 text-left flex flex-col items-start px-2">
                    <h3 className="font-display italic text-5xl text-primary relative z-10 mb-6 font-black tracking-tight pt-[36px]">
                      {category}
                    </h3>
                    {meta?.subHeader && (
                      <h4 className="text-secondary font-display italic text-3xl mb-8 font-black">
                        {meta.subHeader}
                      </h4>
                    )}
                    {meta?.description && (
                      <div className="text-secondary text-base italic space-y-4 max-w-4xl mb-10 leading-relaxed whitespace-pre-line opacity-90 border-l-2 border-orange-accent/30 pl-6">
                        {meta.description}
                      </div>
                    )}
                  </div>
                )}

              <AnimatePresence>
                {highlightedCategory === category && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="absolute inset-x-[-20px] inset-y-[-20px] bg-orange-accent/5 border border-orange-accent/20 rounded-[3rem] pointer-events-none z-0"
                  />
                )}
              </AnimatePresence>

              {meta?.bannerBlocks && (
                <div className="mb-12 space-y-8 px-2 border-l-4 border-accent/20 pl-6">
                  {meta.bannerBlocks.map((block, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                      {block.split(':').length > 1 ? (
                        <>
                          <span className="text-[18px] font-black uppercase text-primary leading-tight tracking-tight">{block.split(':')[0]}</span>
                          <div className="flex flex-wrap gap-x-3 gap-y-2">
                            {block.split(':')[1].split('•').map((item, i) => (
                              <span key={i} className="text-[15px] font-bold italic text-secondary flex items-center gap-3">
                                {item.trim()}
                                {i < block.split(':')[1].split('•').length - 1 && <span className="opacity-30 text-[12px]">●</span>}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <span className="text-[16px] font-bold text-primary italic leading-snug">{block}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-24">
                {subcatNames.map((subcatName) => {
                  const subcatItems = catMenu.filter(item => (item.subcategory || "") === subcatName);
                  const subcatMeta = SUBCATEGORY_METADATA[subcatName];

                  return (
                    <div key={subcatName} className="space-y-12 px-2">
                      {subcatName && (
                        <div className="space-y-6">
                          <h4 
                            id={`subcat-${category.toLowerCase().replace(/\s+/g, '-')}-${subcatName.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-orange-accent font-display italic text-3xl font-black border-b border-white/5 pb-4 uppercase tracking-tighter"
                          >
                            {subcatName}
                          </h4>
                          {subcatMeta?.subHeader && (
                            <p className="text-accent text-[16px] font-black uppercase tracking-widest italic">
                              {subcatMeta.subHeader}
                            </p>
                          )}
                          {subcatMeta?.description && (
                            <div className="text-secondary text-sm italic space-y-2 max-w-3xl leading-relaxed whitespace-pre-line border-l-2 border-white/10 pl-4 markdown-body">
                              <Markdown>{subcatMeta.description}</Markdown>
                            </div>
                          )}
                          {subcatMeta?.bannerBlocks && (
                            <div className="space-y-4 py-2">
                              {subcatMeta.bannerBlocks.map((block, idx) => (
                                <div key={idx} className="flex flex-col gap-1">
                                  {block.split(':').length > 1 ? (
                                    <>
                                      <span className="text-[16px] font-black uppercase text-primary leading-tight">{block.split(':')[0]}</span>
                                      <div className="flex flex-wrap gap-x-2 gap-y-1">
                                        {block.split(':')[1].split('•').map((item, i) => (
                                          <span key={i} className="text-[13px] font-bold italic text-secondary flex items-center gap-2">
                                            {item.trim()}
                                            {i < block.split(':')[1].split('•').length - 1 && <span className="opacity-30 text-[10px]">●</span>}
                                          </span>
                                        ))}
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-[14px] font-bold text-primary italic">{block}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 gap-y-16">
                        {subcatItems.map((item) => {
                          const isHighlighted = highlightedItemId === item.id;
                          
                          return (
                            <div 
                              key={item.id} 
                              ref={(el) => { itemRefs.current[item.id] = el; }}
                              onClick={() => setCustomizerItem(item)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setCustomizerItem(item);
                                }
                              }}
                              className={cn(
                                "w-full text-left flex flex-col group cursor-pointer transition-all relative z-10 px-0 py-0 outline-none",
                                isHighlighted && "scale-[1.01]"
                              )}
                            >
                              <div className="space-y-3 relative">
                                <AnimatePresence>
                                  {isHighlighted && (
                                    <motion.div
                                      initial={{ x: "-100%" }}
                                      animate={{ x: "0%" }}
                                      exit={{ x: "100%" }}
                                      transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                                      className="absolute inset-0 bg-gradient-to-r from-orange-accent/0 via-orange-accent/10 to-orange-accent/0 rounded-lg pointer-events-none"
                                    />
                                  )}
                                </AnimatePresence>
                                <div className="flex justify-between items-baseline group-hover:text-orange-accent transition-colors gap-8">
                                  <span className="font-black text-2xl tracking-tight leading-tight uppercase font-sans">
                                    {item.name}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReviewModalItem({ id: item.id, name: item.name });
                                      }}
                                      role="button"
                                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all text-secondary hover:text-accent cursor-pointer"
                                      title="View Reviews"
                                    >
                                      <MessageSquare size={16} />
                                    </div>
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCustomizerItem(item);
                                      }}
                                      role="button"
                                      className="p-2 bg-accent/10 hover:bg-accent text-accent hover:text-bg rounded-lg transition-all flex items-center justify-center cursor-pointer"
                                      title="Customize & Add"
                                    >
                                      <Plus size={18} strokeWidth={3} />
                                    </div>
                                  </div>
                                </div>
                                {item.category !== "Catering" && (
                                  <div className="text-orange-accent font-black text-lg tracking-widest font-sans flex items-center gap-3">
                                    <span>
                                      {Array.isArray(item.price) 
                                        ? item.price.map(p => `$${p.toFixed(2)}`).join(", ")
                                        : item.price === 0 
                                          ? "Call for Pricing" 
                                          : `$${item.price.toFixed(2)}`}
                                    </span>
                                    {item.isSpecial && (
                                      <span className="bg-orange-accent/10 text-orange-accent text-[12px] font-black uppercase px-3 py-1 rounded shadow-sm border border-orange-accent/20">
                                        Weekly Special
                                      </span>
                                    )}
                                  </div>
                                )}
                                {item.description && (
                                  <div className="text-base text-secondary/90 leading-relaxed font-sans max-w-4xl group-hover:text-secondary transition-colors whitespace-pre-line markdown-body">
                                    <Markdown>{item.description}</Markdown>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  </section>
);
}
