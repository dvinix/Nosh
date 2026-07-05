# Nosh Architecture & Technical Deep Dive

This document outlines the system design, core algorithms, and architectural decisions that power Nosh.

## 🏗️ System Architecture

Nosh uses a modern decoupled architecture optimized for edge computing and serverless deployments:

- **Client Layer (React / Next.js)**: 
  - Heavily utilizes React Server Components (RSC) to minimize client bundle size.
  - Client components are strictly used for interactive elements (e.g., Cart Context, Planners, Charts).
  - State management for the shopping cart is handled via a global React Context (`CartProvider`), ensuring cart data persists across navigations without unnecessary prop drilling.

- **API Layer (Next.js Route Handlers)**:
  - Serverless functions handle computationally heavy tasks, external API orchestration (Groq), and secure database writes.
  - Endpoints are protected by checking Supabase Auth sessions on the server.

- **Data Layer (Supabase / PostgreSQL)**:
  - **Schema**: `users`, `restaurants`, `dishes`, `orders`, `order_items`, `diet_plans`, `monthly_personality_tags`.
  - **Security**: Row Level Security (RLS) is enabled on all user-specific tables (`orders`, `diet_plans`, etc.) to ensure users can only read/write their own data.

---

## 🧠 Recommendation Engine

The recommendation engine is a hybrid system combining deterministic popularity metrics with personalized content-based filtering.

### 1. Trending Algorithm
- **Mechanism**: A server-side function aggregates all orders placed within the last 7 days.
- **Logic**: It groups orders by `restaurant_id` and counts the frequency. The restaurant with the highest volume is flagged as "Trending".
- **Performance**: This can be optimized in PostgreSQL using a materialized view for scale, but is currently computed dynamically for real-time accuracy.

### 2. Personalized Taste Profiling
- **Mechanism**: The system analyzes a user's `order_history` to build a dynamic "taste profile".
- **Logic**: 
  - Extracts the most frequently ordered `categories` (e.g., "Mexican", "Healthy").
  - Queries the `dishes` table for items matching these categories that the user *hasn't* ordered recently.
  - Falls back to universally highly-rated dishes if the user is new (Cold Start problem).

---

## 💬 AI Chat Assistant (Tool Calling)

The AI assistant acts as a personalized concierge, utilizing **Groq** for ultra-fast inference.

- **Model**: `llama-3.3-70b-versatile` (chosen for its robust function-calling capabilities).
- **Tools Provided**:
  1. `search_dishes(query, category, max_price)`: Executes a constrained Supabase query to find matching dishes.
  2. `get_order_history(user_id)`: Retrieves the user's past orders.
  3. `get_recommendations(user_id)`: Hooks directly into the Recommendation Engine.
- **Workflow**: 
  - User sends a message -> Next.js API formats tools -> Groq decides if a tool is needed -> API executes the local tool -> Returns data to Groq -> Groq streams the final conversational response to the client.

---

## 🥗 AI Diet Planner

- **Model**: `openai/gpt-oss-120b` (via Groq).
- **Mechanism**: 
  - The API fetches a lightweight version of the *entire* dish catalog (ID, name, calories, category).
  - A strict system prompt forces the LLM to act as a constraint solver: selecting exactly 7 dishes that average out to the user's target calorie goal, matching their dietary preference (e.g., Veg/Non-Veg).
  - **Data Integrity**: The LLM is instructed to return *only* `dish_ids` in a strict JSON array. The backend then maps these IDs back to the secure, full dish objects from the database before sending them to the client.

---

## 💰 Budget Planner Algorithm

Unlike the Diet Planner, the Budget Planner does **not** use an LLM. It relies on a deterministic backend algorithm.

- **Constraints**: 
  - Must not exceed the budget.
  - Must respect the "Single Restaurant Cart Lock" (all items in a combo must be from the same restaurant).
- **Algorithm**: Randomized Greedy Search / Small Knapsack
  - For each restaurant, the algorithm randomly shuffles the menu and selects items until the target group size is met.
  - If the combination is under budget, it calculates a "Score" based on the user's optimization goal:
    - *Maximize Variety*: Score = `count(distinct categories)`
    - *Most Calories*: Score = `sum(calories)`
  - It generates hundreds of combinations in milliseconds, sorts them by score, deduplicates them, and returns the top 3 global combos.
