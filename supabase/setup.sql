-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Restaurants Table
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cuisine_type TEXT[] NOT NULL,
    rating NUMERIC(3, 1) DEFAULT 0,
    delivery_time_mins TEXT,
    cover_image_url TEXT,
    is_veg_friendly BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    description TEXT
);

-- Dishes Table
CREATE TABLE IF NOT EXISTS public.dishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    is_veg BOOLEAN DEFAULT false,
    category TEXT
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    dish_id UUID REFERENCES public.dishes(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Row Level Security (RLS)

-- Enable RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Restaurants Policies
CREATE POLICY "Restaurants are viewable by everyone" ON public.restaurants
    FOR SELECT USING (true);

-- Dishes Policies
CREATE POLICY "Dishes are viewable by everyone" ON public.dishes
    FOR SELECT USING (true);

-- Cart Items Policies
CREATE POLICY "Users can view their own cart items" ON public.cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON public.cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON public.cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON public.cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Orders Policies
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed Data

INSERT INTO public.restaurants (id, name, cuisine_type, rating, delivery_time_mins, cover_image_url, is_veg_friendly, featured, description)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Ember & Oak', ARRAY['Modern', 'Comfort'], 4.8, '25-35', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', true, true, 'Seasonal wood-fired cuisine'),
    ('22222222-2222-2222-2222-222222222222', 'Sage & Honey', ARRAY['Mediterranean', 'Vegetarian'], 4.6, '30-40', 'https://images.unsplash.com/photo-1555939594-58d7cb561f1d?w=400&h=300&fit=crop', true, false, 'Mediterranean comfort food'),
    ('33333333-3333-3333-3333-333333333333', 'The Root Kitchen', ARRAY['Organic', 'Salads'], 4.7, '35-45', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop', true, false, 'Farm-to-table experience'),
    ('44444444-4444-4444-4444-444444444444', 'Copper & Coal', ARRAY['BBQ', 'American'], 4.9, '20-30', 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop', false, false, 'Artisanal smoked meats'),
    ('55555555-5555-5555-5555-555555555555', 'Saffron Spice', ARRAY['Indian', 'Curry'], 4.7, '30-40', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop', true, false, 'Traditional Indian cuisine')
ON CONFLICT DO NOTHING;

INSERT INTO public.dishes (restaurant_id, name, description, price, image_url, is_veg, category)
VALUES 
    -- Ember & Oak Dishes
    ('11111111-1111-1111-1111-111111111111', 'Wood-Fired Ribeye', '12oz ribeye with roasted garlic butter', 34.00, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop', false, 'Mains'),
    ('11111111-1111-1111-1111-111111111111', 'Charred Asparagus', 'Lemon zest, parmesan, olive oil', 12.00, 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=400&h=300&fit=crop', true, 'Sides'),
    ('11111111-1111-1111-1111-111111111111', 'Smoked Salmon Bruschetta', 'Dill cream cheese, capers, red onion', 16.00, 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=400&h=300&fit=crop', false, 'Starters'),
    -- Sage & Honey Dishes
    ('22222222-2222-2222-2222-222222222222', 'Mediterranean Mezze Platter', 'Hummus, baba ganoush, falafel, pita', 22.00, 'https://images.unsplash.com/photo-1529312266912-b33cfce2eefd?w=400&h=300&fit=crop', true, 'Starters'),
    ('22222222-2222-2222-2222-222222222222', 'Grilled Halloumi Salad', 'Mixed greens, pomegranate, balsamic', 18.00, 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop', true, 'Mains'),
    ('22222222-2222-2222-2222-222222222222', 'Lamb Moussaka', 'Traditional baked dish with eggplant', 24.00, 'https://images.unsplash.com/photo-1608316187768-472096e1b643?w=400&h=300&fit=crop', false, 'Mains'),
    -- Saffron Spice Dishes
    ('55555555-5555-5555-5555-555555555555', 'Butter Chicken', 'Tender chicken in creamy tomato sauce', 18.00, 'https://images.unsplash.com/photo-1603894584373-5ac82b6ae398?w=400&h=300&fit=crop', false, 'Mains'),
    ('55555555-5555-5555-5555-555555555555', 'Palak Paneer', 'Cottage cheese in spiced spinach gravy', 16.00, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop', true, 'Mains'),
    ('55555555-5555-5555-5555-555555555555', 'Garlic Naan', 'Freshly baked flatbread with garlic', 4.00, 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=400&h=300&fit=crop', true, 'Sides');
