import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ShoppingCart, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { MenuItem, CATEGORY_METADATA } from '../data/menu';
import Markdown from 'react-markdown';

interface ItemCustomizerModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, quantity: number, options: string, customizations: string, specificPrice: number) => void;
}

export function ItemCustomizerModal({ item, onClose, onAdd }: ItemCustomizerModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState<number>(0);
  const [selectedBread, setSelectedBread] = useState<string>("");
  const [selectedBagelType, setSelectedBagelType] = useState<string>("");
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [selectedSide, setSelectedSide] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedToast, setSelectedToast] = useState<string>("");
  const [selectedMeat, setSelectedMeat] = useState<string>("");
  const [selectedEggStyle, setSelectedEggStyle] = useState<string>("");
  const [selectedSweet, setSelectedSweet] = useState<string>("");
  const [customNotes, setCustomNotes] = useState("");

  if (!item) return null;

  const currentPrice = Array.isArray(item.price) ? item.price[selectedSizeIdx] : item.price;
  const sizeLabels = (item.options && Array.isArray(item.price) && item.options.length === item.price.length) 
    ? item.options 
    : ["Small", "Medium", "Large"];

  const catMeta = CATEGORY_METADATA[item.category];
  const isLunch = item.category === "Lunch";
  const isBreakfast = item.category === "Breakfast";
  const isBagelSubcat = item.subcategory === "Bagels and Spreads";
  const isBagelWithCC = item.id === "b-bag-cc";
  const isBagelPBJ = item.id === "b-bag-pbj" || item.id === "b-bag-jelly";
  const isBreakfastSandwich = item.subcategory === "Breakfast Sandwiches";
  const isEggStyle = item.subcategory === "Eggs Any Style";
  const isOmelette = item.subcategory === "Omelettes";
  const isBurrito = item.subcategory === "Breakfast Burritos";
  const isSalad = item.subcategory === "Freshly Tossed Salads";

  const bagelOptions = ["Plain", "Sesame", "Everything", "Cinnamon Raisin", "Asiago", "Wheat", "Onion"];
  const ccFlavorOptions = ["Plain", "Vegetable", "Pesto", "Honey Walnut", "Chive", "Strawberry", "Jalapeno"];
  const jellyOptions = ["Grape", "Strawberry"];

  const toastOptions = ["White Toast", "Wheat Toast", "Rye Toast"];
  const eggStyleOptions = ["Scrambled", "Fried", "Over Easy", "Over Medium", "Over Hard", "Poached", "Sunny Side Up"];
  const breakfastMeatOptions = ["Ham", "Bacon", "Sausage"];

  let breadOptions: string[] = [];
  let headerLabel = "Choose Options";

  if (isLunch && !isSalad) {
    breadOptions = ["White", "Wheat", "Rye", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"];
    headerLabel = "Choose Bread or Wrap";
  } else if (isBreakfastSandwich) {
    breadOptions = ["White", "Wheat", "Rye", "Plain Bagel", "Sesame Bagel", "Everything Bagel", "English Muffin", "Croissant"];
    headerLabel = "Choose Bread/Bagel";
  } else if (isBurrito) {
    breadOptions = ["White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"];
    headerLabel = "Choose Wrap Type";
  }

  const sideOptions = (isLunch && !isSalad) 
    ? ["Pasta salad", "Potato salad", "Cafe salad", "Fruit salad", "Chips"] 
    : (isBreakfast && (item.id === "b-bag-salmon-plate" || isEggStyle || isOmelette || item.id === "b-egg-hungry"))
      ? ["Home Fries", "Fruit Cup"]
      : [];

  const handleAdd = () => {
    let optionsList = [];
    if (selectedBagelType) optionsList.push(`Bagel: ${selectedBagelType}`);
    if (selectedFlavor) optionsList.push(`Flavor: ${selectedFlavor}`);
    if (selectedOption) optionsList.push(`Choice: ${selectedOption}`);
    if (selectedEggStyle) optionsList.push(`Egg Style: ${selectedEggStyle}`);
    if (selectedMeat) optionsList.push(`Meat: ${selectedMeat}`);
    if (selectedToast) optionsList.push(`Toast: ${selectedToast}`);
    if (selectedSweet) optionsList.push(`Sweet Side: ${selectedSweet}`);
    if (selectedBread) {
      optionsList.push(`Choice: ${selectedBread}`);
    }
    if (selectedSide) optionsList.push(`Side: ${selectedSide}`);
    
    onAdd(item, quantity, optionsList.join(", "), customNotes, currentPrice);
    onClose();
  };

  const hasGeneralOptions = item.options && (!Array.isArray(item.price) || item.options.length !== item.price.length);

  const isAddDisabled = 
    (breadOptions.length > 0 && !selectedBread) || 
    (sideOptions.length > 0 && !selectedSide) ||
    (isBagelSubcat && !selectedBagelType) ||
    (isBagelWithCC && !selectedFlavor) ||
    (isBagelPBJ && !selectedFlavor) ||
    (hasGeneralOptions && !selectedOption) ||
    (isEggStyle && !selectedEggStyle) ||
    ((isEggStyle || isOmelette) && !selectedToast) ||
    ((item.id === "b-egg-hungry" || item.id === "b-egg-2-meat") && !selectedMeat) ||
    (item.id === "b-egg-hungry" && !selectedSweet);

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
                {item.category !== "Catering" && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent">
                    {Array.isArray(item.price) 
                      ? item.price.map(p => `$${p.toFixed(2)}`).join(", ")
                      : item.price === 0 ? "Call for Pricing" : `$${item.price.toFixed(2)}`}
                  </p>
                )}
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
                  <div className="text-xs text-secondary leading-relaxed italic markdown-body">
                    <Markdown>{item.description}</Markdown>
                  </div>
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

              {/* General Options (e.g. Toppings, Choices) */}
              {hasGeneralOptions && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Choose an Option</label>
                    <span className="text-[9px] font-bold text-accent px-2 py-0.5 bg-accent/10 rounded uppercase">Required</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {item.options?.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedOption(opt)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-[11px] font-bold text-left transition-all border",
                          selectedOption === opt 
                            ? "bg-accent border-accent text-bg" 
                            : "bg-white/5 border-white/10 text-secondary hover:border-white/20"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bagel Type Selection */}
              {isBagelSubcat && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Choose Bagel Type</label>
                    <span className="text-[9px] font-bold text-accent px-2 py-0.5 bg-accent/10 rounded uppercase">Required</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {bagelOptions.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedBagelType(type)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-[11px] font-bold text-left transition-all border",
                          selectedBagelType === type 
                            ? "bg-accent border-accent text-bg" 
                            : "bg-white/5 border-white/10 text-secondary hover:border-white/20"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Egg Style Selection */}
              {isEggStyle && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Choose Egg Style</label>
                    <span className="text-[9px] font-bold text-accent px-2 py-0.5 bg-accent/10 rounded uppercase">Required</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {eggStyleOptions.map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedEggStyle(style)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-[11px] font-bold text-left transition-all border",
                          selectedEggStyle === style 
                            ? "bg-accent border-accent text-bg" 
                            : "bg-white/5 border-white/10 text-secondary hover:border-white/20"
                        )}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Meat Choice Selection */}
              {(item.id === "b-egg-hungry" || item.id === "b-egg-2-meat") && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Choose Meat</label>
                    <span className="text-[9px] font-bold text-accent px-2 py-0.5 bg-accent/10 rounded uppercase">Required</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {breakfastMeatOptions.map((meat) => (
                      <button
                        key={meat}
                        onClick={() => setSelectedMeat(meat)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-[11px] font-bold text-left transition-all border",
                          selectedMeat === meat 
                            ? "bg-accent border-accent text-bg" 
                            : "bg-white/5 border-white/10 text-secondary hover:border-white/20"
                        )}
                      >
                        {meat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pancakes or French Toast Selection for Hungry Man */}
              {item.id === "b-egg-hungry" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Choose Pancakes or French Toast</label>
                    <span className="text-[9px] font-bold text-accent px-2 py-0.5 bg-accent/10 rounded uppercase">Required</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {["Pancakes", "French Toast"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedSweet(opt)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-[11px] font-bold text-left transition-all border",
                          selectedSweet === opt 
                            ? "bg-accent border-accent text-bg" 
                            : "bg-white/5 border-white/10 text-secondary hover:border-white/20"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Toast Selection */}
              {(isEggStyle || isOmelette) && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary">Choose Toast</label>
                    <span className="text-[9px] font-bold text-accent px-2 py-0.5 bg-accent/10 rounded uppercase">Required</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {toastOptions.map((toast) => (
                      <button
                        key={toast}
                        onClick={() => setSelectedToast(toast)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-[11px] font-bold text-left transition-all border",
                          selectedToast === toast 
                            ? "bg-accent border-accent text-bg" 
                            : "bg-white/5 border-white/10 text-secondary hover:border-white/20"
                        )}
                      >
                        {toast}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Flavor Selection (CC or Jelly) */}
              {(isBagelWithCC || isBagelPBJ) && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary">
                      {isBagelWithCC ? "Choose Cream Cheese Flavor" : "Choose Jelly Flavor"}
                    </label>
                    <span className="text-[9px] font-bold text-accent px-2 py-0.5 bg-accent/10 rounded uppercase">Required</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(isBagelWithCC ? ccFlavorOptions : jellyOptions).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedFlavor(opt)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-[11px] font-bold text-left transition-all border",
                          selectedFlavor === opt 
                            ? "bg-accent border-accent text-bg" 
                            : "bg-white/5 border-white/10 text-secondary hover:border-white/20"
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bread / Base Selection */}
              {breadOptions.length > 0 && (
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
              )}

              {/* Milk / Flavor Preference for drinks */}
              {(item.category === "Coffee" || item.category === "Espresso" || item.subcategory === "Espresso Drinks" || item.subcategory === "Coffee") && (
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
                disabled={isAddDisabled}
                className="flex-[2] bg-accent text-bg py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 hover:bg-orange-accent disabled:opacity-30 disabled:grayscale"
              >
                <ShoppingCart size={16} />
                {currentPrice === 0 
                  ? "Add to Order" 
                  : `Add to Order — $${(currentPrice * quantity).toFixed(2)}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
