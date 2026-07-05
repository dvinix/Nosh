# Nosh: Next-Gen Food Delivery App

Nosh is a modern, AI-powered food delivery application built with Next.js, Supabase, and Groq. It features a premium, vibrant design system and a suite of advanced features designed to make food ordering personalized, intuitive, and fun.

## 🚀 Key Features

### 🍽️ Core Ordering Experience
- **Restaurant Discovery**: Browse and search restaurants with real-time filtering by cuisine, name, and popularity.
- **Smart Cart**: A context-aware cart that intelligently enforces a single-restaurant lock, seamlessly prompting users to start a new cart if they attempt to order from multiple restaurants simultaneously.
- **Secure Authentication**: Frictionless Google OAuth powered by Supabase.

### 🧠 AI & Personalization
- **Intelligent Recommendation Engine**: A custom algorithmic engine that analyzes your past orders and uses cosine similarity to recommend new dishes based on your taste profile (e.g., categories, tags, dietary preferences).
- **"Goes well with"**: Smart cross-selling suggestions on individual dish pages based on popular pairings.
- **Trending Restaurants**: Real-time identification of trending spots based on recent network-wide order volume.

### 💬 Groq-Powered AI Assistant
- An interactive, context-aware AI chat assistant powered by Groq (`llama-3.3-70b-versatile`).
- **Tool Calling**: The AI has direct access to your order history, the restaurant catalog, and the recommendation engine, allowing it to answer queries like "What did I order last Tuesday?" or "Find me a healthy salad under $15."

### 🥗 Nutrition & Planning
- **Calorie Dashboard**: Tracks the nutritional value of all your orders, presenting monthly calorie consumption, macronutrient breakdowns, and allowing 1-click Excel exports.
- **Weekly Diet Planner**: Set a daily calorie target and dietary preference, and an LLM (`openai/gpt-oss-120b`) will generate a personalized 7-day meal plan mapping exactly to real dishes in the Nosh catalog. Plans are cached securely in the database.
- **Budget Planner**: A deterministic optimization tool that finds the best combination of dishes from a single restaurant to perfectly match your budget, optimized for either maximum variety or maximum calories.

### 📊 Analytics & Nosh Wrapped
- **Order Analytics**: Beautiful Recharts-powered data visualizations of your spending trends, top cuisines, and favorite ordering days.
- **Nosh Wrapped**: A highly stylized, shareable card summarizing your month in food. It features a unique, witty personality tag generated dynamically by Groq (e.g., "The Weekend Warrior") and allows instant high-quality PNG exports.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: Next.js Server Components & Route Handlers.
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Google OAuth).
- **AI / LLMs**: Groq API (function calling, text generation).

## 🏃‍♂️ Running Locally
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to `.env` and fill in your Supabase and Groq keys.
4. Run `npm run dev` to start the development server.

> Check out [ARCHITECTURE.md](./ARCHITECTURE.md) for a deep dive into the system design and core algorithms!
