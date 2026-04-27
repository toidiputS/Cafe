import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ShoppingCart, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { MenuItem, CATEGORY_METADATA } from '../data/menu';

interface ItemCustomizerModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, quantity: number, options: string, customizations: string, specificPrice: number) => void;
}

export function ItemCustomizerModal({ item, onClose, onAdd }: ItemCustomizerModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState<number>(0);
  const [selectedBread, setSelectedBread] = useState<string>("");
  const [selectedSide, setSelectedSide] = useState<string>("");
  const [customNotes, setCustomNotes] = useState("");

  if (!item) return null;

  const currentPrice = Array.isArray(item.price) ? item.price[selectedSizeIdx] : item.price;
  const sizeLabels = ["Small", "Medium", "Large"];

  const catMeta = CATEGORY_METADATA[item.category];
  const isLunch = item.category === "Lunch";
  const isBreakfast = item.category === "Breakfast";
  const isBagelWithCC = item.id === "b-bag-cc";
  const isBagelToast = item.id === "b-bag-toast";
  const isBreakfastSandwich = item.subcategory === "Breakfast Sandwiches";
  const isEggStyle = item.subcategory === "Eggs Any Style";
  const isOmelette = item.subcategory === "Omelettes";
  const isBurrito = item.subcategory === "Breakfast Burritos";

  let breadOptions: string[] = [];
  let headerLabel = "Choose Options";

  if (isLunch) {
    breadOptions = ["White", "Wheat", "Rye", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"];
    headerLabel = "Choose Bread or Wrap";
  } else if (isBagelWithCC) {
    breadOptions = ["Plain CC", "Vegetable CC", "Pesto CC", "Honey Walnut CC", "Chive CC", "Strawberry CC", "Jalapeno CC"];
    headerLabel = "Choose Cream Cheese Flavor";
  } else if (isBagelToast) {
    breadOptions = ["Plain", "Sesame", "Everything", "Cinnamon Raisin", "Asiago", "Wheat", "Onion"];
    headerLabel = "Choose Bagel Type";
  } else if (isBreakfastSandwich) {
    breadOptions = ["White", "Wheat", "Rye", "Plain Bagel", "Sesame Bagel", "Everything Bagel", "English Muffin", "Croissant"];
    headerLabel = "Choose Bread/Bagel";
  } else if (isEggStyle) {
    breadOptions = ["Scrambled", "Fried", "Over Easy", "Over Medium", "Over Hard", "Poached", "Sunny Side Up"];
    headerLabel = "Choose Egg Style";
  } else if (isOmelette) {
    breadOptions = ["White Toast", "Wheat Toast", "Rye Toast"];
    headerLabel = "Choose Toast Type";
  } else if (isBurrito) {
    breadOptions = ["White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"];
    headerLabel = "Choose Wrap Type";
  }

  const sideOptions = isLunch ? ["Pasta salad", "Potato salad", "Cafe salad", "Fruit salad", "Chips"] : [];

  const handleAdd = () => {
    let optionsList = [];
    if (selectedBread) {
      if (isBagelWithCC) optionsList.push(`Flavor: ${selectedBread}`);
      else if (isEggStyle) optionsList.push(`Style: ${selectedBread}`);
      else optionsList.push(`Choice: ${selectedBread}`);
    }
    if (selectedSide) optionsList.push(`Side: ${selectedSide}`);
    
    onAdd(item, quantity, optionsList.join(", "), customNotes, currentPrice);
    onClose();
  };

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg/80 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-display italic text-white leading-none mb-2">{item.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-accent">
                  {Array.isArray(item.price) 
                    ? item.price.map(p => `$${p.toFixed(2)}`).join(", ")
                    : `$${item.price.toFixed(2)}`}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-secondary hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {item.description && (
                <div className="bg-white/5 p-4 rounded-2xl flex gap-3">
                  <Info size={16} className="text-secondary shrink-0 mt-0.5" />
                  <p className="text-xs text-secondary leading-relaxed italic">{item.description}</p>
                </div>
              )}

              {/* Size Selection */}
              {Array.isArray(item.price) && (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Select Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {item.price.map((price, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSizeIdx(idx)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-[11px] font-bold text-center transition-all border flex flex-col items-center justify-center gap-1",
                          selectedSizeIdx === idx 
                            ? "bg-accent border-accent text-bg" 
                            : "bg-white/5 border-white/10 text-secondary hover:border-white/20"
                        )}
                      >
                        <span className="opacity-70">{sizeLabels[idx]}</span>
                        <span>${price.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bread / Base Selection */}
              {breadOptions.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary">{headerLabel}</label>
                    <span className="text-[9px] font-bold text-accent px-2 py-0.5 bg-accent/10 rounded uppercase">Required</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {breadOptions.map((bread) => (
                      <button
                        key={bread}
                        onClick={() => setSelectedBread(bread)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-[11px] font-bold text-left transition-all border",
                          selectedBread === bread 
                            ? "bg-accent border-accent text-bg" 
                            : "bg-white/5 border-white/10 text-secondary hover:border-white/20"
                        )}
                      >
                        {bread}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                item.category === "Coffee" || item.category === "Espresso" ? (
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Milk / Flavor Preference</label>
                     <input 
                       type="text" 
                       placeholder="e.g. Oat milk, Extra shot, Vanilla syrup..."
                       className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                       value={selectedBread}
                       onChange={(e) => setSelectedBread(e.target.value)}
                     />
                  </div>
                ) : null
              )}

              {/* Side Selection */}
              {sideOptions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Choose a Side</label>
                    <span className="text-[9px] font-bold text-accent px-2 py-0.5 bg-accent/10 rounded uppercase">Required</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {sideOptions.map((side) => (
                      <button
                        key={side}
                        onClick={() => setSelectedSide(side)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-[11px] font-bold text-left transition-all border",
                          selectedSide === side 
                            ? "bg-accent border-accent text-bg" 
                            : "bg-white/5 border-white/10 text-secondary hover:border-white/20"
                        )}
                      >
                        {side}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Notes */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Special Instructions</label>
                <textarea
                  placeholder="Any allergies or special requests?"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:border-accent transition-colors resize-none h-24"
                />
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Quantity</label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >-</button>
                  <span className="font-mono font-bold text-white w-4 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >+</button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-white/2 backdrop-blur-sm flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-secondary hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAdd}
                disabled={(breadOptions.length > 0 && !selectedBread) || (sideOptions.length > 0 && !selectedSide)}
                className="flex-[2] bg-accent text-bg py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 hover:bg-orange-accent disabled:opacity-30 disabled:grayscale"
              >
                <ShoppingCart size={16} />
                Add to Order — ${(currentPrice * quantity).toFixed(2)}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
