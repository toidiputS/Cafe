import React, { useState, useEffect, useRef } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { BUSINESS_INFO, MENU, CATEGORY_METADATA, type MenuItem } from "../data/menu";
import { Send, User, Bot, ShoppingCart, Trash2, X, LogIn, Award, MapPin, CheckCircle2, Clock, ArrowLeft, Mic, MicOff, RotateCcw, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { cn } from "../lib/utils";
import { auth, db, signIn } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  orderBy, 
  limit,
  setDoc,
  getDoc
} from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { type CartItem } from "../App";
import { ProfilePopover } from "./ProfilePopover";

interface Message {
  role: "user" | "bot";
  content: string;
  suggestions?: string[];
}

interface LoyaltyProfile {
  name: string;
  phoneNumber: string;
  loyaltyPoints: number;
  address?: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ReceptionistProps {
  menu: MenuItem[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (itemName: string, quantity?: number, options?: string, customizations?: string) => string;
  removeFromCart: (itemName: string) => string;
  highlightMenuItem: (itemName: string) => string;
  highlightCategory: (categoryName: string) => string;
  cancelOrder: (orderId: string) => Promise<string>;
  deliveryAddress: string;
  setDeliveryAddress: React.Dispatch<React.SetStateAction<string>>;
  isDelivery: boolean;
  setIsDelivery: React.Dispatch<React.SetStateAction<boolean>>;
  onInitPayment: (amount: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
  lastInteraction?: { type: 'click' | 'add', name: string } | null;
}

export function Receptionist({ 
  menu,
  cart, 
  setCart, 
  addToCart, 
  removeFromCart, 
  highlightMenuItem,
  highlightCategory,
  cancelOrder,
  deliveryAddress, 
  setDeliveryAddress,
  isDelivery,
  setIsDelivery,
  onInitPayment,
  isCartOpen,
  setIsCartOpen,
  onClose,
  lastInteraction
}: ReceptionistProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot", 
      content: "Hello! Welcome to **The Bridge Cafe**. I'm your AI Waitress.\n\nAt The Bridge Café on Elm, we prepare everything in-house with only the freshest ingredients, herbs, and spices. Breakfast is served all day!\n\nWhat can I get started for you today?",
      suggestions: ["Daily Specials", "Weekly Specials", "Homemade Soups", "Breakfast Menu", "Lunch Menu", "Desserts & Drinks"] 
    }
  ]);

  const [sideContext, setSideContext] = useState<string[]>(["Welcome"]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Derive side context from messages or cart
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "bot") {
      const content = lastMsg.content.toLowerCase();
      const context = [];
      if (content.includes("special")) context.push("Chef Specials");
      if (content.includes("breakfast")) context.push("Breakfast Menu");
      if (content.includes("lunch")) context.push("Lunch Menu");
      if (content.includes("soup")) context.push("Homemade Soups");
      if (content.includes("drink")) context.push("Beverages");
      
      // If we have items in cart, add them to context
      if (cart.length > 0) {
        context.push(cart[cart.length - 1].name);
      }
      
      if (context.length > 0) {
        setSideContext(context);
      }
    }
  }, [messages, cart]);

  // Handle outside interactions
  useEffect(() => {
    if (lastInteraction) {
      if (lastInteraction.type === 'add') {
        const item = menu.find(m => m.name === lastInteraction.name);
        if (item) {
          // Generate context-aware suggestions
          const suggestions = [];
          
          // 1. Personalization / Customization
          if (item.options && item.options.length > 0) {
            suggestions.push(`Customize ${item.name}`);
          } else {
            suggestions.push("Customize it");
          }

          // 2. Complementary items based on category
          const beverageCategories = ["Espresso", "Tea", "Coffee", "Juice", "Smoothie"];
          const isBeverage = beverageCategories.includes(item.category);
          const hasBeverageInCart = cart.some(i => {
            const cartItem = menu.find(m => m.id === i.id);
            return cartItem && beverageCategories.includes(cartItem.category);
          });

          if (item.category === "Breakfast") {
            if (!hasBeverageInCart) suggestions.push("Add a Smoothie", "Fresh Coffee?");
          } else if (item.category === "Lunch" || item.category === "Specials") {
            suggestions.push("Add a Soup");
            if (!hasBeverageInCart) suggestions.push("Fresh Juice?");
          } else if (isBeverage) {
            suggestions.push("Check Desserts", "Breakfast Items");
          }

          // 3. General catch-alls
          if (suggestions.length < 3) {
            suggestions.push("View Specials", "See Lunch Menu");
          }

          // Ensure uniqueness and limit to 4
          const uniqueSuggestions = Array.from(new Set(suggestions)).slice(0, 4);

          // Add a message from bot acknowledging the pick
          let complementaryText = "";
          if (item.category === "Breakfast") {
            complementaryText = hasBeverageInCart ? "Great pairing!" : "Want to add a freshly squeezed juice or a smoothie to that?";
          } else if (item.category === "Lunch" || item.category === "Specials") {
            complementaryText = "Would you like to add one of our homemade soups or a side to your order?";
          } else if (isBeverage) {
            complementaryText = "Hungry too? Our breakfast items are served all day, and we have fresh desserts made every morning!";
          }

          setMessages(prev => [...prev, {
            role: "bot",
            content: `Great choice! I've added the **${item.name}** to your order. ${
              item.category === "Breakfast" ? "Breakfast is served all day here!" : ""
            } ${complementaryText} ${item.options ? `Would you like to customize it (bread, options)?` : ""}`,
            suggestions: uniqueSuggestions
          }]);
        }
      }
    }
  }, [lastInteraction, menu, cart]);

  const callAIWithRetry = async (params: any, retries = 5, delay = 2000): Promise<any> => {
    try {
      // @ts-ignore - handled by external SDK wrapper if present, or standard SDK
      return await (ai.models?.generateContent?.(params) || ai.getGenerativeModel({ model: params.model }).generateContent(params));
    } catch (error: any) {
      const isQuotaError = 
        error?.message?.includes("RESOURCE_EXHAUSTED") || 
        error?.status === "RESOURCE_EXHAUSTED" || 
        error?.code === 429;
      
      if (isQuotaError && retries > 0) {
        console.warn(`[Gemini API] Rate limited (429). Attempting retry #${6 - retries} in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
        return callAIWithRetry(params, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  // Waitress Brain: Detect when items are added from the UI and ask appropriate questions
  const prevCartLength = useRef(cart.length);
  useEffect(() => {
    if (cart.length > prevCartLength.current) {
      const newItem = cart[cart.length - 1];
      const menuItem = menu.find(m => m.id === newItem.id);

      // If the item doesn't have options/customizations yet, the waitress should ask
      if (!newItem.options && !newItem.customizations) {
        setLoading(true);
        // Simulate waitress noticing the addition
        setTimeout(async () => {
          const catMeta = menuItem ? CATEGORY_METADATA[menuItem.category] : null;
          const prompt = `
            USER ACTION: Just added "${newItem.name}" to their cart.
            ITEM DETAILS: ${menuItem ? JSON.stringify(menuItem) : "N/A"}
            CATEGORY CONTEXT: ${catMeta ? JSON.stringify(catMeta) : "N/A"}
            
            ROLE: You are an expert waitress at The Bridge Cafe. 
            TASK: Ask the user for their required options (bread type, side, flavor, etc.) based on the ITEM DETAILS and CATEGORY CONTEXT.
            Guidelines:
            - If Lunch sandwich: Ask for Bread Choice (White, Wheat, Rye, Focaccia) AND Side Choice (Pasta salad, Potato salad, Cafe salad, Fruit salad, Chips).
            - If Breakfast Sandwich: Ask for Bread Choice (Bread, Bagel, English Muffin, Croissant).
            - If Bagel: Ask for Bagel choice and Spread choice if applicable.
            - If Coffee/Espresso: Ask about milk choice or flavors.
            
            TONE: Extremely natural, conversational, brief, and friendly. 
            RESTRICTION: Do NOT list the whole menu. Just ask about THIS specific item. 1-2 sentences max.
          `;
          try {
            const result = await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: [
                ...messages.map(m => ({
                  role: m.role === "user" ? "user" : "model",
                  parts: [{ text: m.content }]
                })),
                { role: "user", parts: [{ text: prompt }] }
              ]
            });
            const text = result.text || "";
            setMessages(prev => [...prev, { role: "bot", content: text }]);
          } catch (e) {
            console.error("Waitress brain error:", e);
          } finally {
            setLoading(false);
          }
        }, 500);
      }
    }
    prevCartLength.current = cart.length;
  }, [cart, messages, menu]);

  const [cartHeight, setCartHeight] = useState(0);
  const cartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cartRef.current) {
      setCartHeight(cartRef.current.offsetHeight);
    }
  }, [cart, isDelivery, deliveryAddress]);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltyProfile | null>(null);
  
  const [isListening, setIsListening] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"standard" | "express" | "scheduled">("standard");
  const [discount, setDiscount] = useState(0);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<any>(null);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchLoyaltyProfile(u.uid);
      } else {
        setLoyalty(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchLoyaltyProfile = async (uid: string) => {
    try {
      const docRef = doc(db, "customers", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLoyalty(docSnap.data() as LoyaltyProfile);
      }
    } catch (e) {
      console.error("Error fetching loyalty:", e);
    }
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let deliveryCharge = isDelivery ? BUSINESS_INFO.delivery.charge : 0;
    if (isDelivery && deliveryType === "express") {
      deliveryCharge += 5; // Express premium
    }
    let gratuity = 0;
    
    if (subtotal > BUSINESS_INFO.delivery.gratuity_threshold) {
      gratuity = subtotal * BUSINESS_INFO.delivery.gratuity_rate;
    }
    
    const finalTotal = Math.max(0, subtotal + deliveryCharge + gratuity - discount);
    
    return { subtotal, deliveryCharge, gratuity, discount, total: finalTotal };
  };

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Automatically send voice input
        handleVoiceInput(transcript);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const handleVoiceInput = async (text: string) => {
    // This is basically handleSend but optimized for voice
    if (!text.trim() || loading) return;
    setInput(""); // Clear immediately
    await handleSend(text);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    const parseSuggestions = (text: string) => {
      const suggestions: string[] = [];
      const cleanedContent = text.replace(/\[\[(.*?)\]\]/g, (_, p1) => {
        suggestions.push(p1);
        return "";
      }).trim();
      return { cleanedContent, suggestions };
    };

    const { total: currentTotal } = calculateTotal();
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content + (m.suggestions?.length ? "\n" + m.suggestions.map(s => `[[${s}]]`).join(" ") : "") }]
          })),
          { role: "user", parts: [{ text: userMsg }] }
        ],
        config: {
          systemInstruction: `You are a professional AI Waitress for The Bridge Cafe. 
          Business Info: ${JSON.stringify(BUSINESS_INFO)}
          Address: 1117 Elm Street, Manchester, NH 03101 (Next to Anthem)
          Hours: 6am-5pm Mon-Fri, 6am-4pm Sat & Sun. Breakfast served all day!
          Delivery: 7am-5pm every day. $2.00 delivery charge all over Manchester and Bedford. $10 minimum for Manchester orders. 15% gratuity added automatically for orders over $100.
          Menu: ${JSON.stringify(menu)}
          Current Cart: ${JSON.stringify(cart)}
          Current Total: $${currentTotal.toFixed(2)}
          Loyalty Status: ${JSON.stringify(loyalty)}
          Guidelines:
          1. WAITRESS BRAIN: You are an efficient waitress. Your job is to guide users to the menu board (the main UI) and then handle the details.
          2. DAILY SPECIALS: We have a dedicated 'Daily Specials' section. ALWAYS encourage users to try them if they seem undecided or ask about 'what is new' or 'specials'.
          3. STRICT NO-LISTING POLICY: You are FORBIDDEN from listing menu items, prices, or specials in the chat. They are already visible to the user on the screen.
          4. NAVIGATION: If a user asks about specials, daily specials, soups, or any menu category:
             a) Call the appropriate 'highlightCategory' or 'highlightMenuItem' tool immediately.
             b) Respond with: "I've pointed out the [Category/Item] for you on the menu board! Just tap it to add it to your cart, and I'll take care of the rest."
          5. PROACTIVE SUGGESTIONS: When a user adds an item:
             a) If it's food (Breakfast/Lunch/Special), proactively suggest a complement (Smoothie, Juice, Soup, or Coffee).
             b) If it's a drink, suggest a dessert or a signature sandwich.
             c) Always ask about customizations if the item has them (like bread choice for sandwiches or milk for coffee).
          5. LOYALTY REDEMPTION: 
             a) Users earn 1 point per $1 spent.
             b) They can redeem points for a discount: 10 points = $10 discount.
             c) Redemption must be in multiples of 10 points (10, 20, 30...).
             d) If a user has 10 or more points, PROACTIVELY ask if they would like to redeem them whenever they are nearing checkout or checking their total.
             e) Before calling 'applyLoyaltyDiscount', ask the user EXACTLY how many points they wish to redeem (e.g. "You have 25 points! Would you like to use 10 points for a $10 discount, or 20 for $20?").
          6. CONCISE: Keep responses to exactly 1-2 brief, friendly sentences. Use conversational pills for common next steps like [[Customize it]] or [[View Specials]].`,
          tools: [{
            functionDeclarations: [
              {
                name: "addToCart",
                description: "Adds an item from the menu with customizations.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    itemName: { type: Type.STRING },
                    quantity: { type: Type.NUMBER },
                    options: { type: Type.STRING },
                    customizations: { type: Type.STRING }
                  },
                  required: ["itemName"]
                }
              },
              {
                name: "removeFromCart",
                description: "Removes an item from the user's cart.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    itemName: { type: Type.STRING }
                  },
                  required: ["itemName"]
                }
              },
              {
                name: "updateDeliveryInfo",
                description: "Updates whether it is a delivery, the address, and the delivery type.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    isDelivery: { type: Type.BOOLEAN },
                    address: { type: Type.STRING },
                    deliveryType: { type: Type.STRING, enum: ["standard", "express", "scheduled"] }
                  },
                  required: ["isDelivery"]
                }
              },
              {
                name: "signUpForLoyalty",
                description: "Register for loyalty. Can optionally include a delivery address to save for future orders.",
                parameters: {
                  type: Type.OBJECT,
                  properties: { 
                    phoneNumber: { type: Type.STRING },
                    address: { type: Type.STRING, description: "Home or office address for delivery" }
                  },
                  required: ["phoneNumber"]
                }
              },
              {
                name: "placeOrder",
                description: "Save final order to server.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    customerName: { type: Type.STRING },
                    isDelivery: { type: Type.BOOLEAN },
                    address: { type: Type.STRING }
                  },
                  required: ["customerName", "isDelivery"]
                }
              },
              {
                name: "checkOrderStatus",
                description: "Check latest order status.",
                parameters: { type: Type.OBJECT, properties: {} }
              },
              {
                name: "initiatePayment",
                description: "Show the secure payment form. ONLY use this when the user is ready to pay. You must confirm the final total and delivery/carryout status before calling this.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    amount: { type: Type.NUMBER, description: "Total amount to pay in USD" }
                  },
                  required: ["amount"]
                }
              },
              {
                name: "highlightMenuItem",
                description: "Scrolls the main menu to the specified item and highlights it visually. Use this when the user asks about a specific item or when you suggest one.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    itemName: { type: Type.STRING }
                  },
                  required: ["itemName"]
                }
              },
              {
                name: "highlightCategory",
                description: "Scrolls the main menu to a specific category header and highlights it. Best for broad questions or category browsing.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    categoryName: { type: Type.STRING }
                  },
                  required: ["categoryName"]
                }
              },
              {
                name: "applyLoyaltyDiscount",
                description: "Applies a discount from loyalty points. 10 points = $10 discount.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    pointsToRedeem: { type: Type.NUMBER, description: "Number of points to redeem (multiple of 10)" }
                  },
                  required: ["pointsToRedeem"]
                }
              },
              {
                name: "cancelOrder",
                description: "Cancels an order by ID.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    orderId: { type: Type.STRING }
                  },
                  required: ["orderId"]
                }
              }
            ]
          }]
        }
      });

      const calls = response.functionCalls;
      let toolResponseStr = "";
      if (calls) {
        for (const call of calls) {
          if (call.name === "addToCart") {
            const res = addToCart(call.args.itemName as string, (call.args.quantity as number) || 1, call.args.options as string, call.args.customizations as string);
            toolResponseStr += res + " ";
          }
          if (call.name === "removeFromCart") {
            const res = removeFromCart(call.args.itemName as string);
            toolResponseStr += res + " ";
          }
          if (call.name === "updateDeliveryInfo") {
            setIsDelivery(call.args.isDelivery as boolean);
            if (call.args.address) setDeliveryAddress(call.args.address as string);
            if (call.args.deliveryType) setDeliveryType(call.args.deliveryType as any);
            toolResponseStr += `Updated delivery info: ${call.args.isDelivery ? (call.args.deliveryType || deliveryType) + " delivery to " + (call.args.address || deliveryAddress) : "Carry out"}. `;
          }
          if (call.name === "signUpForLoyalty") {
            if (!user) {
              toolResponseStr += "Please log in first. ";
            } else {
              await setDoc(doc(db, "customers", user.uid), {
                name: user.displayName || "Valued Customer",
                phoneNumber: call.args.phoneNumber,
                address: call.args.address || null,
                loyaltyPoints: 25, // Sign-up bonus
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
              await fetchLoyaltyProfile(user.uid);
              toolResponseStr += `Welcome to The Bridge Rewards! We've added 25 bonus points to your account to get you started. ${call.args.address ? "Address saved as well." : ""}`;
            }
          }
          if (call.name === "highlightMenuItem") {
            const res = highlightMenuItem(call.args.itemName as string);
            toolResponseStr += res + " ";
          }
          if (call.name === "highlightCategory") {
            const res = highlightCategory(call.args.categoryName as string);
            toolResponseStr += res + " ";
          }
          if (call.name === "applyLoyaltyDiscount") {
            const pts = call.args.pointsToRedeem as number;
            if (!loyalty || loyalty.loyaltyPoints < pts) {
              toolResponseStr += "Insufficient points. ";
            } else {
              const discountValue = Math.floor(pts / 10) * 10;
              setDiscount(discountValue);
              toolResponseStr += `Applied $${discountValue} discount (from ${pts} points)! Your total is updated. `;
            }
          }
          if (call.name === "cancelOrder") {
            const res = await cancelOrder(call.args.orderId as string);
            toolResponseStr += res + " ";
          }
          if (call.name === "placeOrder") {
            if (cart.length === 0) {
              toolResponseStr += "Cart is empty. ";
            } else {
              const { total } = calculateTotal();
              // Final check for address if delivery
              if (call.args.isDelivery && !call.args.address && !deliveryAddress) {
                toolResponseStr += "Wait, I need a delivery address first. ";
              } else {
                const finalAddress = (call.args.address as string) || deliveryAddress;
                const orderData = {
                  customerId: user?.uid || "guest",
                  customerName: call.args.customerName,
                  items: [...cart],
                  status: "Pending",
                  kitchenNotified: true,
                  total,
                  discount,
                  isDelivery: call.args.isDelivery,
                  deliveryAddress: finalAddress,
                  createdAt: serverTimestamp(),
                  estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000).toISOString()
                };
                const orderRef = await addDoc(collection(db, "orders"), orderData);
                
                setLastPlacedOrder({ id: orderRef.id, ...orderData });
                
                if (user && loyalty) {
                  const pointsEarned = Math.floor(total);
                  const pointsToDeduct = discount * 10;
                  await updateDoc(doc(db, "customers", user.uid), {
                    loyaltyPoints: Math.max(0, loyalty.loyaltyPoints - pointsToDeduct + pointsEarned),
                    updatedAt: serverTimestamp()
                  });
                  await fetchLoyaltyProfile(user.uid);
                }
                setCart([]);
                setDiscount(0);
                setIsDelivery(false);
                setDeliveryAddress("");
                toolResponseStr += `Order confirmed! ID: ${orderRef.id}. `;
              }
            }
          }
          if (call.name === "checkOrderStatus") {
            if (!user) {
              toolResponseStr += "Please log in to check your orders. ";
            } else {
              try {
                const q = query(
                  collection(db, "orders"), 
                  where("customerId", "==", user.uid), 
                  orderBy("createdAt", "desc"), 
                  limit(1)
                );
                const snap = await getDocs(q);
                if (snap.empty) {
                  toolResponseStr += "You haven't placed any orders yet. ";
                } else {
                  const o = snap.docs[0].data();
                  const etaDate = new Date(o.estimatedDeliveryTime);
                  const formattedTime = etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  toolResponseStr += `Your latest order (#${snap.docs[0].id.slice(-6)}) is currently: ${o.status}. ${o.isDelivery ? `Estimated delivery: ${formattedTime}` : `Estimated ready time: ${formattedTime}`}. `;
                }
              } catch (err) {
                console.error("Order status query failed:", err);
                toolResponseStr += "I'm having trouble retrieving your order status right now. ";
              }
            }
          }
          if (call.name === "initiatePayment") {
            onInitPayment(call.args.amount as number);
            toolResponseStr += "I've opened the secure payment form for you. ";
          }
        }
        
        const followUp = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            ...messages.map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content + (m.suggestions?.length ? "\n" + m.suggestions.map(s => `[[${s}]]`).join(" ") : "") }] })),
            { role: "user", parts: [{ text: userMsg }] },
            { role: "model", parts: [{ text: toolResponseStr }] }
          ]
        });
        const { cleanedContent, suggestions } = parseSuggestions(followUp.text || toolResponseStr);
        setMessages(prev => [...prev, { role: "bot", content: cleanedContent, suggestions }]);
      } else {
        const { cleanedContent, suggestions } = parseSuggestions(response.text || "Sorry, try again.");
        setMessages(prev => [...prev, { role: "bot", content: cleanedContent, suggestions }]);
      }
    } catch (error: any) {
      console.error(error);
      let errorMessage = "I'm sorry, but I've encountered an unexpected error. Please try again in a moment.";
      let errorSuggestions: string[] = ["Retry"];

      if (error?.message?.includes("RESOURCE_EXHAUSTED") || error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429) {
        errorMessage = "We've hit the Gemini API conversation limit after retrying. This usually happens on the free tier. You can increase your limits by switching to a paid plan in the **Settings** menu. [[Retry Again]]";
        errorSuggestions = ["Retry Again"];
      }

      const { cleanedContent, suggestions } = parseSuggestions(errorMessage);
      setMessages(prev => [...prev, { role: "bot", content: cleanedContent, suggestions }]);
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, total, gratuity } = calculateTotal();

  return (
    <section className="h-full flex flex-col bg-card relative overflow-hidden">
      {/* Waitress Header */}
      <div className="p-3 border-b border-border-dim bg-bg/50 backdrop-blur-md flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-orange-accent/10 flex items-center justify-center">
              <User className="w-4 h-4 text-orange-accent" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white leading-none mb-0.5">AI Waitress</h2>
            <span className="text-[8px] uppercase tracking-tighter text-secondary font-bold">Friendly & Precise</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/5 rounded-full transition-colors text-secondary hover:text-white"
              title="Close Waitress"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showProfile && (
          <ProfilePopover 
            user={user} 
            loyalty={loyalty} 
            cart={cart}
            setCart={setCart}
            cancelOrder={cancelOrder}
            onClose={() => setShowProfile(false)} 
          />
        )}
      </AnimatePresence>

      {/* Main Content Area: Chat or Confirmation */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <AnimatePresence mode="wait">
          {lastPlacedOrder ? (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 p-8 flex flex-col bg-bg overflow-y-auto custom-scrollbar z-[70]"
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h3>
                <p className="text-secondary text-sm mb-8 font-medium italic">
                  Thank you for choosing The Bridge Cafe. Your order #<span className="text-white font-mono">{lastPlacedOrder.id.slice(-6).toUpperCase()}</span> is being prepared.
                </p>

                <div className="w-full space-y-4 bg-white/5 rounded-2xl p-6 border border-white/5">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-accent" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Est. Delivery</span>
                    </div>
                    <span className="font-bold text-white text-sm">
                      {new Date(lastPlacedOrder.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-secondary text-left mb-3">Order Summary</span>
                    {lastPlacedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-white/60 font-medium">{item.quantity}x {item.name}</span>
                        <span className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Total Paid</span>
                    <span className="text-xl font-bold text-orange-accent">${lastPlacedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setLastPlacedOrder(null)}
                  className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-accent hover:text-white transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Assistant
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="assistant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0 relative"
            >
              {/* Mini Cart Header / Toggle */}
              <div className="shrink-0 bg-card/50 border-b border-white/5 pb-2 transition-all">
                <div 
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="px-6 py-4 flex items-center justify-between cursor-pointer group active:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      cart.length > 0 ? "bg-accent/20 text-accent ring-2 ring-accent/10" : "bg-white/5 text-secondary"
                    )}>
                      <ShoppingCart size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white leading-tight">My Food Order</h3>
                      <p className="text-[9px] text-secondary font-bold uppercase tracking-widest mt-1 opacity-60">
                        {cart.length === 0 ? "Cart is empty" : `${cart.reduce((a, b) => a + b.quantity, 0)} Items Added`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {cart.length > 0 && (
                      <span className="text-sm font-black text-accent font-mono tracking-tighter tabular-nums">
                        ${calculateTotal().total.toFixed(2)}
                      </span>
                    )}
                    <motion.div
                      animate={{ rotate: isCartOpen ? 180 : 0 }}
                      className="text-secondary"
                    >
                      <Plus size={16} className={cn("transition-all", isCartOpen ? "rotate-45" : "rotate-0")} strokeWidth={3} />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {isCartOpen && cart.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-bg/30"
                    >
                      <div className="px-6 pb-6 pt-2 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {cart.map((item, idx) => (
                          <div key={`${item.id}-${idx}`} className="group flex justify-between items-start">
                            <div className="flex gap-3">
                              <span className="text-[10px] font-black text-accent mt-0.5">{item.quantity}x</span>
                              <div className="flex flex-col">
                                <span className="text-[11px] text-white font-bold leading-tight uppercase tracking-wider">{item.name}</span>
                                {item.options && (
                                  <span className="text-[9px] text-secondary font-medium italic opacity-60">{item.options}</span>
                                )}
                                <span className="text-[9px] font-mono text-accent/70 mt-0.5">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); addToCart(item.name, -1, item.options, item.customizations); }}
                                className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 text-orange-accent text-[10px]"
                              >-</button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); addToCart(item.name, 1, item.options, item.customizations); }}
                                className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 text-orange-accent text-[10px]"
                              >+</button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeFromCart(item.name); }}
                                className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-red-500/20 text-red-400 ml-1"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        <div className="pt-4 border-t border-white/5 flex gap-2">
                           <button 
                             onClick={() => onInitPayment(calculateTotal().total)}
                             className="flex-1 bg-accent text-bg py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-accent hover:text-white transition-all shadow-xl shadow-accent/10"
                           >
                             Checkout
                           </button>
                           <button 
                             onClick={() => setIsCartOpen(false)}
                             className="px-4 py-3 bg-white/5 text-secondary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10"
                           >
                              Hide
                           </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Messages Container */}
              <div className="flex-1 flex min-h-0 relative">
                {/* Context Labels (Vertical Rail per Screenshot) */}
                <div className="hidden sm:flex w-10 border-r border-white/5 flex-col items-center py-6 sticky top-0 h-full overflow-hidden shrink-0">
                  <div className="flex flex-col items-center gap-12 w-full">
                    <AnimatePresence mode="popLayout">
                      {sideContext.map((title, idx) => (
                        <motion.div
                          key={`${title}-${idx}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex flex-col items-center gap-4"
                        >
                          <div className="w-px h-12 bg-accent/20" />
                          <div className="whitespace-nowrap text-[7px] font-black uppercase tracking-[0.4em] rotate-180 [writing-mode:vertical-lr] text-secondary hover:text-accent transition-colors">
                            {title}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div 
                  ref={scrollRef} 
                  className="flex-1 overflow-y-auto p-6 space-y-4 text-[13px] custom-scrollbar"
                  style={{ paddingBottom: cartHeight + 60 }}
                >
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex flex-col gap-2",
                      msg.role === "user" ? "items-end ml-auto" : "items-start mr-auto",
                      "max-w-[90%]"
                    )}
                  >
                    <div className={cn(
                      "p-4 px-5 rounded-[12px] leading-relaxed",
                      msg.role === "user" 
                        ? "bg-orange-accent text-white rounded-br-[2px]" 
                        : "bg-[#252525] text-white/90 rounded-bl-[2px]"
                    )}>
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    
                    {msg.suggestions && msg.suggestions.length > 0 && i === messages.length - 1 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {msg.suggestions.map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSend(suggestion)}
                            className="px-4 py-1.5 rounded-full border border-orange-accent/30 bg-orange-accent/5 text-orange-accent text-[11px] font-bold hover:bg-orange-accent hover:text-white transition-all active:scale-95"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
                {loading && (
                  <div className="bg-[#252525] p-4 rounded-[12px] rounded-bl-[2px] w-fit">
                    <div className="flex gap-1.5 pt-1 pb-1">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
              <div 
                ref={cartRef}
                className={cn(
                  "absolute bottom-0 left-0 right-0 p-6 pt-0 bg-gradient-to-t from-bg via-bg/80 to-transparent transition-all duration-300",
                  isCartOpen ? "z-[60]" : "z-40"
                )}
              >
                <div className="relative group/input">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="relative flex gap-2 items-center"
                  >
                    <div className="relative flex-1">
                      <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Order, track status, or check points..."}
                        className={cn(
                          "w-full bg-black border rounded-full pl-6 pr-16 py-3.5 text-sm focus:outline-none focus:border-orange-accent/50 text-white placeholder:text-neutral-700 transition-all font-medium",
                          isListening ? "border-orange-accent animate-pulse" : "border-border-dim"
                        )}
                      />
                      <button 
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-1.5 bottom-1.5 px-5 bg-transparent text-orange-accent text-xs font-black uppercase tracking-widest hover:brightness-125 transition-all disabled:opacity-30"
                      >
                        Send
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                        isListening ? "bg-orange-accent text-white" : "bg-neutral-900 text-secondary hover:text-white"
                      )}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
