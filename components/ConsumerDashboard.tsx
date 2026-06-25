
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Truck, CheckCircle, Star, Search, ArrowRight, User, X, Tag, ShoppingBag, Layers, Phone, MessageCircle, ArrowLeft, Navigation, Scale, Filter, Info, AlertCircle } from 'lucide-react';
import { Product, Village, Category, GeoLocation, BulkCrop, BulkFarmerOffer, AuditAction } from '../types';
import { VILLAGE_DISTANCES, MOCK_BULK_CROPS, MOCK_BULK_OFFERS } from '../constants';

interface ConsumerDashboardProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  userLocation?: GeoLocation;
  onLogAudit?: (action: AuditAction, actor: string, target?: string, detail?: string) => void;
  showToast?: (msg: string, type: 'success'|'error'|'info') => void;
}

const OUTFIELD_CATEGORIES: (Category | 'All')[] = ['All', 'Vegetables', 'Fruits', 'Grains'];

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ products, onSelectProduct, userLocation, onLogAudit, showToast }) => {
  const [outfieldMode, setOutfieldMode] = useState<'per_kg' | 'bulk'>('per_kg');
  
  // Search State with Debounce
  const [rawSearchTerm, setRawSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  
  // Bulk Flow State
  const [selectedBulkCrop, setSelectedBulkCrop] = useState<BulkCrop | null>(null);
  const [selectedBulkFarmer, setSelectedBulkFarmer] = useState<BulkFarmerOffer | null>(null);

  // Debounce Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(rawSearchTerm);
    }, 300); // 300ms debounce
    return () => clearTimeout(handler);
  }, [rawSearchTerm]);

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

  const visibleProducts = products.filter(p => {
    const matchesStatus = p.status === 'approved';
    const matchesSearch = p.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesStatus && matchesSearch && matchesCategory;
  });

  const visibleBulkCrops = MOCK_BULK_CROPS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDistanceBadge = (distance: number) => {
    if (distance < 5) return { text: `${distance} km`, color: 'text-green-700 bg-green-100' };
    if (distance < 20) return { text: `${distance} km`, color: 'text-yellow-700 bg-yellow-100' };
    return { text: `${distance} km`, color: 'text-gray-700 bg-gray-100' };
  };

  const handleBulkContact = (farmer: BulkFarmerOffer, method: 'whatsapp' | 'call') => {
     if (onLogAudit) {
       onLogAudit('BULK_INQUIRY', 'Consumer', farmer.farmerName, `Method: ${method}, Crop: ${selectedBulkCrop?.name}`);
     }
     if (showToast) showToast('Connecting you with the farmer...', 'info');
     
     if (method === 'whatsapp' && farmer.whatsappAvailable) {
       window.open(`https://wa.me/91${farmer.contactNumber}?text=Hi, I am interested in bulk purchase of ${selectedBulkCrop?.name}`, '_blank');
     } else {
       window.open(`tel:${farmer.contactNumber}`);
     }
  };

  // --- SUB-VIEWS ---

  const BulkFarmersList = () => {
    if (!selectedBulkCrop) return null;
    const offers = MOCK_BULK_OFFERS.filter(o => o.cropId === selectedBulkCrop.id);

    return (
      <div className="animate-in slide-in-from-right duration-300">
        <button onClick={() => setSelectedBulkCrop(null)} className="mb-4 flex items-center gap-2 text-gray-600 font-bold hover:text-green-700">
          <ArrowLeft size={20} /> Back to Crops
        </button>
        
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl mb-6">
          <div className="flex justify-between items-start">
             <div>
               <h2 className="text-xl font-black text-green-900">Farmers selling {selectedBulkCrop.name} in Bulk</h2>
               <p className="text-green-700 text-sm">Direct farm-gate pickup. Wholesale prices.</p>
             </div>
             <Layers size={24} className="text-green-200" />
          </div>
        </div>

        <div className="grid gap-4">
          {offers.length === 0 ? (
             <div className="p-12 text-center text-gray-400 bg-white rounded-xl border-2 border-dashed border-gray-200">
               <User size={48} className="mx-auto mb-4 opacity-20" />
               <p className="font-medium">No farmers found for this crop currently.</p>
               <button onClick={() => setSelectedBulkCrop(null)} className="mt-4 text-green-600 font-bold hover:underline">Browse other crops</button>
             </div>
          ) : (
            offers.map(offer => {
              const distance = calculateDistance(userLocation, offer.location);
              const distBadge = getDistanceBadge(distance);
              return (
                <div key={offer.id} onClick={() => setSelectedBulkFarmer(offer)} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                        {offer.farmerName} <CheckCircle size={16} className="text-blue-500" />
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${distBadge.color}`}>
                          <MapPin size={10}/> {distBadge.text}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-500 font-bold"><Star size={14} fill="currentColor"/> {offer.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-2xl font-black text-green-700">₹{offer.pricePerKg}<span className="text-sm font-medium text-gray-400">/kg</span></div>
                       <div className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded mt-1 inline-block border border-orange-100">
                         Min. {offer.minQuantity} kg
                       </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const BulkFarmerDetail = () => {
    if (!selectedBulkFarmer || !selectedBulkCrop) return null;
    const distance = calculateDistance(userLocation, selectedBulkFarmer.location);

    return (
      <div className="animate-in zoom-in-95 duration-300 pb-20">
         <button onClick={() => setSelectedBulkFarmer(null)} className="mb-4 flex items-center gap-2 text-gray-600 font-bold hover:text-green-700">
          <ArrowLeft size={20} /> Back to Farmers
        </button>

        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-green-800 to-green-600 p-8 text-white relative">
             <h1 className="text-3xl font-black mb-2">{selectedBulkFarmer.farmerName}</h1>
             <div className="flex items-center gap-2 opacity-90">
               <MapPin size={18} /> {selectedBulkFarmer.location.village}, {selectedBulkFarmer.location.district}
               <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">{distance} km away</span>
             </div>
             <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
               <div className="text-xs uppercase font-bold opacity-75">Trust Score</div>
               <div className="text-2xl font-black text-yellow-400 flex items-center gap-1">
                 {selectedBulkFarmer.rating} <Star fill="currentColor" size={20} />
               </div>
             </div>
          </div>

          <div className="p-8">
            <div className="flex items-start gap-6 mb-8">
              <img src={selectedBulkCrop.image} className="w-24 h-24 rounded-xl object-cover shadow-md" alt={selectedBulkCrop.name} />
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Bulk Offer For</div>
                <h2 className="text-2xl font-black text-gray-800">{selectedBulkCrop.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                   <span className="text-xl font-bold text-green-700">₹{selectedBulkFarmer.pricePerKg}/kg</span>
                   <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">Min Order: {selectedBulkFarmer.minQuantity} kg</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
               <button 
                 onClick={() => handleBulkContact(selectedBulkFarmer, 'call')}
                 className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 rounded-xl font-bold transition-all"
               >
                 <Phone size={20} /> Call Farmer
               </button>
               <button 
                 onClick={() => handleBulkContact(selectedBulkFarmer, 'whatsapp')}
                 disabled={!selectedBulkFarmer.whatsappAvailable}
                 className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200"
               >
                 <MessageCircle size={20} /> Chat on WhatsApp
               </button>
            </div>
            
            <button 
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedBulkFarmer.location.lat},${selectedBulkFarmer.location.lng}`, '_blank')}
              className="w-full border-2 border-blue-100 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 flex items-center justify-center gap-2"
            >
              <Navigation size={18} /> Navigate to Farm
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
              <Info size={12} />
              Negotiate final price and transport directly. No platform fees.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---

  if (selectedBulkFarmer) return <BulkFarmerDetail />;
  if (selectedBulkCrop) return <BulkFarmersList />;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 animate-in slide-in-from-right-10 duration-500">
      
      {/* --- STICKY HEADER & CONTROLS --- */}
      <div className="sticky top-[70px] z-30 bg-gray-50/95 backdrop-blur-md pt-3 pb-4 -mx-4 px-4 border-b border-gray-200/80 shadow-sm transition-all">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* 1. Toggle Mode */}
          <div className="flex justify-center">
            <div className="bg-white p-1 rounded-full shadow-md border border-gray-200 flex relative">
              <button 
                onClick={() => { setOutfieldMode('per_kg'); setSelectedBulkCrop(null); }}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                  outfieldMode === 'per_kg' ? 'text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <ShoppingBag size={16} /> Per Kg
              </button>
              <button 
                onClick={() => setOutfieldMode('bulk')}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                  outfieldMode === 'bulk' ? 'text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Layers size={16} /> Bulk Order
              </button>
              
              {/* Sliding Background */}
              <div className={`absolute top-1 bottom-1 w-[50%] bg-gradient-to-r ${outfieldMode === 'per_kg' ? 'from-blue-600 to-blue-500 left-1' : 'from-orange-600 to-orange-500 left-[49%]'} rounded-full transition-all duration-300 shadow-sm`} />
            </div>
          </div>

          {/* 2. Search & Categories */}
          <div className="flex flex-col md:flex-row gap-4">
             <div className="flex-1 bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 focus-within:ring-2 focus-within:ring-green-500/50 transition-all">
                <Search className="text-gray-400 ml-2" size={20} />
                <input 
                  type="text" 
                  placeholder={outfieldMode === 'per_kg' ? "Search fresh produce..." : "Search bulk crops..."}
                  className="flex-1 outline-none text-gray-700 font-medium bg-transparent"
                  value={rawSearchTerm}
                  onChange={(e) => setRawSearchTerm(e.target.value)}
                />
                {rawSearchTerm && (
                  <button onClick={() => setRawSearchTerm('')} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                    <X size={16} />
                  </button>
                )}
             </div>
             
             <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                {OUTFIELD_CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-1 ${
                      selectedCategory === cat 
                        ? 'bg-gray-800 text-white border-gray-800 shadow-md transform scale-105' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      
      {outfieldMode === 'per_kg' ? (
        // MODE 1: PER KG GRID
        <>
          {visibleProducts.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white border-2 border-dashed border-gray-100 rounded-2xl">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="font-medium">No fresh produce found.</p>
                <button onClick={() => {setRawSearchTerm(''); setSelectedCategory('All')}} className="mt-2 text-sm text-blue-600 font-bold hover:underline">Clear Filters</button>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleProducts.map(product => {
                 const distance = calculateDistance(userLocation, product.location);
                 const distBadge = getDistanceBadge(distance);
                 
                 return (
                   <div 
                     key={product.id} 
                     onClick={() => onSelectProduct(product)}
                     className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                   >
                      <div className="h-48 overflow-hidden relative">
                        <img src={product.images[0]} alt={product.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-black uppercase text-green-700 shadow-sm">
                          {product.category}
                        </div>
                        {product.seasonTag === 'High Demand' && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold shadow-sm flex items-center gap-1">
                            <TrendingUpIcon /> Hot
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                             <h3 className="font-bold text-gray-900 line-clamp-1 text-lg group-hover:text-green-700 transition-colors">{product.productName}</h3>
                             <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                               <MapPin size={10} /> {product.villageName}
                             </div>
                           </div>
                           <div className="text-right">
                             <div className="text-xl font-black text-green-700">₹{product.adminSuggestedPrice || product.pricePerKg}</div>
                             <div className="text-[10px] text-gray-400">per {product.unit}</div>
                           </div>
                        </div>
                        
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                           <div className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 ${distBadge.color}`}>
                             <Truck size={10} /> {distBadge.text}
                           </div>
                           <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
                             <Star size={10} fill="currentColor" /> {product.seller.rating}
                           </div>
                        </div>
                      </div>
                   </div>
                 );
              })}
            </div>
          )}
        </>
      ) : (
        // MODE 2: BULK CROPS GRID
        <>
          {visibleBulkCrops.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white border-2 border-dashed border-gray-100 rounded-2xl">
                <Layers size={48} className="mb-4 opacity-20" />
                <p className="font-medium">No bulk crops match your search.</p>
                <button onClick={() => {setRawSearchTerm(''); setSelectedCategory('All')}} className="mt-2 text-sm text-orange-600 font-bold hover:underline">Clear Filters</button>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleBulkCrops.map(crop => (
                 <div 
                   key={crop.id}
                   onClick={() => setSelectedBulkCrop(crop)}
                   className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-green-400 transition-all cursor-pointer flex items-center gap-4 group"
                 >
                   <img src={crop.image} alt={crop.name} className="w-20 h-20 rounded-lg object-cover bg-gray-100 group-hover:scale-105 transition-transform" />
                   <div className="flex-1">
                     <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">{crop.name}</h3>
                     <div className="text-xs text-gray-500 mb-2">{crop.category}</div>
                     <div className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-700 border border-gray-200">
                        Est. {crop.averagePriceRange} /kg
                     </div>
                   </div>
                   <ArrowRight className="text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                 </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const TrendingUpIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);
