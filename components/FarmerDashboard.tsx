
import React, { useState } from 'react';
import { Plus, MapPin, CheckCircle, XCircle, Clock, Star, Landmark, Phone, Info, User as UserIcon, Calendar, Pencil, Save, X, ArrowRight, ShieldCheck, Home, Image as ImageIcon, Share2 } from 'lucide-react';
import { Product, User, Category } from '../types';
import { AVAILABLE_PRODUCTS, GOVERNMENT_SCHEMES, OFFLINE_AGENTS, PRODUCT_IMAGES } from '../constants';

interface FarmerDashboardProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  currentUser: User; 
  onUpdateUser: (updates: Partial<User>) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ products, onAddProduct, onEditProduct, currentUser, onUpdateUser }) => {
  // Add Product State
  const [productName, setProductName] = useState(AVAILABLE_PRODUCTS[0]);
  const [productImages, setProductImages] = useState<string[]>([PRODUCT_IMAGES[AVAILABLE_PRODUCTS[0]]]);
  const [currentInputUrl, setCurrentInputUrl] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState('');
  
  // Profile State
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(currentUser.address || '');

  // Modals State
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // LOGIC: Find Agent for this village
  const myAgent = OFFLINE_AGENTS.find(a => a.assignedVillage === currentUser.village) || OFFLINE_AGENTS[0];

  const handleSaveAddress = () => {
    onUpdateUser({ address: tempAddress });
    setIsEditingAddress(false);
  };

  const handleProduceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setProductName(val);
    // Auto-select image based on product name, reset list to just that default image
    setProductImages([PRODUCT_IMAGES[val] || PRODUCT_IMAGES['Potato']]);
  };

  const handleAddImage = () => {
    if (currentInputUrl && !productImages.includes(currentInputUrl)) {
      setProductImages(prev => [...prev, currentInputUrl]);
      setCurrentInputUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !quantity) return;

    const isHighDemand = productName === 'Onion' || productName === 'Tomato';
    const seasonTag = isHighDemand ? 'High Demand' : 'Standard';

    // Fix: Ensure all required Product properties are provided to avoid type errors
    const newProduct: Product = {
      id: Date.now().toString(),
      productName,
      category: 'Vegetables' as Category,
      description: `Freshly harvested ${productName} from the fields of ${currentUser.village || 'Rampur'}. High quality and organic produce directly from the farm.`,
      pricePerKg: Number(price),
      unit: 'kg',
      images: productImages.length > 0 ? productImages : [PRODUCT_IMAGES['Potato']], // Use selected images
      farmerName: currentUser.name,
      seller: {
        id: currentUser.id,
        name: currentUser.name,
        type: 'farmer',
        rating: currentUser.trustScore,
        totalReviews: currentUser.totalOrders,
        address: currentUser.address // Include the stored address
      },
      villageName: (currentUser.village as string) || 'Rampur',
      location: currentUser.location || { 
        lat: 26.8467, 
        lng: 80.9462, 
        village: currentUser.village as string || 'Rampur' 
      },
      quantityAvailable: Number(quantity),
      harvestDate: date,
      contactNumber: '9876543210', 
      status: 'pending',
      seasonTag,
      reviews: [],
      similarProductIds: []
    };

    onAddProduct(newProduct);
    setPrice('');
    setQuantity('');
    // Reset images to default for current selection
    setProductImages([PRODUCT_IMAGES[productName] || PRODUCT_IMAGES['Potato']]);
    alert('Product Submitted for Admin Approval!');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onEditProduct(editingProduct);
      setEditingProduct(null);
    }
  };

  const handleShare = async (product: Product) => {
    const shareText = `Fresh ${product.productName} available directly from my farm in ${product.villageName}! \nPrice: ₹${product.pricePerKg}/${product.unit}. \nQuality Guaranteed on Krishi-Mart.`;
    const shareUrl = window.location.href; // In a real app, this would be a deep link to the product

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Buy ${product.productName}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      // Fallback to WhatsApp for web/desktop
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const myProducts = products.filter(p => p.farmerName === currentUser.name);
  const totalEarnings = myProducts
    .filter(p => p.status === 'approved')
    .reduce((sum, item) => sum + (item.pricePerKg * item.quantityAvailable), 0);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold"><CheckCircle size={12}/> Live</span>;
      case 'rejected': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold"><XCircle size={12}/> Rejected</span>;
      default: return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold"><Clock size={12}/> Pending Approval</span>;
    }
  };

  const userLandSize = currentUser.landSizeAcres || 0;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 animate-in slide-in-from-right-10 duration-500">
      
      {/* 1. PROFILE & TRUST HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 w-full md:w-auto">
          <h2 className="text-2xl font-bold text-green-900 flex items-center gap-2 mb-2">
            Welcome, {currentUser.name}
            {currentUser.isVerified && <CheckCircle className="text-blue-500" size={20} />}
          </h2>
          
          <div className="flex flex-col gap-2">
             <div className="flex gap-4 text-gray-600 text-sm items-center">
                <span className="flex items-center gap-1"><MapPin size={14} /> {currentUser.village || 'Rampur'}</span>
                <span className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded border border-yellow-200 text-yellow-700 font-bold">
                  <Star size={14} fill="currentColor" /> {currentUser.trustScore}/5 Trust Score
                </span>
             </div>
             
             {/* EDITABLE ADDRESS FIELD */}
             <div className="flex items-center gap-2 text-sm mt-1">
                <Home size={14} className="text-green-600" />
                {isEditingAddress ? (
                  <div className="flex items-center gap-2 w-full max-w-xs">
                    <input 
                      type="text" 
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      placeholder="Enter Farm/Delivery Address"
                      className="flex-1 p-1 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    <button onClick={handleSaveAddress} className="bg-green-600 text-white p-1 rounded hover:bg-green-700">
                      <Save size={14} />
                    </button>
                    <button onClick={() => setIsEditingAddress(false)} className="bg-gray-200 text-gray-600 p-1 rounded hover:bg-gray-300">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingAddress(true)}>
                    <span className={`font-medium ${currentUser.address ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                      {currentUser.address || 'Click to add Farm Address'}
                    </span>
                    <Pencil size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                  </div>
                )}
             </div>
          </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <button 
             onClick={() => setShowAgentModal(true)}
             className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 flex items-center gap-2"
          >
             <Phone size={16} /> Call Agent Help
          </button>
          <div className="bg-green-50 px-6 py-3 rounded-lg border border-green-100 text-center flex-1 md:flex-none">
            <p className="text-xs text-green-800 uppercase font-semibold">Total Revenue</p>
            <p className="text-2xl font-bold text-green-700">₹ {totalEarnings}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COL: SCHEMES & AGENT */}
        <div className="space-y-6">
          {/* ENHANCED GOVERNMENT SCHEMES WIDGET */}
          <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                <Landmark size={20} /> Gov. Schemes
              </h3>
              <div className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full uppercase tracking-tighter">
                Live Verification
              </div>
            </div>
            
            <div className="mb-6 p-3 bg-white rounded-lg border border-orange-200 shadow-inner">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Land Profile</span>
                <span className="text-lg font-black text-orange-600">{userLandSize} <span className="text-xs font-normal text-gray-400">Acres</span></span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full transition-all duration-1000" 
                  style={{ width: `${Math.min((userLandSize / 10) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 italic">Based on your verified revenue department records.</p>
            </div>

            <div className="space-y-4">
              {GOVERNMENT_SCHEMES.map(scheme => {
                const isEligible = userLandSize >= scheme.minLandAcres;
                const progress = scheme.minLandAcres > 0 ? (userLandSize / scheme.minLandAcres) * 100 : 100;
                
                return (
                  <div key={scheme.id} className={`group relative p-4 rounded-xl border transition-all duration-300 ${isEligible ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-90 grayscale-[0.5]'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-gray-800 group-hover:text-orange-900">{scheme.schemeName}</h4>
                      {isEligible ? (
                        <CheckCircle size={18} className="text-green-500 flex-shrink-0 animate-in zoom-in" />
                      ) : (
                        <ShieldCheck size={18} className="text-gray-300 flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-[11px] leading-relaxed text-gray-600 mb-3">{scheme.benefit}</p>
                    
                    {/* Why Section */}
                    <div className={`mt-3 pt-3 border-t text-[10px] ${isEligible ? 'border-green-50' : 'border-gray-200'}`}>
                      <div className="flex justify-between mb-1.5">
                        <span className="font-bold text-gray-500 uppercase">Requirement</span>
                        <span className="text-gray-900 font-semibold">{scheme.minLandAcres > 0 ? `Min. ${scheme.minLandAcres} Acres` : 'No Land Limit'}</span>
                      </div>
                      
                      {isEligible ? (
                        <div className="flex items-center gap-1.5 text-green-700 font-bold bg-green-50 px-2 py-1.5 rounded border border-green-100">
                          <CheckCircle size={12} /> Eligible: Land limit satisfied
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-2 py-1.5 rounded border border-red-100">
                            <XCircle size={12} /> Ineligible: Need {scheme.minLandAcres - userLandSize} more acres
                          </div>
                          <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                            <div className="bg-orange-400 h-full" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AGENT INFO BOX */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
             <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2 mb-2">
              <Phone size={20} /> Your Local Agent
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              Need help with scheme applications? Call your village agent.
            </p>
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-blue-200">
              <div className="bg-blue-100 p-2 rounded-full">
                <UserIcon size={20} className="text-blue-700" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-800">{myAgent.name}</div>
                <div className="text-xs text-gray-500">{myAgent.contactNumber}</div>
              </div>
              <button 
                onClick={() => setShowAgentModal(true)}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
              >
                <Phone size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE & RIGHT: PRODUCT MANAGEMENT */}
        <div className="lg:col-span-2 space-y-8">
           {/* ADD PRODUCT */}
           <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" /> List New Produce
            </h3>
            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vegetable</label>
                  <select 
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                    value={productName}
                    onChange={handleProduceChange}
                  >
                    {AVAILABLE_PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* IMAGE SELECTION - MULTIPLE IMAGES */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <ImageIcon size={14} /> Produce Images
                </label>
                
                {/* Thumbnails */}
                <div className="flex flex-wrap gap-3 mb-4">
                    {productImages.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 group">
                            <img src={img} className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-200" alt="product" />
                            {productImages.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                                >
                                    <X size={12} />
                                </button>
                            )}
                            {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] text-center py-0.5 rounded-b-lg backdrop-blur-sm">Main</span>}
                        </div>
                    ))}
                </div>

                {/* URL Input */}
                <div className="flex gap-2">
                     <div className="flex-1 relative">
                        <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            value={currentInputUrl}
                            onChange={(e) => setCurrentInputUrl(e.target.value)}
                            placeholder="Paste image URL..."
                            className="w-full pl-9 pr-2 py-2 border rounded-md text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddImage();
                                }
                            }}
                        />
                     </div>
                     <button 
                        type="button"
                        onClick={handleAddImage}
                        disabled={!currentInputUrl}
                        className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                     >
                        Add
                     </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                   * The first image will be used as the main cover. You can add multiple images.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹/kg)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="20"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="100"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition-colors shadow-md">
                Submit for Approval
              </button>
            </form>
          </div>

          {/* LISTINGS */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Your Listings</h3>
            {myProducts.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl text-gray-500 border border-dashed border-gray-300">
                No products listed yet.
              </div>
            ) : (
              myProducts.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group">
                       <img src={product.images[0]} className="w-full h-full object-cover" alt={product.productName} />
                       {product.images.length > 1 && (
                         <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded-tl-md">
                           +{product.images.length - 1}
                         </div>
                       )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg text-gray-800">{product.productName}</h4>
                        {getStatusBadge(product.status)}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 gap-2">
                        <span>{product.quantityAvailable} kg</span>
                        <span>•</span>
                        <span>₹{product.pricePerKg}/kg</span>
                        {product.seasonTag === 'High Demand' && (
                          <span className="text-orange-600 font-bold flex items-center gap-1 bg-orange-50 px-1 rounded">
                            <TrendingUpIcon /> High Demand
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          <Calendar size={12} className="text-green-600"/> Harvest: {product.harvestDate}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          <MapPin size={12} className="text-red-500" /> {product.villageName}
                        </span>
                      </div>

                      {product.adminSuggestedPrice && (
                        <div className="text-xs text-blue-600 mt-2 font-medium">
                          * Admin adjusted price to market rate
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <button 
                      onClick={() => handleShare(product)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all"
                      title="Share Listing"
                    >
                      <Share2 size={18} />
                    </button>
                    
                    {product.status === 'pending' && (
                      <button 
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                        title="Edit Pending Listing"
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Pencil size={20} className="text-blue-600" /> Edit Listing
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Produce</label>
                <div className="p-2 bg-gray-100 rounded text-gray-600 font-medium">{editingProduct.productName}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹/kg)</label>
                   <input 
                     type="number" 
                     className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     value={editingProduct.pricePerKg}
                     onChange={(e) => setEditingProduct({...editingProduct, pricePerKg: Number(e.target.value)})}
                     required
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Quantity (kg)</label>
                   <input 
                     type="number" 
                     className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     value={editingProduct.quantityAvailable}
                     onChange={(e) => setEditingProduct({...editingProduct, quantityAvailable: Number(e.target.value)})}
                     required
                   />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Harvest Date</label>
                <input 
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={editingProduct.harvestDate}
                  onChange={(e) => setEditingProduct({...editingProduct, harvestDate: e.target.value})}
                  required 
                />
              </div>

              <div className="flex gap-3 mt-6 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 flex justify-center items-center gap-2"
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AGENT MODAL */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Phone className="text-blue-600" /> Call Agent {myAgent.name}?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Your village agent is available for on-call assistance with scheme applications and listing your harvest.
            </p>
            <div className="bg-blue-50 p-4 rounded-xl font-mono text-center text-xl mb-6 font-bold text-blue-700 border border-blue-100">
              {myAgent.contactNumber}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowAgentModal(false)} 
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <a 
                href={`tel:${myAgent.contactNumber}`}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 text-center transition-colors"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const TrendingUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);
