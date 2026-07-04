-- 1. Create a function to check cart restaurant consistency
CREATE OR REPLACE FUNCTION check_cart_restaurant()
RETURNS TRIGGER AS $$
DECLARE
  existing_restaurant_id UUID;
BEGIN
  -- Find the restaurant_id of an existing item in the user's cart (if any)
  SELECT restaurant_id INTO existing_restaurant_id
  FROM public.cart_items
  WHERE user_id = NEW.user_id
  LIMIT 1;

  -- If there is an existing item and its restaurant_id doesn't match the new one, raise exception
  IF existing_restaurant_id IS NOT NULL AND existing_restaurant_id != NEW.restaurant_id THEN
    RAISE EXCEPTION 'Cart can only contain items from one restaurant at a time. Existing: %, New: %', existing_restaurant_id, NEW.restaurant_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach the trigger to the cart_items table
DROP TRIGGER IF EXISTS enforce_single_restaurant_cart ON public.cart_items;
CREATE TRIGGER enforce_single_restaurant_cart
BEFORE INSERT ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION check_cart_restaurant();

-- 3. Create an RPC function to atomically replace the cart
CREATE OR REPLACE FUNCTION replace_cart(
  p_user_id UUID,
  p_dish_id UUID,
  p_restaurant_id UUID,
  p_quantity INTEGER
) RETURNS void AS $$
BEGIN
  -- First, delete all existing cart items for this user
  DELETE FROM public.cart_items WHERE user_id = p_user_id;
  
  -- Then, insert the new item (the trigger will pass since the cart is now empty)
  INSERT INTO public.cart_items (user_id, dish_id, restaurant_id, quantity)
  VALUES (p_user_id, p_dish_id, p_restaurant_id, p_quantity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
