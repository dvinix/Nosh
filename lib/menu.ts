export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  dietary?: string[]
  calories?: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
}

export interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

export const mockMenus: Record<string, MenuCategory[]> = {
  '1': [ // Ember & Oak
    {
      id: 'cat-1',
      name: 'Appetizers',
      items: [
        {
          id: 'item-1',
          name: 'Wood-Fired Bread',
          description: 'House-baked sourdough with seasonal spreads',
          price: 8,
          image: '/dishes/wood-fired-bread.png',
          category: 'appetizer',
          dietary: ['vegetarian'],
        },
        {
          id: 'item-2',
          name: 'Charred Vegetables',
          description: 'Seasonal vegetables with herb oil',
          price: 12,
          image: '/dishes/charred-vegetables.png',
          category: 'appetizer',
          dietary: ['vegan'],
        },
      ],
    },
    {
      id: 'cat-2',
      name: 'Mains',
      items: [
        {
          id: 'item-3',
          name: 'Smoked Salmon',
          description: 'Cedar-smoked salmon with roasted root vegetables',
          price: 28,
          image: '/dishes/smoked-salmon.png',
          category: 'main',
          dietary: ['gluten-free'],
        },
        {
          id: 'item-4',
          name: 'Prime Steak',
          description: 'Aged beef with charred mushrooms and herb butter',
          price: 34,
          image: '/dishes/prime-steak.png',
          category: 'main',
        },
      ],
    },
    {
      id: 'cat-3',
      name: 'Desserts',
      items: [
        {
          id: 'item-5',
          name: 'Chocolate Torte',
          description: 'Dark chocolate cake with raspberry coulis',
          price: 9,
          image: '/dishes/chocolate-torte.png',
          category: 'dessert',
          dietary: ['vegetarian'],
        },
      ],
    },
  ],
  '2': [ // Sage & Honey
    {
      id: 'cat-1',
      name: 'Mezze Platters',
      items: [
        {
          id: 'item-1',
          name: 'Mediterranean Sampler',
          description: 'Hummus, baba ganoush, dolmas, olives',
          price: 16,
          image: '/dishes/mediterranean-sampler.png',
          category: 'appetizer',
          dietary: ['vegan'],
        },
      ],
    },
    {
      id: 'cat-2',
      name: 'Mains',
      items: [
        {
          id: 'item-2',
          name: 'Grilled Lamb Chops',
          description: 'Herb-marinated lamb with tzatziki',
          price: 26,
          image: '/dishes/grilled-lamb.png',
          category: 'main',
        },
        {
          id: 'item-3',
          name: 'Greek Salad',
          description: 'Fresh feta, olives, tomatoes, cucumbers',
          price: 14,
          image: '/dishes/greek-salad.png',
          category: 'main',
          dietary: ['vegetarian', 'gluten-free'],
        },
      ],
    },
  ],
  '3': [ // The Root Kitchen
    {
      id: 'cat-1',
      name: 'Salads',
      items: [
        {
          id: 'item-1',
          name: 'Organic Greens',
          description: 'Farm fresh mixed greens with light vinaigrette',
          price: 11,
          image: '/dishes/organic-greens.png',
          category: 'appetizer',
          dietary: ['vegan', 'gluten-free'],
        },
        {
          id: 'item-2',
          name: 'Roasted Beetroot Salad',
          description: 'Beetroot, goat cheese, walnuts, greens',
          price: 13,
          image: '/dishes/roasted-beetroot.png',
          category: 'appetizer',
          dietary: ['vegetarian', 'gluten-free'],
        },
      ],
    },
    {
      id: 'cat-2',
      name: 'Mains',
      items: [
        {
          id: 'item-3',
          name: 'Grilled Salmon',
          description: 'Farm-fresh salmon with seasonal vegetables',
          price: 25,
          image: '/dishes/grilled-salmon.png',
          category: 'main',
          dietary: ['gluten-free'],
        },
      ],
    },
  ],
  '4': [ // Copper & Coal
    {
      id: 'cat-1',
      name: 'Smoked Meats',
      items: [
        {
          id: 'item-1',
          name: 'Smoked Ribs',
          description: 'Fall-off-bone tender with signature glaze',
          price: 28,
          image: '/dishes/smoked-ribs.png',
          category: 'main',
        },
        {
          id: 'item-2',
          name: 'Pulled Pork Sandwich',
          description: 'Tender pork with BBQ sauce on fresh bun',
          price: 16,
          image: '/dishes/pulled-pork.png',
          category: 'main',
        },
        {
          id: 'item-3',
          name: 'Brisket Platter',
          description: 'Smoked brisket with beans and cornbread',
          price: 32,
          image: '/dishes/brisket-platter.png',
          category: 'main',
        },
        {
          id: 'item-4',
          name: 'BBQ Burnt Ends',
          description: 'Caramelized brisket cubes with sticky glaze',
          price: 18,
          image: '/dishes/bbq-burnt-ends.png',
          category: 'appetizer',
        },
      ],
    },
  ],
  '5': [ // Basil & Brown
    {
      id: 'cat-1',
      name: 'Pasta',
      items: [
        {
          id: 'item-1',
          name: 'Spaghetti Carbonara',
          description: 'Classic creamy sauce with bacon and parmesan',
          price: 16,
          image: '/dishes/spaghetti-carbonara.png',
          category: 'main',
        },
        {
          id: 'item-2',
          name: 'Risotto Mushroom',
          description: 'Creamy arborio rice with porcini mushrooms',
          price: 18,
          image: '/dishes/risotto-mushroom.png',
          category: 'main',
          dietary: ['vegetarian'],
        },
        {
          id: 'item-3',
          name: 'Lasagna',
          description: 'Homemade layers of pasta, meat sauce, cheese',
          price: 17,
          image: '/dishes/lasagna.png',
          category: 'main',
        },
      ],
    },
    {
      id: 'cat-2',
      name: 'Desserts',
      items: [
        {
          id: 'item-4',
          name: 'Tiramisu',
          description: 'Traditional mascarpone dessert with coffee',
          price: 8,
          image: '/dishes/tiramisu.png',
          category: 'dessert',
          dietary: ['vegetarian'],
        },
      ],
    },
  ],
  '6': [ // Saffron Spice
    {
      id: 'cat-1',
      name: 'Curries',
      items: [
        {
          id: 'item-1',
          name: 'Butter Chicken',
          description: 'Creamy tomato sauce with tender chicken',
          price: 16,
          image: '/dishes/butter-chicken.png',
          category: 'main',
        },
        {
          id: 'item-2',
          name: 'Palak Paneer',
          description: 'Spinach curry with soft paneer cheese',
          price: 14,
          image: '/dishes/palak-paneer.png',
          category: 'main',
          dietary: ['vegetarian', 'gluten-free'],
        },
        {
          id: 'item-3',
          name: 'Chicken Biryani',
          description: 'Fragrant rice with spiced chicken and layers',
          price: 18,
          image: '/dishes/biryani.png',
          category: 'main',
        },
      ],
    },
  ],
  '7': [ // Jade Garden
    {
      id: 'cat-1',
      name: 'Asian Specialties',
      items: [
        {
          id: 'item-1',
          name: 'Pad Thai',
          description: 'Rice noodles with shrimp and peanuts',
          price: 14,
          image: '/dishes/pad-thai.png',
          category: 'main',
        },
        {
          id: 'item-2',
          name: 'Tonkotsu Ramen',
          description: 'Rich pork broth with noodles and toppings',
          price: 15,
          image: '/dishes/ramen.png',
          category: 'main',
        },
        {
          id: 'item-3',
          name: 'Sushi Platter',
          description: 'Assorted nigiri and rolls with fresh fish',
          price: 24,
          image: '/dishes/sushi-platter.png',
          category: 'main',
        },
        {
          id: 'item-4',
          name: 'Orange Chicken',
          description: 'Crispy chicken with tangy citrus sauce',
          price: 16,
          image: '/dishes/orange-chicken.png',
          category: 'main',
        },
      ],
    },
  ],
  '8': [ // Golden Grain
    {
      id: 'cat-1',
      name: 'Pastries',
      items: [
        {
          id: 'item-1',
          name: 'Buttery Croissant',
          description: 'Flaky layers of artisan French pastry',
          price: 6,
          image: '/dishes/croissant.png',
          category: 'appetizer',
          dietary: ['vegetarian'],
        },
        {
          id: 'item-2',
          name: 'Avocado Toast',
          description: 'Fresh avocado on toasted artisan bread',
          price: 10,
          image: '/dishes/avocado-toast.png',
          category: 'main',
          dietary: ['vegan', 'gluten-free'],
        },
      ],
    },
    {
      id: 'cat-2',
      name: 'Beverages',
      items: [
        {
          id: 'item-3',
          name: 'Cappuccino',
          description: 'Espresso with steamed milk and latte art',
          price: 5,
          image: '/dishes/cappuccino.png',
          category: 'beverage',
          dietary: ['vegetarian'],
        },
        {
          id: 'item-4',
          name: 'Matcha Latte',
          description: 'Frothy matcha green tea with steamed milk',
          price: 6,
          image: '/dishes/matcha-latte.png',
          category: 'beverage',
          dietary: ['vegan'],
        },
      ],
    },
    {
      id: 'cat-3',
      name: 'Desserts',
      items: [
        {
          id: 'item-5',
          name: 'Brownies',
          description: 'Fudgy fresh-baked chocolate brownies',
          price: 5,
          image: '/dishes/brownies.png',
          category: 'dessert',
          dietary: ['vegetarian'],
        },
        {
          id: 'item-6',
          name: 'Berry Tart',
          description: 'Fresh mixed berries in pastry cream',
          price: 7,
          image: '/dishes/berry-tart.png',
          category: 'dessert',
          dietary: ['vegetarian'],
        },
      ],
    },
  ],
  '9': [ // Crimson Spoon
    {
      id: 'cat-1',
      name: 'Tapas',
      items: [
        {
          id: 'item-1',
          name: 'Spanish Tapas Platter',
          description: 'Jamon, croquetas, patatas bravas, olives',
          price: 22,
          image: '/dishes/spanish-tapas.png',
          category: 'appetizer',
        },
        {
          id: 'item-2',
          name: 'Patatas Bravas',
          description: 'Crispy potatoes with spicy sauce and aioli',
          price: 8,
          image: '/dishes/patatas-bravas.png',
          category: 'appetizer',
          dietary: ['vegan'],
        },
        {
          id: 'item-3',
          name: 'Spanish Ham Croquetas',
          description: 'Golden crispy croquetas with creamy filling',
          price: 10,
          image: '/dishes/croquettes.png',
          category: 'appetizer',
        },
        {
          id: 'item-4',
          name: 'Garlic Shrimp',
          description: 'Sautéed shrimp in garlic oil with paprika',
          price: 14,
          image: '/dishes/shrimp-garlic.png',
          category: 'main',
        },
      ],
    },
    {
      id: 'cat-2',
      name: 'Desserts',
      items: [
        {
          id: 'item-5',
          name: 'Spanish Flan',
          description: 'Smooth custard with caramel sauce',
          price: 7,
          image: '/dishes/flan.png',
          category: 'dessert',
          dietary: ['vegetarian'],
        },
      ],
    },
  ],
  '10': [ // Pearl Grill
    {
      id: 'cat-1',
      name: 'Seafood',
      items: [
        {
          id: 'item-1',
          name: 'Lobster Tail',
          description: 'Grilled with butter sauce and lemon',
          price: 42,
          image: '/dishes/lobster-tail.png',
          category: 'main',
          dietary: ['gluten-free'],
        },
        {
          id: 'item-2',
          name: 'Fresh Clams',
          description: 'White wine sauce with garlic and parsley',
          price: 28,
          image: '/dishes/clams.png',
          category: 'main',
        },
        {
          id: 'item-3',
          name: 'Seafood Platter',
          description: 'Oysters, shrimp, crab, mussels on ice',
          price: 48,
          image: '/dishes/seafood-platter.png',
          category: 'main',
          dietary: ['gluten-free'],
        },
        {
          id: 'item-4',
          name: 'Grilled Salmon',
          description: 'Atlantic salmon with lemon butter sauce',
          price: 32,
          image: '/dishes/grilled-salmon.png',
          category: 'main',
          dietary: ['gluten-free'],
        },
      ],
    },
  ],
}
