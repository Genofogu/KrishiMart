
import React, { useState } from 'react';
import { Product, ProductStatus, User, AuditLog, GovernmentScheme, AnalyticsData } from '../types';
import { CheckCircle, XCircle, TrendingUp, Users, Landmark, Phone, Package, Star, ShieldAlert, History, BarChart3, RefreshCw, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { MANDI_PRICES, OFFLINE_AGENTS, GOVERNMENT_SCHEMES } from '../constants';

interface AdminDashboardProps {
  products: Product[];
  auditLogs: AuditLog[];
  analyticsData: AnalyticsData;
  onUpdateStatus: (productId: string, status: ProductStatus, suggestedPrice?: number) => void;
  onLogout: () => void;
  onResetDemo: () => void;
}

type AdminTab = 'products' | 'analytics' | 'users' | 'schemes' | 'agents' | 'audit';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, auditLogs, analyticsData, onUpdateStatus, onLogout, onResetDemo }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  const pendingProducts = products.filter(p => p.status === 'pending');
  
  // MOCK USERS LIST (For Demo)
  const mockUsers: User[] = [
    { id: 'u1', name: 'Ramesh Singh', role: 'farmer', email: 'r@k.com', isVerified: true, trustScore: 4.5, totalOrders: 12, village: 'Rampur' },
    { id: 'u2', name: 'Suresh Yadav', role: 'farmer', email: 's@k.com', isVerified: false, trustScore: 2.0, totalOrders: 1, village: 'Sonpur' }, 
    { id: 'u3', name: 'Anita Desai', role: 'consumer', email: 'a@k.com', isVerified: true, trustScore: 5.0, totalOrders: 45, village: 'City Center' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 animate-in fade-in">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="text-purple-600" /> Admin Control Tower
            </h1>
            <p className="text-gray-500 text-sm">Central command for verification, prices, and security.</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button 
              onClick={onResetDemo}
              className="flex items-center gap-2 text-sm font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-lg hover:bg-orange-100 border border-orange-200 transition-colors"
            >
              <RefreshCw size={16} /> Reset Demo
            </button>
            <button onClick={onLogout} className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline px-4 py-2">
              Logout
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-2 no-scrollbar">
          <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package size={18}/>} label="Validations" count={pendingProducts.length} />
          <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 size={18}/>} label="Analytics" />
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={18}/>} label="Users" />
          <TabButton active={activeTab === 'agents'} onClick={() => setActiveTab('agents')} icon={<Phone size={18}/>} label="Agents" />
          <TabButton active={activeTab === 'schemes'} onClick={() => setActiveTab('schemes')} icon={<Landmark size={18}/>} label="Schemes" />
          <TabButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<History size={18}/>} label="Audit Logs" />
        </div>

        {/* CONTENT AREA */}
        <div className="space-y-6">
          
          {/* TAB: PRODUCT VALIDATION */}
          {activeTab === 'products' && (
            <div className="grid gap-4">
               {pendingProducts.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl text-gray-400 border-2 border-dashed border-gray-200">
                  <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
                  No pending approvals.
                </div>
              ) : (
                pendingProducts.map(product => {
                  const marketPrice = MANDI_PRICES[product.productName] || 0;
                  const isOverpriced = product.pricePerKg > marketPrice;
                  return (
                    <div key={product.id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500 flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-4 flex-1">
                        <img src={product.images[0]} alt={product.productName} className="w-20 h-20 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{product.productName}</h3>
                          <p className="text-gray-600 text-sm">Farmer: {product.farmerName} • {product.villageName}</p>
                          <p className="text-xs text-gray-500 mt-1">Stock: {product.quantityAvailable} {product.unit}</p>
                        </div>
                      </div>
                      <div className="text-right min-w-[150px]">
                        <div className={`text-2xl font-bold ${isOverpriced ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{product.pricePerKg}/kg
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Market Avg: ₹{marketPrice}</div>
                      </div>
                      <div className="flex flex-col justify-center gap-2 min-w-[180px]">
                        <button onClick={() => onUpdateStatus(product.id, 'approved')} className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm">Approve</button>
                        <button onClick={() => onUpdateStatus(product.id, 'rejected')} className="bg-gray-100 text-gray-600 px-4 py-2 rounded font-bold text-sm">Reject</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: ANALYTICS (NEW) */}
          {activeTab === 'analytics' && (
            <div className="grid gap-6 animate-in slide-in-from-bottom-4">
              {/* KPIS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <KpiCard label="Total Revenue" value={`₹${analyticsData.totalRevenue}`} trend="+12%" positive icon={<TrendingUp size={20} className="text-green-600"/>} />
                 <KpiCard label="Total Orders" value={analyticsData.totalOrders.toString()} trend="+5%" positive icon={<Package size={20} className="text-blue-600"/>} />
                 <KpiCard label="Avg Order Value" value={`₹${analyticsData.avgOrderValue.toFixed(0)}`} trend="-2%" positive={false} icon={<BarChart3 size={20} className="text-purple-600"/>} />
                 <KpiCard label="Bulk Inquiries" value={analyticsData.bulkInquiries.toString()} trend="+8%" positive icon={<Phone size={20} className="text-orange-600"/>} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* TOP PRODUCTS CHART */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Top Selling Produce</h3>
                  <div className="space-y-4">
                    {analyticsData.topProducts.length === 0 ? (
                      <p className="text-center text-gray-400 py-4">No data available</p>
                    ) : (
                      analyticsData.topProducts.map((p, i) => (
                        <div key={p.name} className="flex items-center gap-4">
                           <span className="w-6 text-sm font-bold text-gray-400">#{i+1}</span>
                           <div className="flex-1">
                             <div className="flex justify-between text-sm mb-1">
                               <span className="font-semibold text-gray-700">{p.name}</span>
                               <span className="text-gray-500">{p.count} orders</span>
                             </div>
                             <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                               <div 
                                 className="bg-green-500 h-full rounded-full" 
                                 style={{ width: `${(p.count / analyticsData.topProducts[0].count) * 100}%` }}
                               />
                             </div>
                           </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* USER ACTIVITY */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Platform Activity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                       <div className="text-3xl font-black text-blue-600 mb-1">{analyticsData.activeFarmers}</div>
                       <div className="text-xs font-bold text-blue-400 uppercase">Active Farmers</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl text-center">
                       <div className="text-3xl font-black text-purple-600 mb-1">{analyticsData.activeConsumers}</div>
                       <div className="text-xs font-bold text-purple-400 uppercase">Active Buyers</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">System Health</h4>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-sm">
                         <span className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> API Uptime</span>
                         <span className="font-mono font-bold text-green-600">99.9%</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                         <span className="flex items-center gap-2"><ShieldAlert size={14} className="text-orange-500"/> Failed Logins (24h)</span>
                         <span className="font-mono font-bold text-orange-600">3</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">User</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Trust</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map(user => (
                    <tr key={user.id} className="border-b border-gray-100">
                      <td className="p-4 font-bold">{user.name}</td>
                      <td className="p-4 capitalize">{user.role}</td>
                      <td className="p-4 flex items-center gap-1"><Star size={12}/> {user.trustScore}</td>
                      <td className="p-4"><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Verified</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: AGENTS */}
          {activeTab === 'agents' && (
             <div className="grid md:grid-cols-2 gap-6">
              {OFFLINE_AGENTS.map(agent => (
                <div key={agent.id} className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                  <h3 className="font-bold text-lg">{agent.name}</h3>
                  <p className="text-sm text-gray-500">Village: {agent.assignedVillage}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB: SCHEMES */}
          {activeTab === 'schemes' && (
             <div className="space-y-4">
               {GOVERNMENT_SCHEMES.map(scheme => (
                 <div key={scheme.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500">
                   <h3 className="font-bold">{scheme.schemeName}</h3>
                   <p className="text-sm text-gray-600">{scheme.benefit}</p>
                 </div>
               ))}
             </div>
          )}

          {/* TAB: AUDIT LOGS (NEW) */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                 <ShieldAlert className="text-gray-500" size={20} />
                 <h3 className="font-bold text-gray-700">System Activity Logs</h3>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="p-3 text-xs font-bold text-gray-500 uppercase">Time</th>
                      <th className="p-3 text-xs font-bold text-gray-500 uppercase">Action</th>
                      <th className="p-3 text-xs font-bold text-gray-500 uppercase">Actor</th>
                      <th className="p-3 text-xs font-bold text-gray-500 uppercase">Target / Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-gray-500">No activity recorded yet.</td></tr>
                    ) : (
                      auditLogs.map(log => (
                        <tr key={log.id} className={`border-b border-gray-100 hover:bg-gray-50 font-mono text-sm ${log.isHighRisk ? 'bg-red-50' : ''}`}>
                          <td className="p-3 text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                          <td className="p-3 font-bold text-gray-800">
                            <span className={`px-2 py-1 rounded text-xs ${
                              log.isHighRisk ? 'bg-red-200 text-red-900 border border-red-300' : 
                              log.action.includes('ADMIN') ? 'bg-purple-100 text-purple-700' : 
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 text-gray-700">{log.performedBy}</td>
                          <td className="p-3 text-gray-600">
                            {log.targetEntity && <span className="font-semibold">{log.targetEntity}: </span>}
                            {log.details}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label, count }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
      active 
        ? 'bg-purple-600 text-white shadow-md' 
        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
    }`}
  >
    {icon} {label}
    {count > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">{count}</span>}
  </button>
);

const KpiCard = ({ label, value, trend, positive, icon }: any) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <div className="bg-gray-50 p-2 rounded-lg">{icon}</div>
      <div className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
        {positive ? <ArrowUp size={10}/> : <ArrowDown size={10}/>} {trend}
      </div>
    </div>
    <div className="text-2xl font-black text-gray-900">{value}</div>
    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{label}</div>
  </div>
);
