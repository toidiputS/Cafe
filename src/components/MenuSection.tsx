import React, { useRef, useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { type MenuItem, CATEGORY_METADATA, SUBCATEGORY_METADATA, SUBCATEGORY_ORDER } from "../data/menu";
import { ReviewModal } from "./ReviewModal";
import { ItemCustomizerModal } from "./ItemCustomizerModal";

import Markdown from "react-markdown";

interface MenuSectionProps {
  menu: MenuItem[];
  cart: any[];
  onOrder: (name: string, qty?: number, options?: string, customizations?: string, specificPrice?: number) => void;
  highlightedItemId: string | null;
  highlightedCategory: string | null;
}

export function MenuSection({ menu, cart, onOrder, highlightedItemId, highlightedCategory }: MenuSectionProps) {
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
    <section id="menu" className="menu-classic">
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

      <div className="menu-classic-inner">
        {categories.map((category, index) => {
          const catMenu = menu.filter(item => item.category === category);
          const meta = CATEGORY_METADATA[category];
          if (catMenu.length === 0) return null;

          const lastMeta = index > 0 ? CATEGORY_METADATA[categories[index - 1]] : null;
          const showGroupLabel = meta?.groupLabel && meta.groupLabel !== lastMeta?.groupLabel;

          const definedSubcatOrder = SUBCATEGORY_ORDER[category] || [];
          const actualSubcatNames = Array.from(new Set(catMenu.map(i => i.subcategory || "")));
          const subcatNames = definedSubcatOrder.length > 0 
            ? definedSubcatOrder.filter(s => actualSubcatNames.includes(s))
            : actualSubcatNames;

          return (
            <React.Fragment key={category}>
              {/* ─── Group Header (Food, Drinks, Catering) ─── */}
              {showGroupLabel && (
                <div id={`group-${meta.groupLabel!.toLowerCase()}`} className="menu-group-header">
                  <hr className="menu-divider" />
                  <h2 className="menu-group-title">{meta.groupLabel}</h2>

                  {/* Sub-navigation links for the group */}
                  {meta.groupLabel === "Food" && (
                    <div className="menu-group-nav">
                      {Object.keys(CATEGORY_METADATA)
                        .filter(c => CATEGORY_METADATA[c].groupLabel === meta.groupLabel)
                        .map((c, i, arr) => (
                          <React.Fragment key={c}>
                            <a
                              href={`#cat-${c.toLowerCase().replace(/\s+/g, '-')}`}
                              onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(`cat-${c.toLowerCase().replace(/\s+/g, '-')}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }}
                              className="menu-group-nav-link"
                            >
                              {CATEGORY_METADATA[c].navLabel || c}
                            </a>
                            {i < arr.length - 1 && <span className="menu-group-nav-sep" />}
                          </React.Fragment>
                        ))}
                    </div>
                  )}

                  {/* Food group description */}
                  {meta.groupLabel === "Food" && (
                    <p className="menu-group-desc">
                      Our items change periodically, so keep checking in with us! Craving something not on the menu? <strong>Flag down your server</strong> — we make every item to order and your waitress will take care of you right away. Breakfast is served all day!
                    </p>
                  )}
                </div>
              )}

              {/* ─── Category ─── */}
              <div id={`cat-${category.toLowerCase().replace(/\s+/g, '-')}`} className="menu-category-block scroll-mt-20">
                {!meta?.hideHeader && (
                  <div className="menu-category-header">
                    <h3 
                      ref={(el) => { categoryRefs.current[category] = el; }}
                      className="menu-category-title"
                    >
                      {category}
                      {meta?.showAllDay && <span className="menu-allday-badge">All Day</span>}
                    </h3>
                    {meta?.description && (
                      <p className="menu-category-desc">{meta.description}</p>
                    )}
                  </div>
                )}

                {meta?.bannerBlocks && (
                  <div className="menu-banner-blocks">
                    {meta.bannerBlocks.map((block, idx) => (
                      <p key={idx} className="menu-banner-text">{block}</p>
                    ))}
                  </div>
                )}

                {/* ─── Subcategories ─── */}
                {subcatNames.map((subcatName) => {
                  const subcatItems = catMenu.filter(item => (item.subcategory || "") === subcatName);
                  const subcatMeta = SUBCATEGORY_METADATA[subcatName];

                  return (
                    <div key={subcatName} className="menu-subcategory-block">
                      {subcatName && (
                        <div className="menu-subcategory-header">
                          <h4
                            id={`subcat-${category.toLowerCase().replace(/\s+/g, '-')}-${subcatName.toLowerCase().replace(/\s+/g, '-')}`}
                            className="menu-subcategory-title"
                          >
                            {subcatName}
                            {subcatMeta?.subHeader && (
                              <span className="menu-subcategory-subtitle"> – {subcatMeta.subHeader}</span>
                            )}
                          </h4>
                          {subcatMeta?.description && (
                            <div className="menu-subcategory-desc">
                              <Markdown>{subcatMeta.description}</Markdown>
                            </div>
                          )}
                          {subcatMeta?.bannerBlocks && (
                            <div className="menu-banner-blocks">
                              {subcatMeta.bannerBlocks.map((block, idx) => (
                                <p key={idx} className="menu-banner-text">{block}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* ─── Menu Items ─── */}
                      <div className="menu-items-list">
                        {subcatItems.map((item) => {
                          const isHighlighted = highlightedItemId === item.id;
                          const isInCart = cart.some(ci => ci.id === item.id);
                          
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
                                "menu-item",
                                isHighlighted && "menu-item-highlighted",
                                isInCart && "menu-item-selected"
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <h5 className="menu-item-name">{item.name}</h5>
                                {isInCart && <span className="menu-item-selected-tag">Selected</span>}
                              </div>
                              {item.category !== "Catering" && (
                                <p className="menu-item-price">
                                  {Array.isArray(item.price) 
                                    ? item.price.map(p => `$${p.toFixed(2)}`).join(", ")
                                    : item.price === 0 
                                      ? "Call for Pricing" 
                                      : `$${item.price.toFixed(2)}`}
                                  {item.isSpecial && (
                                    <span className="menu-item-special-badge">Weekly Special</span>
                                  )}
                                </p>
                              )}
                              {item.description && (
                                <div className="menu-item-desc">
                                  <Markdown>{item.description}</Markdown>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
