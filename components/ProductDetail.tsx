import React, { useState } from 'react';
import { ArrowLeft, MapPin, Star, ShieldCheck, Truck, ShoppingCart, User, MessageCircle, Calendar, ChevronLeft, ChevronRight, Package, CheckCircle2, ReceiptText, Home, Share2, Download, Timer } from 'lucide-react';
import { Product, GeoLocation } from '../types';

interface ProductDetailProps {
  product: Product;
  userLocation?: GeoLocation;
  onBack: () => void;
  onPlaceOrder: (productId: string, quantity: number) => string;
  similarProducts: Product[];
  onSelectProduct: (product: Product) => void;
}

const RatingBar: React.FC<{ label: string; score: number }> = ({ label, score }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider opacity-80">
      <span>{label}</span>
      <span>{score.toFixed(1)}</span>
    </div>
    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
      <div 
        className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${(score / 5) * 100}%` }}
      />
    </div>
  </div>
);

const Step = ({ title, desc, icon: Icon, active }: { title: string; desc: string; icon: any; active: boolean }) => (
  <div className={`flex items-start gap-4 ${active ? 'opacity-100' : 'opacity-40'}`}>
    <div className={`p-2 rounded-lg ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
      <Icon size={20} />
    </div>
    <div>
      <h4 className="font-bold text-sm text-gray-800">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  </div>
);

export const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  userLocation, 
  onBack, 
  onPlaceOrder, 
  similarProducts,
  onSelectProduct
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  const calculateDistance = (loc1: GeoLocation, loc2: GeoLocation) => {
    const R = 6371;
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const distance = userLocation ? calculateDistance(userLocation, product.location) : 0;

  const getDeliveryEstimate = (dist: number) => {
    if (!userLocation) return "Location not set";
    if (dist < 10) return "Same Day Delivery";
    if (dist < 50) return "Next Day Delivery";
    return "2-3 Days Delivery";
  };

  const deliveryInfo = getDeliveryEstimate(distance);
  const avgRating = product.reviews.length > 0 
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : "No ratings";

  const handleOrder = () => {
    setIsOrdering(true);
    setTimeout(() => {
      const id = onPlaceOrder(product.id, quantity);
      setConfirmedOrderId(id);
      setIsOrdering(false);
      setOrderComplete(true);
    }, 1500);
  };

  const subRatings = product.seller.subRatings || {
    quality: product.seller.rating,
    delivery: Math.max(1, product.seller.rating - 0.5),
    communication: Math.min(5, product.seller.rating + 0.2)
  };

  if (orderComplete) {
    const totalPrice = (product.adminSuggestedPrice || product.pricePerKg) * quantity;
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in zoom-in-95 duration-500 text-gray-900">
        <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
          {/* Animated Header */}
          <div className="bg-gradient-to-br from-green-500 to-green-700 p-10 text-center text-white relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-700" />
            </div>
            
            <div className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-xl backdrop-blur-md border border-white/30">
              <CheckCircle2 size={56} />
            </div>
            <h2 className="text-4xl font-black mb-2 tracking-tight">Success!</h2>
            <p className="text-green-50 font-medium">Your order has been confirmed.</p>
          </div>
          
          <div className="p-10 space-y-8">
            {/* Receipt Summary */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <ReceiptText size={120} />
              </div>
              
              <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-6">
                <ReceiptText size={14} /> Order Receipt
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                  <span className="text-gray-500 font-medium text-sm">Order Reference</span>
                  <span className="font-mono font-black text-gray-900 bg-white px-3 py-1 rounded-lg shadow-sm border border-gray-100">
                    {confirmedOrderId}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                  <span className="text-gray-500 font-medium text-sm">Produce Details</span>
                  <span className="font-bold text-gray-900">{product.productName} × {quantity} {product.unit}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                  <span className="text-gray-500 font-medium text-sm">Estimated Delivery</span>
                  <span className="font-bold text-blue-600 flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-lg">
                    <Truck size={16} /> {deliveryInfo}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                  <span className="text-gray-500 font-medium text-sm">Delivery Village</span>
                  <span className="font-bold text-gray-900">{userLocation?.village || 'Rampur'}</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pb-1">Total Paid</span>
                  <span className="text-4xl font-black text-green-700">₹{totalPrice}</span>
                </div>
              </div>
            </div>

            {/* What's Next Progress */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                <Timer size={16} className="text-blue-500" /> Next Steps
              </h3>
              <div className="grid gap-6">
                <Step 
                  title="Preparing Harvest" 
                  desc={`Farmer ${product.farmerName} is verifying quality and packaging your produce.`} 
                  icon={Package} 
                  active={true} 
                />
                <Step 
                  title="Mandi Partner Assigned" 
                  desc="A delivery partner from the local mandi will pick up the stock." 
                  icon={Truck} 
                  active={false} 
                />
                <Step 
                  title="Doorstep Delivery" 
                  desc={`Expected arrival at your location.`} 
                  icon={Home} 
                  active={false} 
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onBack}
                className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-green-700 transition-all active:scale-[0.98] shadow-lg shadow-green-100"
              >
                <Home size={20} /> Back to Market
              </button>
              <div className="flex gap-4">
                <button className="p-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors" title="Download Receipt">
                  <Download size={20} />
                </button>
                <button className="p-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors" title="Share Impact">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
              A digital record of this transaction has been securely stored.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-green-700 font-semibold py-2 transition-all"
      >
        <ArrowLeft size={20} /> Back to Marketplace
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm group">
            <img 
              src={product.images[activeImageIndex]} 
              alt={product.productName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.images.length > 1 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                  className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white"
                >
                  <ChevronLeft size={24} className="text-gray-800" />
                </button>
                <button 
                  onClick={() => setActiveImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                  className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white"
                >
                  <ChevronRight size={24} className="text-gray-800" />
                </button>
              </div>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {product.images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all ${idx === activeImageIndex ? 'w-8 bg-green-500' : 'w-2 bg-white/60'}`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${idx === activeImageIndex ? 'border-green-500 shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-yellow-500 font-bold">
                <Star size={18} fill="currentColor" />
                <span>{avgRating}</span>
                <span className="text-gray-400 font-normal text-sm">({product.reviews.length} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-2">{product.productName}</h1>
            
            <div className="flex flex-col gap-2 mb-6 text-gray-500">
               <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span className="text-sm font-medium">{product.location.village}, {product.location.district}</span>
                {userLocation && (
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                    {distance} km away
                  </span>
                )}
              </div>
              
              {/* DISPLAY SELLER ADDRESS IF AVAILABLE */}
              {product.seller.address && (
                <div className="flex items-center gap-2 text-green-700">
                   <Home size={16} />
                   <span className="text-sm font-medium">{product.seller.address}</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-green-700">₹{product.adminSuggestedPrice || product.pricePerKg}</span>
              <span className="text-gray-400 font-medium">/ {product.unit}</span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8 border-l-4 border-green-500 pl-4 py-1 italic">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3 border border-gray-100">
                <Calendar className="text-green-600" size={24} />
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Harvested</div>
                  <div className="text-sm font-bold text-gray-800">{product.harvestDate}</div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3 border border-gray-100">
                <Truck className="text-blue-600" size={24} />
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Delivery</div>
                  <div className="text-sm font-bold text-gray-800">{deliveryInfo}</div>
                </div>
              </div>
            </div>

            {/* SELLER CARD WITH SUB-RATINGS */}
            <div className="bg-green-900 text-white p-6 rounded-2xl mb-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl border border-white/20 shadow-inner">
                    <User size={32} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase opacity-60 font-black tracking-widest mb-0.5">Verified {product.seller.type}</div>
                    <div className="font-black text-xl flex items-center gap-1.5">
                      {product.seller.name}
                      <ShieldCheck size={20} className="text-yellow-400" />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase opacity-60 font-black tracking-widest mb-0.5">Trust Score</div>
                  <div className="font-black text-3xl text-yellow-400">{product.seller.rating}<span className="text-sm text-white/60 font-normal">/5</span></div>
                </div>
              </div>

              {/* NEW SUB-RATINGS BREAKDOWN */}
              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <RatingBar label="Quality" score={subRatings.quality} />
                <RatingBar label="Delivery" score={subRatings.delivery} />
                <RatingBar label="Comm." score={subRatings.communication} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden h-12">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 hover:bg-gray-100 font-bold transition-colors"
                  >-</button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center font-bold outline-none"
                  />
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-4 hover:bg-gray-100 font-bold transition-colors"
                  >+</button>
                </div>
                <button 
                  onClick={handleOrder}
                  disabled={isOrdering}
                  className="flex-1 bg-green-600 text-white h-12 rounded-lg font-black hover:bg-green-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:bg-gray-400"
                >
                  {isOrdering ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Placing Order...
                    </div>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Buy Now (₹{(product.adminSuggestedPrice || product.pricePerKg) * quantity})
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Package size={12} /> Stock Available: {product.quantityAvailable} {product.unit}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-2">
            <MessageCircle className="text-green-600" /> Customer Reviews
          </h2>
          {product.reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
              No reviews yet. Be the first to buy and review!
            </div>
          ) : (
            <div className="space-y-6">
              {product.reviews.map(review => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-xs">
                        {review.reviewerName.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-800">{review.reviewerName}</span>
                    </div>
                    <span className="text-xs text-gray-400">{review.reviewDate}</span>
                  </div>
                  <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-2xl text-white shadow-xl h-fit">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          <h3 className="text-xl font-bold mb-4">Market Insight</h3>
          <p className="text-sm opacity-90 leading-relaxed mb-6">
            Prices for <strong>{product.productName}</strong> have seen consistent local stability. Verified locally by Mandi agents.
          </p>
          <div className="bg-white/20 p-4 rounded-xl border border-white/20">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold uppercase">Fair Index</span>
              <span className="text-2xl font-black">Good Value</span>
            </div>
            <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden">
              <div className="bg-white h-full w-[85%]" />
            </div>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-black text-gray-900 mb-8">Similar Local Produce</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map(p => (
              <div 
                key={p.id} 
                onClick={() => onSelectProduct(p)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group border border-gray-100"
              >
                <div className="aspect-[4/3] relative">
                  <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.productName} />
                  <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-black text-green-700">
                    ₹{p.pricePerKg}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 text-sm truncate">{p.productName}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                    <MapPin size={10} /> {p.villageName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};