
// This file defines what our data looks like.
// It helps us keep "Human-Readable" names consistent across the app.

// AUTHENTICATION TYPES
export type UserRole = 'farmer' | 'consumer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  village?: Village;
  password?: string;
  trustScore: number; 
  totalOrders: number;
  landSizeAcres?: number;
  location?: GeoLocation; // Current detected or manual location
  address?: string; // Specific Farm or Delivery Address
}

export interface GeoLocation {
  lat: number;
  lng: number;
  country?: string;
  state?: string;
  district?: string;
  village?: string;
}

// SECURITY & AUDIT TYPES
export type AuditAction = 
  | 'LOGIN_SUCCESS' 
  | 'LOGIN_FAILED' 
  | 'LOGOUT' 
  | 'SIGNUP' 
  | 'PASSWORD_RESET' 
  | 'SESSION_TIMEOUT' 
  | 'PRODUCT_UPDATE' 
  | 'ADMIN_ACTION'
  | 'ORDER_PLACED'
  | 'REVIEW_SUBMITTED'
  | 'BULK_INQUIRY'
  | 'RENTAL_INQUIRY'
  | 'DEMO_RESET';

export interface AuditLog {
  id: string;
  timestamp: number;
  action: AuditAction;
  performedBy: string;
  targetEntity?: string;
  details?: string;
  isHighRisk?: boolean;
}

// UI TYPES
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  activeFarmers: number;
  activeConsumers: number;
  topProducts: { name: string; count: number }[];
  bulkInquiries: number;
  avgOrderValue: number;
}

// PRODUCT TYPES
export type ProductStatus = 'pending' | 'approved' | 'rejected';
export type Category = 'Vegetables' | 'Fruits' | 'Grains' | 'Seeds' | 'Tools';

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  reviewDate: string;
}

export interface Seller {
  id: string;
  name: string;
  type: 'farmer' | 'store' | 'agent';
  rating: number;
  totalReviews: number;
  subRatings?: {
    quality: number;
    delivery: number;
    communication: number;
  };
  address?: string; // Specific seller address
}

export interface Product {
  id: string;
  productName: string;
  category: Category;
  description: string;
  pricePerKg: number;
  unit: string;
  images: string[];
  farmerName: string; // Legacy support
  seller: Seller;
  villageName: string; // Legacy support
  location: GeoLocation;
  quantityAvailable: number;
  harvestDate: string;
  contactNumber: string;
  status: ProductStatus;
  adminSuggestedPrice?: number;
  seasonTag?: 'High Demand' | 'Low Demand' | 'Standard';
  reviews: Review[];
  similarProductIds: string[];
}

// ORDER TYPES
export type OrderStatus = 'Placed' | 'Confirmed' | 'Partner Assigned' | 'On the Way' | 'Delivered';

export interface Order {
  id: string;
  type: 'market' | 'infield'; // New field to distinguish order type
  productId: string; // Used for both Market Product ID and Infield Item ID
  shopId?: string; // Specific for Infield orders
  buyerId: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  timestamp: number;
}

// FARMER INPUT TYPES (INFIELD)
export type InputCategory = 'Seed' | 'Fertilizer' | 'Pesticide' | 'Tool' | 'Machinery';
export type UsageStage = 'Sowing' | 'Growth' | 'Protection' | 'Harvest';

// Legacy Type - kept for backward compatibility if needed, but we prefer InfieldItem now
export interface InfieldProduct {
  id: string;
  productName: string;
  category: InputCategory;
  price: number;
  usageStage: UsageStage;
  deliveryTime: string;
}

export interface Shop {
  shopId: string;
  shopName: string;
  shopType: 'agro-store' | 'cooperative' | 'dealer';
  shopRating: number;
  contactNumber: string;
  location: GeoLocation;
  itemsAvailable: string[]; // List of InfieldItem IDs
  isOpen: boolean;
}

export interface InfieldItem {
  itemId: string;
  itemName: string;
  itemCategory: InputCategory;
  price: number;
  unit: string;
  description: string;
  images: string[];
  availableInShops: string[]; // List of Shop IDs
  usageStage?: UsageStage;
}

// RENTAL TYPES
export type VehicleType = 'Tractor' | 'Harvester' | 'Rotavator' | 'JCB' | 'Pump' | 'Thresher' | 'Drone';

export interface RentalVehicle {
  id: string;
  name: string; // e.g. "Mahindra 575 DI"
  type: VehicleType;
  image: string;
  hourlyRate: number;
  dailyRate: number;
  description: string;
  supportedOperations: string[]; // e.g., 'Ploughing', 'Harvesting'
  ownerId: string;
  available: boolean;
}

export interface RentalProvider {
  id: string;
  name: string;
  type: 'Farmer' | 'Contractor';
  rating: number;
  contactNumber: string;
  whatsappAvailable: boolean;
  location: GeoLocation;
  vehicles: string[]; // RentalVehicle IDs
  verified: boolean;
}

// BULK OUTFIELD TYPES
export interface BulkCrop {
  id: string;
  name: string;
  category: Category;
  image: string;
  averagePriceRange: string; // e.g. "₹15 - ₹20"
}

export interface BulkFarmerOffer {
  id: string;
  farmerId: string;
  farmerName: string;
  cropId: string;
  pricePerKg: number;
  minQuantity: number; // in Kg
  rating: number;
  contactNumber: string;
  whatsappAvailable: boolean;
  location: GeoLocation;
  available: boolean;
}

// GOVERNMENT SCHEMES
export interface GovernmentScheme {
  id: string;
  schemeName: string;
  benefit: string;
  eligibilityCriteria: string;
  minLandAcres: number;
}

// OFFLINE AGENTS
export interface Agent {
  id: string;
  name: string;
  assignedVillage: Village;
  contactNumber: string;
  farmersAssisted: number;
}

// CONSTANT TYPES
export type Village = 'Rampur' | 'Sonpur' | 'Kishanpur' | 'City Center';

export interface MandiPriceList {
  [key: string]: number;
}
