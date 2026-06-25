import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { FarmerDashboard } from './components/FarmerDashboard';
import { ConsumerDashboard } from './components/ConsumerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { InfieldStore } from './components/InfieldStore';
import { ProductDetail } from './components/ProductDetail';
import { Product, User, ProductStatus, AuditLog, AuditAction, GeoLocation, Order, ToastMessage, AnalyticsData } from './types';
import { MOCK_PRODUCTS, INITIAL_USERS } from './constants';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [marketMode, setMarketMode] = useState<'infield' | 'outfield'>('outfield');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // --- TOAST SYSTEM ---
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // --- DEMO RESET SYSTEM ---
  const handleResetDemo = () => {
    if (!window.confirm("Are you sure? This will wipe all current orders, logs, and reset products to default.")) return;
    
    setProducts(MOCK_PRODUCTS);
    setOrders([]);
    setAuditLogs([]);
    localStorage.removeItem('krishi_orders');
    localStorage.removeItem('krishi_audit_logs');
    // We keep users for convenience, or could reset them too
    handleLogAudit('DEMO_RESET', currentUser?.name || 'Admin', 'System', 'Full System Reset');
    showToast('Demo environment reset successfully', 'success');
  };

  // --- ANALYTICS CALCULATION ---
  const analyticsData: AnalyticsData = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrders = orders.length;
    const activeFarmers = new Set(products.map(p => p.farmerName)).size;
    const activeConsumers = new Set(orders.map(o => o.buyerId)).size;
    
    const productCounts: Record<string, number> = {};
    orders.forEach(o => {
      // Find product name efficiently
      const pName = products.find(p => p.id === o.productId)?.productName || 'Unknown Item';
      productCounts[pName] = (productCounts[pName] || 0) + 1;
    });

    const topProducts = Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const bulkInquiries = auditLogs.filter(l => l.action === 'BULK_INQUIRY').length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      activeFarmers,
      activeConsumers,
      topProducts,
      bulkInquiries,
      avgOrderValue
    };
  }, [orders, products, auditLogs]);


  // Detect Location on Start or User Change
  useEffect(() => {
    if ("geolocation" in navigator && currentUser && !currentUser.location) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLoc: GeoLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            village: currentUser.village || 'Detected Location'
          };
          setCurrentUser(prev => prev ? { ...prev, location: userLoc } : null);
        },
        (error) => {
          console.warn("Geolocation access denied or unavailable", error);
        }
      );
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const storedLogs = localStorage.getItem('krishi_audit_logs');
    if (storedLogs) setAuditLogs(JSON.parse(storedLogs));
    
    const storedOrders = localStorage.getItem('krishi_orders');
    if (storedOrders) setOrders(JSON.parse(storedOrders));
  }, []);

  const handleLogAudit = (action: AuditAction, performedBy: string, targetEntity?: string, details?: string) => {
    const newLog: AuditLog = {
      id: Date.now().toString() + Math.random(),
      timestamp: Date.now(),
      action,
      performedBy,
      targetEntity,
      details,
      isHighRisk: action.includes('FAILED') || action === 'DEMO_RESET'
    };
    
    setAuditLogs(prevLogs => {
      const updatedLogs = [newLog, ...prevLogs];
      localStorage.setItem('krishi_audit_logs', JSON.stringify(updatedLogs));
      return updatedLogs;
    });
  };

  // Session Timeout Logic
  useEffect(() => {
    if (!currentUser) return;

    const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes for demo
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleSessionTimeout = () => {
      handleLogAudit('SESSION_TIMEOUT', currentUser.name, 'System', 'Auto-logout due to inactivity');
      setCurrentUser(null);
      localStorage.removeItem('krishi_user');
      sessionStorage.removeItem('krishi_user');
      showToast('Session timed out', 'info');
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleSessionTimeout, TIMEOUT_DURATION);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Attach listeners to window to catch all activity
    activityEvents.forEach(event => window.addEventListener(event, resetTimer));
    
    // Initialize timer
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [currentUser]);

  const handleLogin = (user: User, rememberMe: boolean) => {
    setCurrentUser(user);
    if (rememberMe) localStorage.setItem('krishi_user', JSON.stringify(user));
    else sessionStorage.setItem('krishi_user', JSON.stringify(user));
    handleLogAudit('LOGIN_SUCCESS', user.name, 'System');
    showToast(`Welcome back, ${user.name}`, 'success');
  };

  const handleLogout = (reason?: string) => {
    if (currentUser) handleLogAudit('LOGOUT', currentUser.name, 'System', reason || 'User initiated');
    setCurrentUser(null);
    localStorage.removeItem('krishi_user');
    sessionStorage.removeItem('krishi_user');
    if (reason) showToast(reason, 'info');
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem('krishi_user', JSON.stringify(updatedUser));
    showToast('Profile updated', 'success');
  };

  // Modified to support both Market and Infield orders
  const handlePlaceOrder = (productId: string, quantity: number, type: 'market' | 'infield' = 'market', shopId?: string): string => {
    if (!currentUser) return '';
    
    let price = 0;
    let productNameForAudit = '';

    if (type === 'market') {
      const product = products.find(p => p.id === productId);
      if (!product) return '';
      price = product.adminSuggestedPrice || product.pricePerKg;
      productNameForAudit = product.productName;
    } else {
      productNameForAudit = `Infield Item ${productId}`;
    }

    const orderId = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const newOrder: Order = {
      id: orderId,
      productId,
      type,
      shopId,
      buyerId: currentUser.id,
      quantity,
      totalPrice: price * quantity, // Note: This might be 0 if price lookup failed here, usually passed or verified.
      status: 'Placed',
      timestamp: Date.now()
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('krishi_orders', JSON.stringify(updatedOrders));
    handleLogAudit('ORDER_PLACED', currentUser.name, productNameForAudit, `Qty: ${quantity}, Type: ${type}`);
    showToast('Order placed successfully!', 'success');
    
    return orderId;
  };

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    handleLogAudit('PRODUCT_UPDATE', currentUser?.name || 'Unknown', updatedProduct.productName, 'Listing edited');
    showToast('Product updated', 'success');
  };

  const handleUpdateStatus = (productId: string, status: ProductStatus, suggestedPrice?: number) => {
    setProducts(prevProducts => prevProducts.map(p => {
      if (p.id === productId) {
        handleLogAudit('ADMIN_ACTION', currentUser?.name || 'Admin', p.productName, `Status: ${status}`);
        return { ...p, status, adminSuggestedPrice: suggestedPrice };
      }
      return p;
    }));
    showToast(`Product ${status}`, 'info');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      {/* GLOBAL TOAST CONTAINER */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-full duration-300 ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            <span className="text-sm font-semibold">{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-2 hover:opacity-70">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {!currentUser ? (
         <AuthScreen onLogin={handleLogin} onLogAudit={handleLogAudit} />
      ) : currentUser.role === 'admin' ? (
        <AdminDashboard 
          products={products} 
          auditLogs={auditLogs}
          analyticsData={analyticsData}
          onUpdateStatus={handleUpdateStatus} 
          onLogout={() => handleLogout()}
          onResetDemo={handleResetDemo}
        />
      ) : (
        <>
          <Header 
            goHome={() => {
              setSelectedProduct(null);
              setMarketMode('outfield');
            }}
            mode={marketMode}
            onToggleMode={(m) => {
              setSelectedProduct(null);
              setMarketMode(m);
            }}
          />
          
          <main className="container mx-auto pb-12 pt-6 px-4">
            {selectedProduct ? (
              <ProductDetail 
                product={selectedProduct}
                userLocation={currentUser.location}
                onBack={() => setSelectedProduct(null)}
                onPlaceOrder={(pid, qty) => handlePlaceOrder(pid, qty, 'market')}
                similarProducts={products.filter(p => 
                  p.category === selectedProduct.category && 
                  p.id !== selectedProduct.id && 
                  p.status === 'approved'
                ).slice(0, 4)}
                onSelectProduct={setSelectedProduct}
              />
            ) : (
              <>
                {marketMode === 'infield' && (
                  <InfieldStore 
                    userLocation={currentUser.location}
                    onPlaceOrder={handlePlaceOrder}
                    showToast={showToast}
                  />
                )}
                {marketMode === 'outfield' && (
                  <>
                    {currentUser.role === 'farmer' && (
                      <FarmerDashboard 
                        products={products} 
                        onAddProduct={(p) => setProducts([...products, p])}
                        onEditProduct={handleEditProduct}
                        currentUser={currentUser}
                        onUpdateUser={handleUpdateUser}
                      />
                    )}
                    {currentUser.role === 'consumer' && (
                      <ConsumerDashboard 
                        products={products} 
                        onSelectProduct={setSelectedProduct}
                        userLocation={currentUser.location}
                        onLogAudit={handleLogAudit}
                        showToast={showToast}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </main>
        </>
      )}
    </div>
  );
}