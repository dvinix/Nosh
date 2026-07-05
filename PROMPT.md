# Nosh — Master Build Spec (Antigravity + Supabase)

**How to use this doc:** Copy the **Design System** section into every stage prompt (paste it first, every time). Then copy only the Stage N section for the stage you're building. Never move to Stage N+1 until Stage N runs clean.

---

## 🎨 DESIGN SYSTEM (pin this at the top of every prompt)

You are the design lead for Nosh, a premium food-delivery product. Do NOT default to typical "AI app" visual language: no indigo/violet gradients, no glowing neon blobs, no generic rounded sans-serif (Poppins/Nunito) everywhere, no cream-background-with-terracotta-accent. This should look like it was designed by a human studio that also does restaurant branding — warm, tactile, confident, a little editorial.

**Palette — "Midnight Ink & Saffron Ember"**
- Base/background: `#15151A` (near-black ink, not pure black)
- Surface/card: `#1E1E24`
- Primary accent (CTAs, price tags, active states): `#E8590C` (burnt ember orange — warmer/deeper than Swiggy orange, never neon)
- Secondary accent (veg/health/success signals): `#2D6A4F` (forest green)
- Warning/spice indicator: `#D64545` (muted red, used sparingly — chili icons, "bestseller" tags)
- Text primary: `#F5F0E8` (warm off-white, not pure white)
- Text muted: `#9A968E`
- Dividers/hairlines: `#2E2E36`

**Typography**
- Display face (dish names, hero headlines, restaurant names): a characterful serif — **Fraunces** (variable, use optical size + soft weight) or **Canela**-style alternative. Used with restraint: hero title, food name on detail page, section headers only.
- UI/body face: **General Sans** or **Inter** — clean grotesk for buttons, labels, nav, prices, timestamps.
- Data/mono (order IDs, ETAs, calorie counts in Stage 3): **JetBrains Mono** or **IBM Plex Mono**, small size, used only for numbers that need a "ticket printout" feel.

**Layout concept**
- Asymmetric bento-style grids for restaurant/dish listings — not uniform 3-col cards. Mix a large featured card (2x size) with smaller cards in the same row.
- Rounded corners: 16–20px on cards, 8px on buttons/chips. Consistent radius scale, not per-component guessing.
- Generous negative space around food photography — let images breathe, don't crop tight.

**Signature element (the one thing this app is remembered for)**
- A subtle **animated steam wisp** (2–3 thin curved SVG paths, looping opacity/translate animation, 4–6s duration) rising from hero dish photography on the Home and Food Detail screens. This is the one "wow" motion moment — everything else stays quiet and disciplined. Do not add steam animation anywhere else; one signature, used sparingly, lands harder than five small effects.
- Order status (Stage 1 cart → confirmed) uses a "kitchen ticket" progress strip in the mono font rather than a generic progress bar.

**Interaction rules**
- Hover on cards: slight lift (`translateY(-4px)`) + shadow deepen, no color shift, no glow.
- Buttons: solid ember fill for primary, hairline-bordered ghost for secondary. No gradients on buttons.
- Respect `prefers-reduced-motion` — steam animation and card-lift both disable.
- Empty states (empty cart, no search results) get one line of plain-spoken copy + one action, in the interface's voice — never apologetic, never cute.

**Copy voice**
- Plain, active, specific. "Add to cart" not "Let's add this!". Errors state what happened and what to do, no exclamation marks, no emoji in system copy.

---

## STAGE 1 — Core App (Home, Cart, Restaurant, Food Details)

Single Antigravity prompt — screens, schema, and wiring all in one pass.

```
Build "Nosh," a premium food-delivery web app, in [React/Next.js — confirm your stack] + Supabase. My Supabase project credentials: URL = [your project URL], anon key = [your anon key]. This is a fresh empty project — create everything from scratch.

DESIGN: Follow the Nosh Design System exactly: [paste Design System block]. This must NOT look like a generic AI-generated SaaS template — no purple/indigo gradients, no glowing card borders, no default rounded-sans everywhere.

DATABASE (Supabase):
- Create tables: restaurants (id, name, cuisine_type, rating, delivery_time_mins, cover_image_url, is_veg_friendly), dishes (id, restaurant_id FK, name, description, price, image_url, is_veg, category, calories, protein_g, carbs_g, fat_g — populate the macro columns now even though they're only used in Stage 3), cart_items (id, user_id, dish_id, restaurant_id, quantity), orders (id, user_id, restaurant_id, items jsonb, total, status, created_at).
- Enable Supabase Auth (email/password).
- Seed 8-10 realistic fake restaurants across different cuisines (Indian, Italian, Chinese, Fast Food, Healthy, Desserts) with 6-8 dishes each, real-looking names, ₹ prices, plausible calorie/macro estimates, and placeholder image URLs (Unsplash source URLs are fine).

SCREENS (build all four, wired to live Supabase data from the start — no mock arrays):
1. HOME — Hero with search bar (cuisine/dish/restaurant), horizontal scroll of cuisine filter chips, asymmetric bento grid of restaurant cards (one large featured card, smaller cards around it), one signature animated steam-wisp SVG on the featured card only.
2. RESTAURANT PAGE — Header (cover image, name in display serif, rating, delivery time), dish list grouped by category, veg/non-veg dot indicator, "Add to Cart" that becomes a quantity stepper once added.
3. FOOD DETAILS — Large photo with the steam-wisp animation, dish name in display serif, description, price, quantity selector, free-text customization notes field, ember-accent "Add to Cart" CTA.
4. CART — Items grouped under the restaurant name ("Ordering from: [Restaurant]"), quantity edit/remove, subtotal + delivery fee + total, sticky "Place Order" button. Empty state: plain one-line copy + "Browse restaurants" button, no apology, no emoji.

AUTH: login/signup screens matching the design system, not default Supabase Auth styling.

Stub "Place Order" to write to the orders table and show a confirmation state — no real payment gateway, no real location/maps, no AI recommendations, no nutrition assistant yet, those are later stages.

Build mobile-first responsive. Confirm each screen renders correctly against live Supabase data before moving to Stage 2.
```

---

## STAGE 2 — AI Recommendation Engine + Single-Restaurant Cart Logic

**Priority order: cart-lock logic first, recommendations second.** The logic bug (ordering from two restaurants at once) is a correctness issue; recommendations are a nice-to-have layered on top.

### 2A — Single-Restaurant Cart Lock (the logic that matters most)

```
Add cart integrity logic to Nosh: a user's cart can only contain items from ONE restaurant at a time — this mirrors real Zomato/Swiggy behavior.

RULES:
1. `cart_items` table already has restaurant_id per row — enforce that all rows for a given user_id share the same restaurant_id.
2. Enforce this at TWO levels:
   a. Database level: add a Postgres trigger/function in Supabase that checks, before insert, whether the user already has cart_items from a different restaurant_id. If so, raise an exception (this is the source of truth — never trust client-only checks).
   b. Client level (UX): before calling the insert, check current cart state. If the new dish belongs to a different restaurant than what's already in the cart, show a confirmation modal: "Your cart has items from [Restaurant A]. Adding this item will clear your current cart. Replace cart?" with "Replace Cart" (clears old items, inserts new) and "Cancel" actions. Never silently mix restaurants.
3. On successful restaurant switch, clear old cart_items for that user before inserting the new one, in a single transaction (not two separate calls that could race).
4. Show the current cart's restaurant name persistently in the cart UI (e.g., "Ordering from: [Restaurant Name]") so this constraint is never a surprise.

Test explicitly: add item from Restaurant A → add item from Restaurant B → confirm modal appears → confirm "Replace" correctly clears A's items and keeps only B's.
```

### 2B — AI Recommendation Engine

```
Add a "Recommended for you" section to the Nosh Home screen, computed from:
1. Previous orders (frequency of restaurant_id and category ordered)
2. Time of day (breakfast/lunch/snack/dinner windows — infer from current client time, match against dish category tags)
3. Food category affinity (weight categories the user orders most)
4. Restaurant ratings (small positive weight, tie-breaker only — never let a low-relevance high-rated restaurant outrank a high-relevance one)

LOGIC (keep this transparent and debuggable, not a black-box call to an LLM for this stage):
- Compute a score per restaurant = (order_frequency_weight * 0.4) + (time_of_day_match * 0.3) + (category_affinity * 0.2) + (normalized_rating * 0.1).
- Implement this as a Supabase Edge Function (or a client-side utility function reading from `orders` table) that returns a ranked list of restaurant_ids for the logged-in user.
- New users with no order history: fall back to time-of-day + rating only, and label the section "Popular right now" instead of "Recommended for you" (don't fake personalization that doesn't exist yet).
- Show the recommendation reason as a small tag on the card, e.g. "Because you order breakfast around this time" or "Your usual pick" — this builds trust and is also easier to debug than a silent score.

Do not call an external LLM API for this scoring step — it's a deterministic weighted formula, cheaper and more predictable. Reserve LLM calls for Stage 3.
```

---

## STAGE 3 — AI Nutrition Assistant

```
Add a Nutrition Dashboard to the Food Details screen (and optionally a summary on the Cart screen for the whole order).

DATA: Add `calories`, `protein_g`, `carbs_g`, `fat_g` columns to the `dishes` table. For seeded dishes, populate these with realistic estimates (don't leave null — a real nutrition assistant needs real-looking numbers).

NUTRITION DASHBOARD (per dish, and aggregated per cart):
- Show Calories, Protein, Carbs (Fat optional) as a small stat row — auto-generated from the dish's stored values, not recalculated live unless quantity changes (then multiply by quantity).
- Use the mono font for the numbers, per the design system's "ticket printout" feel.

HEALTH INSIGHT (this is the one part that should call an LLM):
- When a user views a dish or their full cart, send the dish/cart nutrition data (not the whole menu) to Groq's API (OpenAI-compatible endpoint, `https://api.groq.com/openai/v1/chat/completions`, model `openai/gpt-oss-120b`) with a short system prompt: "You are a concise nutrition assistant for a food delivery app. Given this dish's macros, either (a) give one short health insight sentence, or (b) suggest one realistic swap available in the same restaurant's menu that reduces calories, in the format 'Swap [X] → [Y] to save ~[N] kcal.' Keep it to one sentence, no health scaremongering, no medical claims."
- Only suggest swaps to dishes that actually exist in that restaurant's menu — pass the restaurant's other dish names/macros into the prompt so the model doesn't invent a dish that isn't sold there.
- Display the response under "Health Insight" / "Better Alternative" cards matching the design system (dark card, ember accent on the swap CTA, no medical-looking icons — keep it food-app tone, not clinical).
- Cache the LLM response per dish (store in a `nutrition_insights` table keyed by dish_id) so you're not re-calling the API every page view — only regenerate if the dish's macros change. This matters more on Groq's free tier than it would otherwise, since free-tier requests are rate-limited per minute.

Explicitly out of scope for this stage: no calorie tracking over time, no user health profile/goals, no medical advice — this is a lightweight in-context nudge, not a diet app.
```

---

## STAGE 4 — AI Chat Assistant, Advanced Recommendations, Monthly Calorie Dashboard, Excel Report

Single Antigravity prompt — all four features, screens and logic together.

```
Continuing the Nosh project in this same Antigravity project. Add these four features:

1. AI CHAT ASSISTANT
Build a chat panel: message thread (user messages right-aligned in ember accent bubble, assistant messages left-aligned in a plain surface card), text input + send button pinned at bottom, a few suggested-prompt chips for first-time use (e.g. "What's healthy near me?", "Recommend something for dinner", "What did I order last week?"). Match the design system.

Wire it to Groq's API (`https://api.groq.com/openai/v1/chat/completions`, model `openai/gpt-oss-120b` — this model supports tool/function calling). On each user message, send: the message, the user's last 10 orders, and the restaurant catalog (names, categories, ratings only — not full menus, keep context small). Give the model these tools:
   - search_dishes(query, category, max_price) — queries Supabase, returns matching dishes
   - get_order_history(user_id) — returns past orders from Supabase
   - get_recommendations(user_id) — reuses the Stage 2B scoring logic
System prompt: "You are Nosh's food ordering assistant. Help the user find dishes, recommend restaurants based on their history, and answer questions about their past orders. Keep responses to 2-3 sentences, conversational, no bullet-point walls of text. If asked to place an order, confirm the dish and restaurant with the user before adding to cart — never add to cart without explicit confirmation." Parse Groq's tool_calls response format (OpenAI-compatible — same shape as OpenAI function calling) and execute the matching Supabase query, then send the tool result back in a follow-up message to get the final natural-language reply. Store the conversation per user_id in a `chat_messages` table so history persists across sessions. Handle Groq API errors (rate limit, timeout) gracefully — show "Assistant is busy, try again in a moment" rather than a raw error.

2. ADVANCED RECOMMENDATIONS
Extend the Stage 2B scoring formula with two additions, both plain SQL aggregations at request time — no ML libraries, no training step, no LLM call needed here:
   a. "Frequently ordered together" — when a user views a dish, query which other dishes appear in the same past orders across ALL users (basic co-occurrence count), show as a "Goes well with" row.
   b. "Trending this week" — restaurant/dish tag based on order count in the last 7 days across all users (COUNT + GROUP BY + date filter).
   Label each with its reason tag, same pattern as Stage 2B, so it stays debuggable.

3. MONTHLY CALORIE DASHBOARD
Build a screen: month selector at top, hero stat row (total calories, average per order, protein/carbs/fat split) in the mono font, a bar chart of calories per week, a list of the month's orders with per-order calorie totals, and a "Download Excel Report" button (ember accent, top-right). Wire it to a real aggregation query: SUM calories/protein/carbs/fat across the user's orders that month (join orders → dishes for macros × quantity), grouped by week for the chart. Handle the empty state (no orders that month) with plain copy, not an error.

4. EXCEL CALORIE REPORT
On "Download Excel Report," generate a real .xlsx client-side using the SheetJS (xlsx) library — columns: Date, Restaurant, Dish, Quantity, Calories, Protein (g), Carbs (g), Fat (g), plus a totals row. Reuse the same aggregation query as the dashboard rather than recomputing. Trigger a real browser download: "nosh-calorie-report-{month}-{year}.xlsx".

Test each feature against real Supabase data before considering Stage 4 done.
```

## STAGE 5 — Weekly Diet Planner, Budget Planner, Order Analytics, Nosh Wrapped

The fourth feature here, **Nosh Wrapped**, isn't on your original list — it's a "Spotify Wrapped"-style monthly recap card. It's worth adding for a specific reason: everything else in this app is a feature you use *inside* the app, but this one produces a shareable artifact — a downloadable image card summarizing the user's month (top cuisine, most-ordered dish, total spend, calorie total, a one-line "foodie personality" tag). That's the single most screenshot-friendly thing you can put in a demo or on LinkedIn, and it costs almost nothing to build since it's just Stage 4's aggregation query rendered as a styled card instead of a table.

Single Antigravity prompt — all four features:

```
Continuing the Nosh project. Add these four features:

1. WEEKLY DIET PLANNER
Add a "Plan my week" action, reachable from the Nutrition Dashboard. User sets a daily calorie target and picks dietary preference (veg / non-veg / no preference). Send this, plus the full seeded dish catalog (name, restaurant, category, calories, protein, carbs, fat, price), to Groq (`https://api.groq.com/openai/v1/chat/completions`, model `openai/gpt-oss-120b`) with the system prompt: "You are a meal-planning assistant for a food delivery app. Given a daily calorie target and the available dish catalog, build a 7-day plan (one dish per day) that stays within ±10% of the target and matches the stated dietary preference. Only choose dishes that exist in the provided catalog — never invent a dish. Return valid JSON: an array of 7 objects with day, dish_name, restaurant_name, calories." Parse the JSON response and render it as a 7-card weekly view matching the design system, each card showing day, dish, restaurant, calories, and a small "Order this" button that adds it directly to cart (respecting the Stage 2A single-restaurant cart lock — if the week's plan spans multiple restaurants, that's fine for viewing, but ordering triggers the same replace-cart confirmation if needed). Cache the generated plan per user per week in a `diet_plans` table so regenerating isn't required on every visit — add a "Regenerate" button for when the user wants a new plan.

2. BUDGET PLANNER
Add a "Budget Planner" screen: user inputs a total budget (₹) and optionally a group size (for splitting). Run a constraint query against the dishes table: return combinations of dishes (from ONE restaurant, respecting the cart-lock rule) that get as close to the budget as possible without exceeding it, maximizing either variety (different categories) or total calories, user's choice via a toggle. Implement this as a straightforward greedy or small knapsack-style algorithm in plain JS/TS on the backend — no LLM call needed, this is deterministic optimization, not judgment. Show 2-3 candidate combinations ranked by how close they land to the budget, each with a running total, and an "Order this combo" button that adds all items to cart at once.

3. ORDER ANALYTICS
Add an Analytics screen: total spend this month vs last month, a chart of order count by day-of-week (which days the user orders most), a breakdown of spend by cuisine category (pie or bar chart), and top 3 most-ordered dishes with counts. All computed via SQL aggregation on the `orders` table (GROUP BY category / day-of-week / dish, with date filtering) — no LLM involvement, this is pure data visualization using Recharts. Handle new users with little order history gracefully (show what exists, no fake placeholder data).

4. NOSH WRAPPED
Add a "Your Month in Food" card, generated from the same monthly aggregation used in the Calorie Dashboard and Order Analytics (reuse those queries, don't recompute): top cuisine, most-ordered dish, total orders, total spend, total calories. Render this as a single polished card (not a full dashboard page) matching the design system — dark ember-accented card, mono font for the numbers, a one-line personality tag generated by a single short Groq call (e.g. "The Weekend Warrior — 70% of your orders land on Sat/Sun"). Add a "Download as image" button using a client-side library like `html-to-image` or `dom-to-image` to export the card as a PNG the user can actually save and share. Cache the personality tag per user per month so it's not regenerated on every view.

Test each feature against real Supabase data before considering Stage 5 done.
```

## Platform note

Everything now runs through **Antigravity + Supabase**, no v0 handoff needed. Antigravity is free, agentic, has terminal + Supabase access, and exports real code to disk as it builds.

**One setup step for Groq**: get a free API key at console.groq.com (no credit card), and give it to Antigravity the same way you gave it your Supabase credentials — paste it at the start of the Stage 3 and Stage 4 prompts, e.g. "My Groq API key is [key], use it for all LLM calls in this stage." Keep it in an environment variable (`GROQ_API_KEY`), never hardcoded in a committed file — ask Antigravity to use `.env` and confirm `.env` is in `.gitignore` before you push anywhere.

Groq's free tier is generous but rate-limited per minute — the caching notes in Stage 3 (cache nutrition insights per dish) and Stage 4 (don't re-call on every keystroke) matter more here than they would on a paid tier.

If Antigravity itself hits a limit or outage mid-build, Bolt.new and Firebase Studio are the free fallbacks that also handle full backend + DB, not just UI.
