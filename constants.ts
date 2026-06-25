
import { MandiPriceList, Village, InfieldProduct, GovernmentScheme, Agent, User, Product, Shop, InfieldItem, BulkCrop, BulkFarmerOffer, RentalVehicle, RentalProvider } from './types';

export const ADMIN_CREDENTIALS = {
  email: "admin@krishimart",
  password: "Admin@123"
};

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Ramesh Singh',
    email: 'ramesh@farmer.com',
    password: 'password',
    role: 'farmer',
    isVerified: true,
    village: 'Rampur',
    trustScore: 4.8,
    totalOrders: 15,
    landSizeAcres: 2.5,
    location: { lat: 26.8467, lng: 80.9462, country: 'India', state: 'Uttar Pradesh', district: 'Lucknow', village: 'Rampur' }
  },
  {
    id: 'u2',
    name: 'Anita Desai',
    email: 'anita@consumer.com',
    password: 'password',
    role: 'consumer',
    isVerified: true,
    village: 'City Center',
    trustScore: 5.0,
    totalOrders: 42,
    location: { lat: 26.8500, lng: 80.9500, country: 'India', state: 'Uttar Pradesh', district: 'Lucknow', village: 'City Center' }
  }
];

export const MANDI_PRICES: MandiPriceList = {
  'Potato': 25,
  'Onion': 40,
  'Tomato': 30,
  'Rice': 60,
  'Wheat': 35,
};

// Added missing exports for component use
export const AVAILABLE_PRODUCTS = ['Potato', 'Onion', 'Tomato', 'Rice', 'Wheat'];

export const PRODUCT_IMAGES: Record<string, string> = {
  'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&w=800&q=80',
  'Onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa829?auto=format&fit=crop&w=800&q=80',
  'Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
  'Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
};

export const VILLAGE_DISTANCES: Record<Village, number> = {
  'Rampur': 15,
  'Sonpur': 10,
  'Kishanpur': 25,
  'City Center': 0
};

export const AVAILABLE_VILLAGES: Village[] = [
  'Rampur', 'Sonpur', 'Kishanpur', 'City Center'
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    productName: 'Organic Red Potatoes',
    category: 'Vegetables',
    description: 'Freshly harvested from the fertile plains of Rampur. No chemical pesticides used. Perfect for roasting and mashing.',
    pricePerKg: 18,
    unit: 'kg',
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508747703725-71977713d540?auto=format&fit=crop&w=800&q=80'
    ],
    farmerName: 'Ramesh Singh',
    seller: { 
      id: 'u1', 
      name: 'Ramesh Singh', 
      type: 'farmer', 
      rating: 4.8, 
      totalReviews: 24,
      subRatings: { quality: 4.9, delivery: 4.7, communication: 4.8 },
      address: 'Plot 4, Near Panchayat Bhavan, Rampur'
    },
    villageName: 'Rampur',
    location: { lat: 26.8467, lng: 80.9462, village: 'Rampur', district: 'Lucknow', state: 'UP', country: 'India' },
    quantityAvailable: 500,
    harvestDate: '2023-11-01',
    contactNumber: '9876543210',
    status: 'approved',
    seasonTag: 'Standard',
    reviews: [
      { id: 'r1', reviewerName: 'Anita Desai', rating: 5, comment: 'Excellent quality, very fresh!', reviewDate: '2023-11-05' },
      { id: 'r2', reviewerName: 'John Doe', rating: 4, comment: 'Good potatoes, but size varies.', reviewDate: '2023-11-06' }
    ],
    similarProductIds: ['3']
  },
  {
    id: '2',
    productName: 'Hybrid Cherry Tomatoes',
    category: 'Vegetables',
    description: 'Sweet and juicy cherry tomatoes grown in controlled greenhouse conditions at Sonpur.',
    pricePerKg: 28,
    unit: 'kg',
    images: [
      'https://images.unsplash.com/photo-1546473422-e92d73fe1355?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'
    ],
    farmerName: 'Suresh Yadav',
    seller: { 
      id: 'u20', 
      name: 'Suresh Yadav', 
      type: 'farmer', 
      rating: 4.2, 
      totalReviews: 12,
      subRatings: { quality: 4.5, delivery: 3.8, communication: 4.3 }
    },
    villageName: 'Sonpur',
    location: { lat: 26.8000, lng: 80.9000, village: 'Sonpur', district: 'Lucknow', state: 'UP', country: 'India' },
    quantityAvailable: 30,
    harvestDate: '2023-10-26',
    contactNumber: '9123456789',
    status: 'approved',
    seasonTag: 'High Demand',
    reviews: [],
    similarProductIds: ['1']
  },
  {
    id: '3',
    productName: 'White Onions (Big Size)',
    category: 'Vegetables',
    description: 'Bulk supply of high-grade white onions. Sharp flavor, ideal for commercial use.',
    pricePerKg: 150, 
    unit: 'bag',
    images: [
      'https://images.unsplash.com/photo-1580149405513-1f2e33f6cb58?auto=format&fit=crop&w=800&q=80'
    ],
    farmerName: 'Mahesh Kumar',
    seller: { 
      id: 'u30', 
      name: 'Mahesh Kumar', 
      type: 'farmer', 
      rating: 3.9, 
      totalReviews: 5,
      subRatings: { quality: 4.0, delivery: 3.5, communication: 4.2 }
    },
    villageName: 'Kishanpur',
    location: { lat: 26.7000, lng: 80.8000, village: 'Kishanpur', district: 'Lucknow', state: 'UP', country: 'India' },
    quantityAvailable: 100,
    harvestDate: '2023-10-28',
    contactNumber: '9988776655',
    status: 'pending',
    seasonTag: 'High Demand',
    reviews: [],
    similarProductIds: ['1']
  }
];

// --- OUTFIELD BULK MOCK DATA ---
export const MOCK_BULK_CROPS: BulkCrop[] = [
  { id: 'bc1', name: 'Potato (Kufri)', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&w=400&q=80', averagePriceRange: '₹12 - ₹15' },
  { id: 'bc2', name: 'Basmati Rice', category: 'Grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80', averagePriceRange: '₹45 - ₹60' },
  { id: 'bc3', name: 'Wheat (Sharbati)', category: 'Grains', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80', averagePriceRange: '₹22 - ₹28' },
  { id: 'bc4', name: 'Red Onion', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa829?auto=format&fit=crop&w=400&q=80', averagePriceRange: '₹18 - ₹25' }
];

export const MOCK_BULK_OFFERS: BulkFarmerOffer[] = [
  { 
    id: 'bo1', farmerId: 'u1', farmerName: 'Ramesh Singh', cropId: 'bc1', 
    pricePerKg: 13, minQuantity: 500, rating: 4.8, 
    contactNumber: '9876543210', whatsappAvailable: true, available: true,
    location: { lat: 26.8467, lng: 80.9462, village: 'Rampur', district: 'Lucknow', state: 'UP', country: 'India' }
  },
  { 
    id: 'bo2', farmerId: 'u20', farmerName: 'Suresh Yadav', cropId: 'bc1', 
    pricePerKg: 12.5, minQuantity: 1000, rating: 4.2, 
    contactNumber: '9123456789', whatsappAvailable: false, available: true,
    location: { lat: 26.8000, lng: 80.9000, village: 'Sonpur', district: 'Lucknow', state: 'UP', country: 'India' }
  },
  { 
    id: 'bo3', farmerId: 'u30', farmerName: 'Mahesh Kumar', cropId: 'bc2', 
    pricePerKg: 50, minQuantity: 200, rating: 4.0, 
    contactNumber: '9988776655', whatsappAvailable: true, available: true,
    location: { lat: 26.7000, lng: 80.8000, village: 'Kishanpur', district: 'Lucknow', state: 'UP', country: 'India' }
  }
];

// --- INFIELD MARKETPLACE MOCK DATA ---

export const MOCK_SHOPS: Shop[] = [
  {
    shopId: 's1',
    shopName: 'Rampur Agro Center',
    shopType: 'agro-store',
    shopRating: 4.5,
    contactNumber: '0522-299334',
    location: { lat: 26.8480, lng: 80.9470, village: 'Rampur', district: 'Lucknow', state: 'UP', country: 'India' },
    itemsAvailable: ['i1', 'i2', 'i4'],
    isOpen: true
  },
  {
    shopId: 's2',
    shopName: 'Kishanpur Cooperative',
    shopType: 'cooperative',
    shopRating: 4.8,
    contactNumber: '0522-888777',
    location: { lat: 26.7050, lng: 80.8050, village: 'Kishanpur', district: 'Lucknow', state: 'UP', country: 'India' },
    itemsAvailable: ['i1', 'i3', 'i5'],
    isOpen: true
  },
  {
    shopId: 's3',
    shopName: 'City Tools & Machinery',
    shopType: 'dealer',
    shopRating: 4.2,
    contactNumber: '0522-111222',
    location: { lat: 26.8550, lng: 80.9550, village: 'City Center', district: 'Lucknow', state: 'UP', country: 'India' },
    itemsAvailable: ['i4', 'i5'],
    isOpen: false
  }
];

export const MOCK_INFIELD_ITEMS: InfieldItem[] = [
  {
    itemId: 'i1',
    itemName: 'Kufri Potato Seeds',
    itemCategory: 'Seed',
    price: 1200,
    unit: 'bag (50kg)',
    description: 'High yield Kufri Jyoti potato seeds. Certified disease free.',
    images: ['https://images.unsplash.com/photo-1593106596397-c8a7738cc697?auto=format&fit=crop&w=400&q=80'],
    availableInShops: ['s1', 's2'],
    usageStage: 'Sowing'
  },
  {
    itemId: 'i2',
    itemName: 'DAP Fertilizer',
    itemCategory: 'Fertilizer',
    price: 1350,
    unit: 'bag (50kg)',
    description: 'Di-ammonium Phosphate fertilizer for root development.',
    images: ['https://images.unsplash.com/photo-1627920769843-167098e6c708?auto=format&fit=crop&w=400&q=80'],
    availableInShops: ['s1'],
    usageStage: 'Sowing'
  },
  {
    itemId: 'i3',
    itemName: 'Neem Oil Pesticide',
    itemCategory: 'Pesticide',
    price: 450,
    unit: 'liter',
    description: 'Organic neem oil for pest control. Safe for all crops.',
    images: ['https://images.unsplash.com/photo-1615485925763-867862f8541e?auto=format&fit=crop&w=400&q=80'],
    availableInShops: ['s2'],
    usageStage: 'Protection'
  },
  {
    itemId: 'i4',
    itemName: 'Heavy Duty Sickle',
    itemCategory: 'Tool',
    price: 250,
    unit: 'piece',
    description: 'Forged steel sickle with wooden handle. Durable and sharp.',
    images: ['https://images.unsplash.com/photo-1589635071988-34440026e6f4?auto=format&fit=crop&w=400&q=80'],
    availableInShops: ['s1', 's3'],
    usageStage: 'Harvest'
  },
  {
    itemId: 'i5',
    itemName: 'Sprayer Pump (16L)',
    itemCategory: 'Machinery',
    price: 2200,
    unit: 'piece',
    description: 'Manual knapsack sprayer with 16L tank capacity.',
    images: ['https://images.unsplash.com/photo-1594411475171-d85c490a6042?auto=format&fit=crop&w=400&q=80'],
    availableInShops: ['s2', 's3'],
    usageStage: 'Protection'
  }
];

// --- INFIELD RENTAL MOCK DATA ---

export const MOCK_RENTAL_VEHICLES: RentalVehicle[] = [
  {
    id: 'rv1',
    name: 'Mahindra 575 DI Tractor',
    type: 'Tractor',
    image: 'https://images.unsplash.com/photo-1530267981375-f0de93bf1e9f?auto=format&fit=crop&w=800&q=80',
    hourlyRate: 800,
    dailyRate: 7000,
    description: '45 HP Tractor with rotavator attachment. Good for ploughing and transport.',
    supportedOperations: ['Ploughing', 'Transport', 'Harrowing'],
    ownerId: 'rp1',
    available: true
  },
  {
    id: 'rv2',
    name: 'JCB 3DX Backhoe',
    type: 'JCB',
    image: 'https://images.unsplash.com/photo-1577724328509-5a1e8082987a?auto=format&fit=crop&w=800&q=80',
    hourlyRate: 1200,
    dailyRate: 11000,
    description: 'Heavy duty earthmover for digging and land levelling.',
    supportedOperations: ['Digging', 'Levelling', 'Canal Cleaning'],
    ownerId: 'rp2',
    available: true
  },
  {
    id: 'rv3',
    name: 'Kartar 4000 Harvester',
    type: 'Harvester',
    image: 'https://images.unsplash.com/photo-1595180470211-13130d20d405?auto=format&fit=crop&w=800&q=80',
    hourlyRate: 2500,
    dailyRate: 22000,
    description: 'Combine harvester for Wheat and Paddy. Minimal grain loss.',
    supportedOperations: ['Harvesting'],
    ownerId: 'rp1',
    available: false
  },
  {
    id: 'rv4',
    name: 'Swaraj 744 FE',
    type: 'Tractor',
    image: 'https://images.unsplash.com/photo-1605218427335-3a4dd8745fab?auto=format&fit=crop&w=800&q=80',
    hourlyRate: 750,
    dailyRate: 6500,
    description: 'Fuel efficient tractor for general farm tasks.',
    supportedOperations: ['Ploughing', 'Sowing'],
    ownerId: 'rp3',
    available: true
  }
];

export const MOCK_RENTAL_PROVIDERS: RentalProvider[] = [
  {
    id: 'rp1',
    name: 'Singh Machinery Hub',
    type: 'Contractor',
    rating: 4.7,
    contactNumber: '9988776655',
    whatsappAvailable: true,
    location: { lat: 26.8500, lng: 80.9500, village: 'City Center', district: 'Lucknow', state: 'UP', country: 'India' },
    vehicles: ['rv1', 'rv3'],
    verified: true
  },
  {
    id: 'rp2',
    name: 'Rampur Earthmovers',
    type: 'Contractor',
    rating: 4.3,
    contactNumber: '8877665544',
    whatsappAvailable: false,
    location: { lat: 26.8467, lng: 80.9462, village: 'Rampur', district: 'Lucknow', state: 'UP', country: 'India' },
    vehicles: ['rv2'],
    verified: true
  },
  {
    id: 'rp3',
    name: 'Vikram Farmer',
    type: 'Farmer',
    rating: 4.9,
    contactNumber: '7766554433',
    whatsappAvailable: true,
    location: { lat: 26.8000, lng: 80.9000, village: 'Sonpur', district: 'Lucknow', state: 'UP', country: 'India' },
    vehicles: ['rv4'],
    verified: false
  }
];

// Kept for backward compatibility if needed, but mapped to new structure where possible in UI
export const INFIELD_PRODUCTS: InfieldProduct[] = [
  { id: '101', productName: 'Premium Potato Seeds (Kufri)', category: 'Seed', price: 1200, usageStage: 'Sowing', deliveryTime: '2 Days' },
  { id: '102', productName: 'NPK 19-19-19 Fertilizer', category: 'Fertilizer', price: 850, usageStage: 'Growth', deliveryTime: '1 Day' },
  { id: '103', productName: 'Heavy Duty Sickle', category: 'Tool', price: 250, usageStage: 'Harvest', deliveryTime: '3 Days' }
];

export const GOVERNMENT_SCHEMES: GovernmentScheme[] = [
  { id: 'S1', schemeName: 'PM-KISAN Samman Nidhi', benefit: '₹6,000 per year direct transfer', eligibilityCriteria: 'Small & Marginal Farmers (< 5 Acres)', minLandAcres: 0 },
  { id: 'S2', schemeName: 'Sub-Mission on Agricultural Mechanization', benefit: '50% Subsidy on Tractors/Tools', eligibilityCriteria: 'Any registered farmer', minLandAcres: 2 }
];

export const OFFLINE_AGENTS: Agent[] = [
  { id: 'A1', name: 'Ram Kaka', assignedVillage: 'Rampur', contactNumber: '9900112233', farmersAssisted: 142 },
  { id: 'A2', name: 'Sita Devi', assignedVillage: 'Sonpur', contactNumber: '8800112233', farmersAssisted: 89 }
];
