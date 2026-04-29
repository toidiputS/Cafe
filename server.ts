
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

let stripe: Stripe | null = null;

function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }
    stripe = new Stripe(key);
  }
  return stripe;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok",
      hasAiKey: !!process.env.GEMINI_API_KEY,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY
    });
  });

  // AI Chat Proxy
  app.post("/api/chat", async (req, res) => {
    try {
      const { contents, systemInstruction, tools, model = "gemini-3-flash-preview" } = req.body;
      const key = process.env.GEMINI_API_KEY;
      
      if (!key) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const genAI = new GoogleGenAI({ apiKey: key });
      
      // Use the models.generateContent API if available, or the standard one
      // @ts-ignore
      const result = await genAI.models.generateContent({
        model,
        contents,
        config: { systemInstruction, tools }
      });

      res.json(result);
    } catch (error: any) {
      console.error("AI Proxy Error:", error);
      res.status(500).json({ error: error.message || "Internal AI Error" });
    }
  });

  // Payment Intent API
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, metadata } = req.body;
      const stripeClient = getStripe();

      const paymentIntent = await stripeClient.paymentIntents.create({
        amount, // in cents
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata,
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
