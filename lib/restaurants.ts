export interface Restaurant {
  id: string
  name: string
  description: string
  image: string
  rating: number
  reviews: number
  deliveryTime: string
  cuisines: string[]
  featured?: boolean
}

export const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Ember & Oak',
    description: 'Seasonal wood-fired cuisine',
    image: '/restaurants/ember-oak.png',
    rating: 4.8,
    reviews: 342,
    deliveryTime: '25-35 min',
    cuisines: ['Modern', 'Comfort'],
    featured: true,
  },
  {
    id: '2',
    name: 'Sage & Honey',
    description: 'Mediterranean comfort food',
    image: '/restaurants/sage-honey.png',
    rating: 4.6,
    reviews: 287,
    deliveryTime: '30-40 min',
    cuisines: ['Mediterranean', 'Vegetarian'],
  },
  {
    id: '3',
    name: 'The Root Kitchen',
    description: 'Farm-to-table experience',
    image: '/restaurants/root-kitchen.png',
    rating: 4.7,
    reviews: 256,
    deliveryTime: '35-45 min',
    cuisines: ['Organic', 'Salads'],
  },
  {
    id: '4',
    name: 'Copper & Coal',
    description: 'Artisanal smoked meats',
    image: '/restaurants/copper-coal.png',
    rating: 4.9,
    reviews: 412,
    deliveryTime: '20-30 min',
    cuisines: ['BBQ', 'American'],
  },
  {
    id: '5',
    name: 'Basil & Brown',
    description: 'Italian trattoria classics',
    image: '/restaurants/basil-brown.png',
    rating: 4.5,
    reviews: 198,
    deliveryTime: '25-35 min',
    cuisines: ['Italian', 'Pasta'],
  },
  {
    id: '6',
    name: 'Saffron Spice',
    description: 'Traditional Indian cuisine',
    image: '/restaurants/saffron-spice.png',
    rating: 4.7,
    reviews: 325,
    deliveryTime: '30-40 min',
    cuisines: ['Indian', 'Curry'],
  },
  {
    id: '7',
    name: 'Jade Garden',
    description: 'Contemporary Asian fusion',
    image: '/restaurants/jade-garden.png',
    rating: 4.6,
    reviews: 267,
    deliveryTime: '25-35 min',
    cuisines: ['Asian', 'Fusion'],
  },
  {
    id: '8',
    name: 'Golden Grain',
    description: 'Fresh artisan bakery & café',
    image: '/restaurants/golden-grain.png',
    rating: 4.4,
    reviews: 156,
    deliveryTime: '15-25 min',
    cuisines: ['Bakery', 'Café'],
  },
  {
    id: '9',
    name: 'Crimson Spoon',
    description: 'Modern Spanish tapas',
    image: '/restaurants/crimson-spoon.png',
    rating: 4.7,
    reviews: 289,
    deliveryTime: '25-35 min',
    cuisines: ['Spanish', 'Tapas'],
  },
  {
    id: '10',
    name: 'Pearl Grill',
    description: 'Fine dining seafood',
    image: '/restaurants/pearl-grill.png',
    rating: 4.8,
    reviews: 356,
    deliveryTime: '30-40 min',
    cuisines: ['Seafood', 'Fine Dining'],
  },
]

export const cuisineCategories = [
  'All',
  'Modern',
  'Mediterranean',
  'Organic',
  'BBQ',
  'Italian',
  'Indian',
  'Asian',
  'Spanish',
  'Seafood',
  'Bakery',
  'Tapas',
  'Fine Dining',
]
