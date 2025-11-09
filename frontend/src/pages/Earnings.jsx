// frontend/src/pages/Earnings.jsx
import { IndianRupee, TrendingUp } from 'lucide-react';

export default function Earnings({ user }) {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
          <IndianRupee size={22} className="text-purple-600" />
          Earnings Overview
        </h1>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-500">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-900">₹0</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-500">In Escrow</p>
            <p className="text-2xl font-bold text-gray-900">₹0</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 flex items-center gap-2">
            <TrendingUp className="text-green-500" />
            <div>
              <p className="text-xs text-gray-500">Next Payout</p>
              <p className="text-lg font-semibold text-gray-900">Coming soon</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-sm text-gray-600">
          Transactions & real payouts can be plugged in once payment integration is ready.
        </div>
      </div>
    </div>
  );
}
