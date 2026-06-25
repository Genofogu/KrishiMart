import React from 'react';
import { Tractor, ShoppingBasket } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectRole: (role: 'farmer' | 'consumer') => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectRole }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-in fade-in duration-700">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Krishi-Mart</h2>
        <p className="text-gray-600">Connecting Villages Directly to Consumers</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-2xl w-full">
        {/* Farmer Button */}
        <button
          onClick={() => onSelectRole('farmer')}
          className="group relative flex flex-col items-center p-8 bg-green-50 border-2 border-green-200 rounded-2xl hover:bg-green-100 hover:border-green-500 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
            <Tractor size={48} className="text-green-700" />
          </div>
          <h3 className="text-xl font-bold text-green-900">I am a Farmer</h3>
          <p className="text-sm text-green-700 mt-2 text-center">Sell your harvest directly. No middlemen.</p>
        </button>

        {/* Consumer Button */}
        <button
          onClick={() => onSelectRole('consumer')}
          className="group relative flex flex-col items-center p-8 bg-blue-50 border-2 border-blue-200 rounded-2xl hover:bg-blue-100 hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
            <ShoppingBasket size={48} className="text-blue-700" />
          </div>
          <h3 className="text-xl font-bold text-blue-900">I am a Consumer</h3>
          <p className="text-sm text-blue-700 mt-2 text-center">Buy fresh produce. Fair prices.</p>
        </button>
      </div>
    </div>
  );
};