import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Coffee, Utensils, Award, ArrowRight, ArrowLeft, LogIn } from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  targetSelector: string;
  scrollBehavior?: ScrollLogicalPosition;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to The Bridge",
    description: "Experience artisanal dining at Manchester's favorite café. Everything is prepared in-house with the freshest ingredients.",
    icon: Coffee,
    color: "text-accent",
    targetSelector: "#onboard-hero",
    scrollBehavior: "center",
  },
  {
    title: "Meet Your AI Waitress",
    description: "Our intelligent assistant can help you find the perfect dish, handle complex customizations, and answer your questions.",
    icon: Sparkles,
    color: "text-orange-accent",
    targetSelector: "#onboard-assistant-btn",
    scrollBehavior: "center",
  },
  {
    title: "Artisanal Menu",
    description: "Explore our diverse menu featuring all-day breakfast, signature paninis, and hand-crafted smoothies.",
    icon: Utensils,
    color: "text-[#8EB08E]",
    targetSelector: "#menu",
    scrollBehavior: "start",
  },
  {
    title: "Guest Book & Reviews",
    description: "Earn points with every order! Get $10 off for every 10 points earned. Share your experience in our guest book.",
    icon: Award,
    color: "text-accent",
    targetSelector: "#onboard-reviews",
    scrollBehavior: "center",
  },
  {
    title: "Staff & Management",
    description: "Staff members can sign in here to access the admin portal, manage the menu, and handle orders behind the scenes.",
    icon: LogIn,
    color: "text-orange-accent",
    targetSelector: "#onboard-management",
    scrollBehavior: "center",
  }
];

interface OnboardingModalProps {
  forceOpen?: boolean;
  onForceClose?: () => void;
  onStepChange?: (stepIndex: number, targetSelector: string) => void;
}

// All rects are in viewport (fixed) coordinates
interface ViewportRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingModal({ forceOpen, onForceClose, onStepChange }: OnboardingModalProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlight, setSpotlight] = useState<ViewportRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [placement, setPlacement] = useState<'above' | 'below'>('below');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const scrollSettleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-show on first visit
  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  // Replay when triggered externally
  useEffect(() => {
    if (forceOpen) {
      setCurrentStep(0);
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleClose = useCallback(() => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsOpen(false);
    setSpotlight(null);
    onForceClose?.();
  }, [onForceClose]);

  // Measure target element — all coordinates are viewport-relative (for position:fixed)
  const measureTarget = useCallback(() => {
    if (!isOpen) return;
    const step = steps[currentStep];
    const el = document.querySelector(step.targetSelector);
    if (!el) {
      setSpotlight(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const pad = 12;

    // For very tall elements, limit the spotlight height to the viewport
    const maxSpotHeight = Math.min(rect.height + pad * 2, window.innerHeight * 0.55);

    const spot: ViewportRect = {
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: maxSpotHeight,
    };

    setSpotlight(spot);

    // --- Tooltip positioning (viewport-relative, always clamped) ---
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tooltipW = Math.min(380, vw - 32);
    const tooltipH = 290;
    const margin = 16;

    const spotBottom = spot.top + spot.height;
    const spaceBelow = vh - spotBottom;
    const spaceAbove = spot.top;

    let pl: 'above' | 'below' = 'below';
    let top: number;

    if (spaceBelow >= tooltipH + margin) {
      pl = 'below';
      top = spotBottom + margin;
    } else if (spaceAbove >= tooltipH + margin) {
      pl = 'above';
      top = spot.top - tooltipH - margin;
    } else {
      // Neither side has room — place at the bottom of the viewport, overlapping the spotlight
      pl = 'below';
      top = vh - tooltipH - margin;
    }

    // Always clamp within viewport
    top = Math.max(margin, Math.min(top, vh - tooltipH - margin));

    let left = spot.left + spot.width / 2 - tooltipW / 2;
    left = Math.max(margin, Math.min(left, vw - tooltipW - margin));

    setPlacement(pl);
    setTooltipStyle({ top, left, width: tooltipW });
  }, [isOpen, currentStep]);

  // Scroll to target then measure once settled
  const scrollToTarget = useCallback(() => {
    const step = steps[currentStep];
    onStepChange?.(currentStep, step.targetSelector);

    const findAndScroll = (attempts = 0) => {
      const el = document.querySelector(step.targetSelector);
      if (!el && attempts < 10) {
        setTimeout(() => findAndScroll(attempts + 1), 150);
        return;
      }
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;

        // For tall elements, scroll so the top is visible with some padding,
        // leaving room for the tooltip below the visible portion.
        if (rect.height > vh * 0.5) {
          const targetScrollY = window.scrollY + rect.top - 80;
          window.scrollTo({ top: Math.max(0, targetScrollY), behavior: 'smooth' });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: step.scrollBehavior || 'center' });
        }
      }

      // After scroll settles, measure
      if (scrollSettleRef.current) clearTimeout(scrollSettleRef.current);
      scrollSettleRef.current = setTimeout(measureTarget, 600);
    };

    findAndScroll();
  }, [currentStep, measureTarget, onStepChange]);

  useEffect(() => {
    if (isOpen) {
      scrollToTarget();
    }
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (scrollSettleRef.current) clearTimeout(scrollSettleRef.current);
    };
  }, [isOpen, currentStep, scrollToTarget]);

  // Re-measure continuously on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measureTarget);
    };

    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, measureTarget]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  const rx = 20;

  return (
    <AnimatePresence>
      {/* 
        Everything uses position:fixed so the overlay always covers the 
        full viewport and coordinates track with getBoundingClientRect. 
      */}
      <div className="fixed inset-0 z-200" style={{ pointerEvents: 'none' }}>
        {/* SVG Overlay — fixed to viewport */}
        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 w-full h-full"
          style={{ pointerEvents: 'auto' }}
          onClick={handleClose}
        >
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {spotlight && (
                <motion.rect
                  initial={{ opacity: 0 }}
                  animate={{
                    x: spotlight.left,
                    y: spotlight.top,
                    width: spotlight.width,
                    height: spotlight.height,
                    opacity: 1,
                  }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  rx={rx}
                  ry={rx}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.82)"
            mask="url(#spotlight-mask)"
          />
        </motion.svg>

        {/* Pulsing ring around the spotlight */}
        {spotlight && (
          <motion.div
            key={`ring-${currentStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed pointer-events-none"
            style={{
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.width,
              height: spotlight.height,
              borderRadius: rx,
            }}
          >
            <div
              className="absolute inset-0 rounded-[20px] animate-pulse"
              style={{
                boxShadow: '0 0 0 2px rgba(255, 165, 0, 0.5), 0 0 30px rgba(255, 165, 0, 0.15), 0 0 60px rgba(255, 165, 0, 0.08)',
              }}
            />
            <div
              className="absolute -inset-1 rounded-[22px]"
              style={{
                boxShadow: '0 0 0 1px rgba(255, 165, 0, 0.3)',
                animation: 'onboard-ring-pulse 2s ease-in-out infinite',
              }}
            />
          </motion.div>
        )}

        {/* Tooltip Card — fixed to viewport */}
        <motion.div
          ref={tooltipRef}
          key={`tooltip-${currentStep}`}
          initial={{ opacity: 0, y: placement === 'below' ? -12 : 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: placement === 'below' ? -12 : 12, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300, delay: 0.2 }}
          className="fixed pointer-events-auto"
          style={tooltipStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-card/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 flex">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 transition-all duration-500",
                    i <= currentStep ? "bg-accent" : "bg-white/5"
                  )}
                />
              ))}
            </div>

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 text-secondary/40 hover:text-white transition-colors z-10"
            >
              <X size={16} />
            </button>

            <div className="p-6 sm:p-8 flex flex-col items-center text-center">
              <motion.div
                key={`icon-${currentStep}`}
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-5", step.color)}
              >
                <Icon size={28} />
              </motion.div>

              <motion.div
                key={`text-${currentStep}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2.5"
              >
                <h2 className="text-xl sm:text-2xl font-display italic text-white">{step.title}</h2>
                <p className="text-secondary text-xs leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>

              <div className="mt-7 w-full flex flex-col gap-2">
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      className="flex-none px-4 py-3.5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-[0.15em] text-secondary hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
                    >
                      <ArrowLeft size={12} />
                      Back
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="flex-1 bg-accent text-bg py-3.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] hover:bg-orange-accent transition-all flex items-center justify-center gap-2 group"
                  >
                    {currentStep === steps.length - 1 ? "Start Experience" : "Next"}
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {currentStep < steps.length - 1 && (
                  <button
                    onClick={handleClose}
                    className="py-2 text-[8px] font-black uppercase tracking-widest text-secondary/30 hover:text-secondary transition-colors"
                  >
                    Skip Tour
                  </button>
                )}
              </div>

              {/* Step dots */}
              <div className="flex gap-1.5 mt-4">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      i === currentStep ? "bg-accent w-4" : i < currentStep ? "bg-accent/40" : "bg-white/10"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Decorative blurs */}
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-orange-accent/5 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Arrow pointer towards spotlight */}
          {spotlight && (
            <div
              className={cn(
                "absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-card/95 border border-white/10 rotate-45",
                placement === 'below' ? "-top-1.5 border-b-0 border-r-0" : "-bottom-1.5 border-t-0 border-l-0"
              )}
            />
          )}
        </motion.div>
      </div>

      {/* Keyframes for pulsing ring */}
      <style>{`
        @keyframes onboard-ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.04); opacity: 0.15; }
        }
      `}</style>
    </AnimatePresence>
  );
}
