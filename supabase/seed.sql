-- Seed Data for Restaurants and Dishes

TRUNCATE TABLE public.dishes CASCADE;
TRUNCATE TABLE public.restaurants CASCADE;

INSERT INTO public.restaurants (id, name, cuisine_type, rating, delivery_time_mins, cover_image_url, is_veg_friendly, featured, description)
VALUES
  ('00000001-0000-0000-0000-000000000000', 'Ember & Oak', ARRAY['Modern', 'Comfort'], 4.8, '25-35', '/restaurants/ember-oak.png', true, true, 'Seasonal wood-fired cuisine'),
  ('00000002-0000-0000-0000-000000000000', 'Sage & Honey', ARRAY['Mediterranean', 'Vegetarian'], 4.6, '30-40', '/restaurants/sage-honey.png', true, false, 'Mediterranean comfort food'),
  ('00000003-0000-0000-0000-000000000000', 'The Root Kitchen', ARRAY['Organic', 'Salads'], 4.7, '35-45', '/restaurants/root-kitchen.png', true, false, 'Farm-to-table experience'),
  ('00000004-0000-0000-0000-000000000000', 'Copper & Coal', ARRAY['BBQ', 'American'], 4.9, '20-30', '/restaurants/copper-coal.png', true, false, 'Artisanal smoked meats'),
  ('00000005-0000-0000-0000-000000000000', 'Basil & Brown', ARRAY['Italian', 'Pasta'], 4.5, '25-35', '/restaurants/basil-brown.png', true, false, 'Italian trattoria classics'),
  ('00000006-0000-0000-0000-000000000000', 'Saffron Spice', ARRAY['Indian', 'Curry'], 4.7, '30-40', '/restaurants/saffron-spice.png', true, false, 'Traditional Indian cuisine'),
  ('00000007-0000-0000-0000-000000000000', 'Jade Garden', ARRAY['Asian', 'Fusion'], 4.6, '25-35', '/restaurants/jade-garden.png', true, false, 'Contemporary Asian fusion'),
  ('00000008-0000-0000-0000-000000000000', 'Golden Grain', ARRAY['Bakery', 'Café'], 4.4, '15-25', '/restaurants/golden-grain.png', true, false, 'Fresh artisan bakery & café'),
  ('00000009-0000-0000-0000-000000000000', 'Crimson Spoon', ARRAY['Spanish', 'Tapas'], 4.7, '25-35', '/restaurants/crimson-spoon.png', true, false, 'Modern Spanish tapas'),
  ('00000010-0000-0000-0000-000000000000', 'Pearl Grill', ARRAY['Seafood', 'Fine Dining'], 4.8, '30-40', '/restaurants/pearl-grill.png', true, false, 'Fine dining seafood');

INSERT INTO public.dishes (restaurant_id, name, description, price, image_url, is_veg, category)
VALUES
  ('00000001-0000-0000-0000-000000000000', 'Wood-Fired Bread', 'House-baked sourdough with seasonal spreads', 8, '/dishes/wood-fired-bread.png', true, 'Appetizers'),
  ('00000001-0000-0000-0000-000000000000', 'Charred Vegetables', 'Seasonal vegetables with herb oil', 12, '/dishes/charred-vegetables.png', true, 'Appetizers'),
  ('00000001-0000-0000-0000-000000000000', 'Smoked Salmon', 'Cedar-smoked salmon with roasted root vegetables', 28, '/dishes/smoked-salmon.png', false, 'Mains'),
  ('00000001-0000-0000-0000-000000000000', 'Prime Steak', 'Aged beef with charred mushrooms and herb butter', 34, '/dishes/prime-steak.png', false, 'Mains'),
  ('00000001-0000-0000-0000-000000000000', 'Chocolate Torte', 'Dark chocolate cake with raspberry coulis', 9, '/dishes/chocolate-torte.png', true, 'Desserts'),
  ('00000002-0000-0000-0000-000000000000', 'Mediterranean Sampler', 'Hummus, baba ganoush, dolmas, olives', 16, '/dishes/mediterranean-sampler.png', true, 'Mezze Platters'),
  ('00000002-0000-0000-0000-000000000000', 'Grilled Lamb Chops', 'Herb-marinated lamb with tzatziki', 26, '/dishes/grilled-lamb.png', false, 'Mains'),
  ('00000002-0000-0000-0000-000000000000', 'Greek Salad', 'Fresh feta, olives, tomatoes, cucumbers', 14, '/dishes/greek-salad.png', true, 'Mains'),
  ('00000003-0000-0000-0000-000000000000', 'Organic Greens', 'Farm fresh mixed greens with light vinaigrette', 11, '/dishes/organic-greens.png', true, 'Salads'),
  ('00000003-0000-0000-0000-000000000000', 'Roasted Beetroot Salad', 'Beetroot, goat cheese, walnuts, greens', 13, '/dishes/roasted-beetroot.png', true, 'Salads'),
  ('00000003-0000-0000-0000-000000000000', 'Grilled Salmon', 'Farm-fresh salmon with seasonal vegetables', 25, '/dishes/grilled-salmon.png', false, 'Mains'),
  ('00000004-0000-0000-0000-000000000000', 'Smoked Ribs', 'Fall-off-bone tender with signature glaze', 28, '/dishes/smoked-ribs.png', false, 'Smoked Meats'),
  ('00000004-0000-0000-0000-000000000000', 'Pulled Pork Sandwich', 'Tender pork with BBQ sauce on fresh bun', 16, '/dishes/pulled-pork.png', false, 'Smoked Meats'),
  ('00000004-0000-0000-0000-000000000000', 'Brisket Platter', 'Smoked brisket with beans and cornbread', 32, '/dishes/brisket-platter.png', false, 'Smoked Meats'),
  ('00000004-0000-0000-0000-000000000000', 'BBQ Burnt Ends', 'Caramelized brisket cubes with sticky glaze', 18, '/dishes/bbq-burnt-ends.png', false, 'Smoked Meats'),
  ('00000005-0000-0000-0000-000000000000', 'Spaghetti Carbonara', 'Classic creamy sauce with bacon and parmesan', 16, '/dishes/spaghetti-carbonara.png', false, 'Pasta'),
  ('00000005-0000-0000-0000-000000000000', 'Risotto Mushroom', 'Creamy arborio rice with porcini mushrooms', 18, '/dishes/risotto-mushroom.png', true, 'Pasta'),
  ('00000005-0000-0000-0000-000000000000', 'Lasagna', 'Homemade layers of pasta, meat sauce, cheese', 17, '/dishes/lasagna.png', false, 'Pasta'),
  ('00000005-0000-0000-0000-000000000000', 'Tiramisu', 'Traditional mascarpone dessert with coffee', 8, '/dishes/tiramisu.png', true, 'Desserts'),
  ('00000006-0000-0000-0000-000000000000', 'Butter Chicken', 'Creamy tomato sauce with tender chicken', 16, '/dishes/butter-chicken.png', false, 'Curries'),
  ('00000006-0000-0000-0000-000000000000', 'Palak Paneer', 'Spinach curry with soft paneer cheese', 14, '/dishes/palak-paneer.png', true, 'Curries'),
  ('00000006-0000-0000-0000-000000000000', 'Chicken Biryani', 'Fragrant rice with spiced chicken and layers', 18, '/dishes/biryani.png', false, 'Curries'),
  ('00000007-0000-0000-0000-000000000000', 'Pad Thai', 'Rice noodles with shrimp and peanuts', 14, '/dishes/pad-thai.png', false, 'Asian Specialties'),
  ('00000007-0000-0000-0000-000000000000', 'Tonkotsu Ramen', 'Rich pork broth with noodles and toppings', 15, '/dishes/ramen.png', false, 'Asian Specialties'),
  ('00000007-0000-0000-0000-000000000000', 'Sushi Platter', 'Assorted nigiri and rolls with fresh fish', 24, '/dishes/sushi-platter.png', false, 'Asian Specialties'),
  ('00000007-0000-0000-0000-000000000000', 'Orange Chicken', 'Crispy chicken with tangy citrus sauce', 16, '/dishes/orange-chicken.png', false, 'Asian Specialties'),
  ('00000008-0000-0000-0000-000000000000', 'Buttery Croissant', 'Flaky layers of artisan French pastry', 6, '/dishes/croissant.png', true, 'Pastries'),
  ('00000008-0000-0000-0000-000000000000', 'Avocado Toast', 'Fresh avocado on toasted artisan bread', 10, '/dishes/avocado-toast.png', true, 'Pastries'),
  ('00000008-0000-0000-0000-000000000000', 'Cappuccino', 'Espresso with steamed milk and latte art', 5, '/dishes/cappuccino.png', true, 'Beverages'),
  ('00000008-0000-0000-0000-000000000000', 'Matcha Latte', 'Frothy matcha green tea with steamed milk', 6, '/dishes/matcha-latte.png', true, 'Beverages'),
  ('00000008-0000-0000-0000-000000000000', 'Brownies', 'Fudgy fresh-baked chocolate brownies', 5, '/dishes/brownies.png', true, 'Desserts'),
  ('00000008-0000-0000-0000-000000000000', 'Berry Tart', 'Fresh mixed berries in pastry cream', 7, '/dishes/berry-tart.png', true, 'Desserts'),
  ('00000009-0000-0000-0000-000000000000', 'Spanish Tapas Platter', 'Jamon, croquetas, patatas bravas, olives', 22, '/dishes/spanish-tapas.png', false, 'Tapas'),
  ('00000009-0000-0000-0000-000000000000', 'Patatas Bravas', 'Crispy potatoes with spicy sauce and aioli', 8, '/dishes/patatas-bravas.png', true, 'Tapas'),
  ('00000009-0000-0000-0000-000000000000', 'Spanish Ham Croquetas', 'Golden crispy croquetas with creamy filling', 10, '/dishes/croquettes.png', false, 'Tapas'),
  ('00000009-0000-0000-0000-000000000000', 'Garlic Shrimp', 'Sautéed shrimp in garlic oil with paprika', 14, '/dishes/shrimp-garlic.png', false, 'Tapas'),
  ('00000009-0000-0000-0000-000000000000', 'Spanish Flan', 'Smooth custard with caramel sauce', 7, '/dishes/flan.png', true, 'Desserts'),
  ('00000010-0000-0000-0000-000000000000', 'Lobster Tail', 'Grilled with butter sauce and lemon', 42, '/dishes/lobster-tail.png', false, 'Seafood'),
  ('00000010-0000-0000-0000-000000000000', 'Fresh Clams', 'White wine sauce with garlic and parsley', 28, '/dishes/clams.png', false, 'Seafood'),
  ('00000010-0000-0000-0000-000000000000', 'Seafood Platter', 'Oysters, shrimp, crab, mussels on ice', 48, '/dishes/seafood-platter.png', false, 'Seafood'),
  ('00000010-0000-0000-0000-000000000000', 'Grilled Salmon', 'Atlantic salmon with lemon butter sauce', 32, '/dishes/grilled-salmon.png', false, 'Seafood');
