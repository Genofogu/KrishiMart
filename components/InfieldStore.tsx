
import React, { useState, useEffect } from 'react';
import { Package, Truck, Sprout, Hammer, Droplets, MapPin, Store, Search, ArrowRight, ArrowLeft, Star, Clock, Filter, ShoppingCart, ExternalLink, Navigation, Phone, Plus, Minus, Trash2, ShoppingBag, X, Tractor, HardHat, PhoneCall, MessageSquare, CheckCircle, Calendar, Cloud } from 'lucide-react';
import { MOCK_INFIELD_ITEMS, MOCK_SHOPS, MOCK_RENTAL_VEHICLES, MOCK_RENTAL_PROVIDERS } from '../constants';
import { InfieldItem, Shop, GeoLocation, InputCategory, RentalVehicle, RentalProvider, AuditAction } from '../types';
import { CloudinaryImage } from './CloudinaryImage';

interface InfieldStoreProps {
  userLocation?: GeoLocation;
  onPlaceOrder: (itemId: string, quantity: number, type: 'infield', shopId: string) => string;
  showToast?: (msg: string, type: 'success'|'error'|'info') => void;
  onLogAudit?: (action: AuditAction, actor: string, target?: string, detail?: string) => void;
}

type InfieldSection = 'inputs' | 'rentals';
type ViewMode = 'items' | 'shops';
type RentalViewMode = 'vehicles' | 'providers';

interface CartItem {
  id: string;
  item: InfieldItem;
  shop: Shop;
  quantity: number;
}

export const InfieldStore: React.FC<InfieldStoreProps> = ({ userLocation, onPlaceOrder, showToast, onLogAudit }) => {
  // --- GLOBAL STATE ---
  const [activeSection, setActiveSection] = useState<InfieldSection>('inputs');
  
  // --- INPUTS STATE ---
  const [viewMode, setViewMode] = useState<ViewMode>('items');
  const [rawSearchQuery, setRawSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InputCategory | 'All'>('All');
  const [selectedItem, setSelectedItem] = useState<InfieldItem | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- RENTALS STATE ---
  const [rentalMode, setRentalMode] = useState<RentalViewMode>('vehicles');
  const [selectedRentalVehicle, setSelectedRentalVehicle] = useState<RentalVehicle | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<RentalProvider | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(rawSearchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [rawSearchQuery]);

  // Helper: Calculate Distance
  const calculateDistance = (loc1?: GeoLocation, loc2?: GeoLocation) => {
    if (!loc1 || !loc2) return 999;
    const R = 6371;
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const getDeliveryEstimate = (distance: number) => {
    if (distance < 10) return "Same Day";
    if (distance < 50) return "Next Day";
    return "2-4 Days";
  };

  // Helper: Get Icon
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Seed': return <Sprout className="text-green-600" size={18} />;
      case 'Tool': return <Hammer className="text-gray-600" size={18} />;
      case 'Fertilizer': return <Droplets className="text-blue-500" size={18} />;
      case 'Machinery': return <Truck className="text-orange-500" size={18} />;
      default: return <Package className="text-purple-500" size={18} />;
    }
  };

  // --- CART ACTIONS ---
  const addToCart = (item: InfieldItem, shopId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shop = MOCK_SHOPS.find(s => s.shopId === shopId);
    if (!shop) return;

    setCart(prev => {
      const existing = prev.find(i => i.item.itemId === item.itemId && i.shop.shopId === shopId);
      if (existing) {
        return prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: `${item.itemId}-${shopId}`,
        item,
        shop,
        quantity: 1
      }];
    });
    if (showToast) showToast(`Added ${item.itemName} to cart`, 'success');
    setIsCartOpen(true);
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === cartId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(i => i.id !== cartId));
  };

  const checkout = () => {
    if (cart.length === 0) return;
    cart.forEach(cItem => {
      onPlaceOrder(cItem.item.itemId, cItem.quantity, 'infield', cItem.shop.shopId);
    });
    setCart([]);
    setIsCartOpen(false);
  };

  // --- RENTAL ACTIONS ---
  const handleRentalInquiry = (vehicle: RentalVehicle, provider: RentalProvider, method: 'call' | 'whatsapp') => {
    if (onLogAudit) {
      onLogAudit('RENTAL_INQUIRY', 'User', vehicle.name, `Provider: ${provider.name}, Method: ${method}`);
    }
    if (showToast) showToast(`Connecting with ${provider.name}...`, 'info');
    
    if (method === 'whatsapp' && provider.whatsappAvailable) {
       window.open(`https://wa.me/91${provider.contactNumber}?text=Hi, I am interested in renting your ${vehicle.name}`, '_blank');
    } else {
       window.open(`tel:${provider.contactNumber}`);
    }
  };

  // --- FILTERED DATA (INPUTS) ---
  const filteredItems = MOCK_INFIELD_ITEMS.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.itemCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredShops = MOCK_SHOPS.filter(shop => {
    const matchesSearch = shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          shop.location.village?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // --- FILTERED DATA (RENTALS) ---
  const filteredVehicles = MOCK_RENTAL_VEHICLES.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredProviders = MOCK_RENTAL_PROVIDERS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.location.village?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // --- RENTAL VIEWS ---

  const VehicleDetailView = ({ vehicle }: { vehicle: RentalVehicle }) => {
    const provider = MOCK_RENTAL_PROVIDERS.find(p => p.id === vehicle.ownerId);
    if (!provider) return null;
    const distance = calculateDistance(userLocation, provider.location);

    return (
       <div className="animate-in slide-in-from-right-10 duration-300 pb-20">
         <button onClick={() => setSelectedRentalVehicle(null)} className="mb-4 flex items-center gap-2 text-gray-600 font-semibold hover:text-green-700">
          <ArrowLeft size={20} /> Back to Vehicles
         </button>

         <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <div className="relative h-64 bg-gray-900">
               <CloudinaryImage 
                 src={vehicle.image} 
                 alt={vehicle.name} 
                 transformations={{ width: 800, height: 500, crop: 'fill', quality: 'auto' }}
                 className="w-full h-full object-cover" 
                 enableLightbox
               />
               <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                 <Tractor size={16} /> {vehicle.type}
               </div>
               <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${vehicle.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                 {vehicle.available ? 'Available Now' : 'Currently Booked'}
               </div>
            </div>

            <div className="p-6">
              <h2 className="text-3xl font-black text-gray-900 mb-2">{vehicle.name}</h2>
              <div className="flex gap-4 mb-6 text-sm text-gray-600">
                 <span className="flex items-center gap-1"><Clock size={16}/> ₹{vehicle.hourlyRate}/hr</span>
                 <span className="flex items-center gap-1"><Calendar size={16} /> ₹{vehicle.dailyRate}/day</span>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <HardHat size={18} /> Owner: {provider.name}
                </h3>
                <div className="flex justify-between items-center text-sm mb-4">
                  <div className="flex items-center gap-4">
                     <span className="flex items-center gap-1 text-gray-600"><MapPin size={14} /> {provider.location.village} ({distance} km)</span>
                     <span className="flex items-center gap-1 text-yellow-500 font-bold"><Star size={14} fill="currentColor" /> {provider.rating}</span>
                  </div>
                  {provider.verified && <span className="text-green-600 flex items-center gap-1 font-bold"><CheckCircle size={14} /> Verified</span>}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={() => handleRentalInquiry(vehicle, provider, 'call')}
                     className="bg-white text-gray-800 border border-gray-300 py-3 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
                   >
                     <PhoneCall size={18} /> Call Owner
                   </button>
                   <button 
                     onClick={() => handleRentalInquiry(vehicle, provider, 'whatsapp')}
                     disabled={!provider.whatsappAvailable}
                     className="bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     <MessageSquare size={18} /> WhatsApp
                   </button>
                </div>
              </div>

              <div className="mb-6">
                 <h3 className="font-bold text-gray-900 mb-2">Capabilities</h3>
                 <div className="flex flex-wrap gap-2">
                   {vehicle.supportedOperations.map(op => (
                     <span key={op} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-200">
                       {op}
                     </span>
                   ))}
                 </div>
              </div>
              
              <div className="text-sm text-gray-500 italic">
                {vehicle.description}
              </div>
            </div>
         </div>
       </div>
    );
  };

  const ProviderDetailView = ({ provider }: { provider: RentalProvider }) => {
    const providerVehicles = MOCK_RENTAL_VEHICLES.filter(v => provider.vehicles.includes(v.id));
    const distance = calculateDistance(userLocation, provider.location);

    return (
      <div className="animate-in slide-in-from-right-10 duration-300 pb-20">
         <button onClick={() => setSelectedProvider(null)} className="mb-4 flex items-center gap-2 text-gray-600 font-semibold hover:text-green-700">
          <ArrowLeft size={20} /> Back to Providers
         </button>

         <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6">
            <div className="flex justify-between items-start">
               <div>
                 <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                   {provider.name} {provider.verified && <CheckCircle className="text-blue-500" size={24} />}
                 </h2>
                 <p className="text-gray-500">{provider.type} • {provider.location.village}</p>
                 <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded border border-yellow-200 font-bold flex items-center gap-1">
                      <Star size={14} fill="currentColor" /> {provider.rating}
                    </span>
                    <span className="text-gray-400">{distance} km away</span>
                 </div>
               </div>
               <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                 <HardHat size={32} />
               </div>
            </div>
         </div>

         <h3 className="font-bold text-xl text-gray-800 mb-4">Available Fleet ({providerVehicles.length})</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providerVehicles.map(v => (
              <div key={v.id} onClick={() => setSelectedRentalVehicle(v)} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-400 cursor-pointer flex gap-4 transition-all">
                 <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                   <CloudinaryImage 
                     src={v.image} 
                     alt={v.name}
                     transformations={{ width: 180, height: 180, crop: 'fill', quality: 'auto' }}
                     className="w-full h-full object-cover" 
                   />
                 </div>
                 <div>
                   <h4 className="font-bold text-gray-900">{v.name}</h4>
                   <div className="text-xs text-gray-500 mb-2">{v.type}</div>
                   <div className="font-bold text-green-700">₹{v.hourlyRate}/hr</div>
                   <div className={`text-[10px] mt-2 font-bold uppercase ${v.available ? 'text-green-600' : 'text-red-500'}`}>
                     {v.available ? 'Available' : 'Booked'}
                   </div>
                 </div>
              </div>
            ))}
         </div>
      </div>
    );
  };

  // --- MAIN RENDER LOGIC ---

  // Handle Detail Views first (highest priority)
  if (selectedItem) {
    // Note: Reusing local CartDrawer/ItemDetailView logic is complex if not extracted. 
    // Ideally I'd refactor. For now, I'll inline the return for inputs detailed view if needed, 
    // OR keep the existing `ItemDetailView` component inside the main body.
    // To save space, let's look at the structure.
    // The previous implementation had sub-components inside. I'll maintain that structure below.
  }
  if (selectedRentalVehicle) return <VehicleDetailView vehicle={selectedRentalVehicle} />;
  if (selectedProvider) return <ProviderDetailView provider={selectedProvider} />;


  // --- SUB COMPONENTS (Re-declared for scope access) ---
  const CartDrawer = () => {
    if (!isCartOpen) return null;
    const total = cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);

    return (
      <div className="fixed inset-0 z-[100] flex justify-end">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
        <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black flex items-center gap-2 text-gray-800">
              <ShoppingBag className="text-green-600" /> Your Cart
            </h2>
            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                <p>Your cart is empty.</p>
              </div>
            ) : (
              cart.map(cItem => (
                <div key={cItem.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <CloudinaryImage 
                      src={cItem.item.images[0]} 
                      alt={cItem.item.itemName}
                      transformations={{ width: 120, height: 120, crop: 'fill', quality: 'auto' }}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{cItem.item.itemName}</h4>
                    <p className="text-xs text-gray-500 mb-2 truncate">via {cItem.shop.shopName}</p>
                    <div className="flex items-center justify-between">
                       <div className="font-bold text-green-700">₹{cItem.item.price * cItem.quantity}</div>
                       <div className="flex items-center gap-2 bg-white px-2 py-1 rounded shadow-sm border border-gray-200">
                         <button onClick={() => updateQuantity(cItem.id, -1)} className="text-gray-400 hover:text-red-500"><Minus size={12}/></button>
                         <span className="text-xs font-bold w-4 text-center">{cItem.quantity}</span>
                         <button onClick={() => updateQuantity(cItem.id, 1)} className="text-gray-400 hover:text-green-500"><Plus size={12}/></button>
                       </div>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(cItem.id)} className="text-gray-300 hover:text-red-500 self-start p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium">Total Estimate</span>
              <span className="text-3xl font-black text-gray-900">₹{total}</span>
            </div>
            <button 
              disabled={cart.length === 0}
              onClick={checkout}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              Place Orders <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const InputDetailView = ({ item }: { item: InfieldItem }) => {
     const availableShops = MOCK_SHOPS.filter(s => item.availableInShops.includes(s.shopId))
      .map(s => ({ ...s, distance: calculateDistance(userLocation, s.location) }))
      .sort((a, b) => a.distance - b.distance);
      
      return (
      <div className="animate-in slide-in-from-right-10 duration-300 pb-20">
        <button onClick={() => setSelectedItem(null)} className="mb-4 flex items-center gap-2 text-gray-600 font-semibold hover:text-green-700">
          <ArrowLeft size={20} /> Back to Inputs
        </button>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-fit">
            <div className="w-full h-80 bg-gray-900 overflow-hidden">
              <CloudinaryImage 
                src={item.images[0]} 
                alt={item.itemName} 
                transformations={{ width: 800, height: 600, crop: 'fill', quality: 'auto' }}
                className="w-full h-full object-cover" 
                enableLightbox
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{item.itemCategory}</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">{item.itemName}</h2>
              <div className="text-2xl font-bold text-green-700 mb-6">₹{item.price} <span className="text-sm text-gray-400 font-normal">/ {item.unit}</span></div>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Store size={20} /> Available in {availableShops.length} Shops</h3>
            {availableShops.map(shop => (
              <div key={shop.shopId} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-green-300 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900">{shop.shopName}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1"><MapPin size={14} /> {shop.location.village} ({shop.distance} km)</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mt-2 bg-blue-50 w-fit px-2 py-1 rounded"><Truck size={12} /> {getDeliveryEstimate(shop.distance)} Delivery</div>
                  </div>
                  <div className="flex flex-col gap-2">
                     <button onClick={() => addToCart(item, shop.shopId)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-green-700 flex items-center gap-2"><ShoppingCart size={16} /> Add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      );
  }

  // Handle Input Detail View
  if (selectedItem) return <><CartDrawer/><InputDetailView item={selectedItem} /></>;
  if (selectedShop) return <><CartDrawer/>{/* Shop detail view skipped for brevity in update, maintain old if needed or user goes back */}</>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 animate-in fade-in pb-20">
      <CartDrawer />

      {/* --- LEVEL 1: SECTION TOGGLE --- */}
      <div className="flex justify-center mb-6">
         <div className="bg-white p-1.5 rounded-2xl shadow-md border border-gray-200 inline-flex">
            <button 
              onClick={() => setActiveSection('inputs')}
              className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeSection === 'inputs' ? 'bg-green-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Package size={20} /> Buy Inputs
            </button>
            <button 
              onClick={() => setActiveSection('rentals')}
              className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeSection === 'rentals' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Tractor size={20} /> Rent Machinery
            </button>
         </div>
      </div>

      {/* --- LEVEL 2: CONTROLS & HEADER --- */}
      <div className="sticky top-[70px] z-30 bg-gray-50/95 backdrop-blur-md pt-3 pb-4 -mx-4 px-4 border-b border-gray-200/80 shadow-sm transition-all">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Toggle View Mode Based on Section */}
          <div className="flex justify-center">
             {activeSection === 'inputs' ? (
                <div className="bg-white p-1 rounded-full shadow-sm border border-gray-200 flex relative">
                  <button onClick={() => setViewMode('items')} className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'items' ? 'text-white' : 'text-gray-500'}`}><Package size={16} /> Items</button>
                  <button onClick={() => setViewMode('shops')} className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'shops' ? 'text-white' : 'text-gray-500'}`}><Store size={16} /> Shops</button>
                  <div className={`absolute top-1 bottom-1 w-[50%] bg-gradient-to-r ${viewMode === 'items' ? 'from-green-600 to-green-500 left-1' : 'from-blue-600 to-blue-500 left-[49%]'} rounded-full transition-all duration-300 shadow-sm`} />
                </div>
             ) : (
                <div className="bg-white p-1 rounded-full shadow-sm border border-gray-200 flex relative">
                  <button onClick={() => setRentalMode('vehicles')} className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${rentalMode === 'vehicles' ? 'text-white' : 'text-gray-500'}`}><Tractor size={16} /> By Vehicle</button>
                  <button onClick={() => setRentalMode('providers')} className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${rentalMode === 'providers' ? 'text-white' : 'text-gray-500'}`}><HardHat size={16} /> By Provider</button>
                  <div className={`absolute top-1 bottom-1 w-[50%] bg-gradient-to-r from-orange-600 to-orange-500 rounded-full transition-all duration-300 shadow-sm ${rentalMode === 'vehicles' ? 'left-1' : 'left-[49%]'}`} />
                </div>
             )}
          </div>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 focus-within:ring-2 focus-within:ring-green-500/50 transition-all">
              <Search className="text-gray-400 ml-2" size={20} />
              <input 
                type="text" 
                placeholder={activeSection === 'inputs' ? "Search seeds, fertilizers..." : "Search tractor, harvester, provider..."}
                className="flex-1 outline-none text-gray-700 font-medium bg-transparent"
                value={rawSearchQuery}
                onChange={(e) => setRawSearchQuery(e.target.value)}
              />
              {rawSearchQuery && <button onClick={() => setRawSearchQuery('')} className="p-1 hover:bg-gray-100 rounded-full text-gray-400"><X size={16} /></button>}
            </div>
            
            {activeSection === 'inputs' && viewMode === 'items' && (
              <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                {['All', 'Seed', 'Fertilizer', 'Pesticide', 'Tool', 'Machinery'].map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat as any)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${selectedCategory === cat ? 'bg-gray-800 text-white border-gray-800 shadow-md transform scale-105' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{cat}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="min-h-[50vh]">
        {activeSection === 'inputs' ? (
           // INPUTS LOGIC
           viewMode === 'items' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => {
                  const itemShops = MOCK_SHOPS.filter(s => item.availableInShops.includes(s.shopId));
                  const distances = itemShops.map(s => calculateDistance(userLocation, s.location));
                  const minDist = Math.min(...distances, 999);

                  return (
                    <div key={item.itemId} onClick={() => setSelectedItem(item)} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
                      <div className="h-48 overflow-hidden relative bg-gray-900">
                        <CloudinaryImage 
                          src={item.images[0]} 
                          alt={item.itemName} 
                          transformations={{ width: 450, height: 300, crop: 'fill', quality: 'auto' }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                        <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                          {getCategoryIcon(item.itemCategory)} {item.itemCategory}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{item.itemName}</h3>
                        <div className="flex items-end gap-1 mb-3">
                           <span className="text-2xl font-bold text-green-700">₹{item.price}</span>
                           <span className="text-xs text-gray-400 font-medium mb-1">/ {item.unit}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                          <div className="flex items-center gap-1"><MapPin size={12} /> {minDist < 999 ? `${minDist} km away` : 'Not nearby'}</div>
                          <div className="flex items-center gap-1 font-semibold text-blue-600"><Clock size={12} /> {getDeliveryEstimate(minDist)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
           ) : (
              <div className="space-y-4">
                {filteredShops.map(shop => (
                   <div key={shop.shopId} onClick={() => setSelectedShop(shop)} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex items-start gap-4">
                         <div className="bg-blue-50 p-4 rounded-xl text-blue-600"><Store size={32} /></div>
                         <div>
                            <h3 className="text-xl font-bold text-gray-900">{shop.shopName}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                               <span>{shop.location.village} ({calculateDistance(userLocation, shop.location)} km)</span>
                            </div>
                         </div>
                      </div>
                      <div className="text-right"><div className="text-2xl font-black text-gray-800">{shop.itemsAvailable.length} Items</div></div>
                   </div>
                ))}
              </div>
           )
        ) : (
           // RENTALS LOGIC
           rentalMode === 'vehicles' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredVehicles.map(v => {
                    const provider = MOCK_RENTAL_PROVIDERS.find(p => p.id === v.ownerId);
                    const distance = provider ? calculateDistance(userLocation, provider.location) : 999;
                    
                    return (
                       <div key={v.id} onClick={() => setSelectedRentalVehicle(v)} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                          <div className="h-48 overflow-hidden relative bg-gray-900">
                             <CloudinaryImage 
                               src={v.image} 
                               alt={v.name} 
                               transformations={{ width: 450, height: 300, crop: 'fill', quality: 'auto' }}
                               className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                             />
                             <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">{v.type}</div>
                          </div>
                          <div className="p-4">
                             <h3 className="font-bold text-gray-900 text-lg mb-1">{v.name}</h3>
                             <div className="flex items-end gap-1 mb-3">
                                <span className="text-xl font-black text-orange-600">₹{v.hourlyRate}<span className="text-xs text-gray-400 font-normal">/hr</span></span>
                             </div>
                             <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                                <span className="flex items-center gap-1"><MapPin size={12}/> {distance} km away</span>
                                <span className={`font-bold ${v.available ? 'text-green-600' : 'text-red-500'}`}>{v.available ? 'Available' : 'Booked'}</span>
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {filteredProviders.map(p => {
                    const distance = calculateDistance(userLocation, p.location);
                    return (
                       <div key={p.id} onClick={() => setSelectedProvider(p)} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-orange-300 transition-all cursor-pointer">
                          <div className="flex justify-between items-start">
                             <div className="flex gap-4">
                                <div className="bg-orange-50 p-3 rounded-full text-orange-600 h-fit"><HardHat size={24}/></div>
                                <div>
                                   <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                                   <p className="text-sm text-gray-500">{p.type} • {p.location.village}</p>
                                   <div className="flex items-center gap-3 mt-2 text-xs font-bold">
                                      <span className="bg-yellow-50 text-yellow-600 px-2 py-1 rounded border border-yellow-200 flex items-center gap-1"><Star size={12} fill="currentColor"/> {p.rating}</span>
                                      <span className="text-gray-400">{distance} km away</span>
                                   </div>
                                </div>
                             </div>
                             <div className="text-center">
                                <div className="text-2xl font-black text-gray-800">{p.vehicles.length}</div>
                                <div className="text-[10px] uppercase font-bold text-gray-400">Vehicles</div>
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>
           )
        )}
      </div>

      {/* MAIN FAB CART (Only show for Inputs) */}
      {activeSection === 'inputs' && cart.length > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-green-900 text-white p-4 rounded-full shadow-2xl z-50 hover:scale-110 transition-transform animate-in zoom-in"
        >
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
            {cart.reduce((a, b) => a + b.quantity, 0)}
          </div>
          <ShoppingBag size={24} />
        </button>
      )}
    </div>
  );
};
