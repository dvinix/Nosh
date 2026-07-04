import fs from 'fs'
import { mockRestaurants } from './lib/restaurants'
import { mockMenus } from './lib/menu'

const generateSql = () => {
  let sql = `-- Seed Data for Restaurants and Dishes\n\n`
  
  // Clean tables first
  sql += `TRUNCATE TABLE public.dishes CASCADE;\n`
  sql += `TRUNCATE TABLE public.restaurants CASCADE;\n\n`

  sql += `INSERT INTO public.restaurants (id, name, cuisine_type, rating, delivery_time_mins, cover_image_url, is_veg_friendly, featured, description)\nVALUES\n`
  
  const uuidMap = new Map()

  const restaurantRows = mockRestaurants.map((r, index) => {
    // Generate deterministic UUID based on index for simplicity
    const uuid = `${String(index + 1).padStart(8, '0')}-0000-0000-0000-000000000000`
    uuidMap.set(r.id, uuid)
    
    const cuisines = r.cuisines ? `ARRAY['${r.cuisines.join("', '")}']` : "ARRAY[]::text[]"
    const featured = r.featured ? 'true' : 'false'
    return `  ('${uuid}', '${r.name.replace(/'/g, "''")}', ${cuisines}, ${r.rating}, '${r.deliveryTime.replace(' min', '')}', '${r.image}', true, ${featured}, '${r.description.replace(/'/g, "''")}')`
  })

  sql += restaurantRows.join(',\n') + ';\n\n'

  sql += `INSERT INTO public.dishes (restaurant_id, name, description, price, image_url, is_veg, category)\nVALUES\n`

  const dishRows: string[] = []

  Object.entries(mockMenus).forEach(([restId, categories]) => {
    const restaurantUuid = uuidMap.get(restId)
    if (!restaurantUuid) return

    categories.forEach(category => {
      category.items.forEach(item => {
        const isVeg = item.dietary && (item.dietary.includes('vegetarian') || item.dietary.includes('vegan')) ? 'true' : 'false'
        dishRows.push(`  ('${restaurantUuid}', '${item.name.replace(/'/g, "''")}', '${item.description.replace(/'/g, "''")}', ${item.price}, '${item.image}', ${isVeg}, '${category.name.replace(/'/g, "''")}')`)
      })
    })
  })

  sql += dishRows.join(',\n') + ';\n'

  fs.writeFileSync('./supabase/seed.sql', sql)
  console.log('Successfully generated supabase/seed.sql')
}

generateSql()
