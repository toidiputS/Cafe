import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Sparkles, Coffee, Utensils, Award, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to The Bridge",
    description: "Experience artisanal dining at Manchester's favorite café. Everything is prepared in-house with the freshest ingredients.",
    icon: Coffee,
    color: "text-accent"
  },
  {
    title: "Meet Your AI Waitress",
    description: "Our intelligent assistant can help you find the perfect dish, handle complex customizations, and answer your questions.",
    icon: Sparkles,
    color: "text-orange-accent"
  },
  {
    title: "Artisanal Menu",
    description: "Explore our diverse menu featuring all-day breakfast, signature paninis, and hand-crafted smoothies.",
    icon: Utensils,
    color: "text-[#8EB08E]"
  },
  {
    title: "Bridge Rewards",
    description: "Earn points with every order! Get $10 off for every 10 points earned. We've even got a welcome bonus for you.",
    icon: Award,
    color: "text-accent"
  }
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-bg/80 backdrop-blur-xl"
          onClick={handleClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
        >
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
            className="absolute top-6 right-6 p-2 text-secondary hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="p-8 sm:p-12 flex flex-col items-center text-center">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              className={cn("w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-8", step.color)}
            >
              <Icon size={40} />
            </motion.div>

            <motion.div
              key={`text-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-3xl font-display italic text-white">{step.title}</h2>
              <p className="text-secondary text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>

            <div className="mt-12 w-full flex flex-col gap-3">
              <button
                onClick={nextStep}
                className="w-full bg-accent text-bg py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-accent transition-all flex items-center justify-center gap-3 group"
              >
                {currentStep === steps.length - 1 ? "Start Experience" : "Next Step"}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              {currentStep < steps.length - 1 && (
                <button
                  onClick={handleClose}
                  className="py-3 text-[9px] font-black uppercase tracking-widest text-secondary/40 hover:text-secondary transition-colors"
                >
                  Skip Introduction
                </button>
              )}
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-accent/5 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
