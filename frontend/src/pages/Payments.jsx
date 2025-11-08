// frontend/src/pages/Payments.jsx
import { IndianRupee, CreditCard } from 'lucide-react';

export default function Payments() {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
          <CreditCard className="text-purple-600" />
          Payment Methods
        </h1>
        <div className="bg-white rounded-xl shadow p-6 space-y-4 text-sm text-gray-700">
          <p>
            Add bank accounts or UPI IDs here when payments are integrated.
          </p>
          <ul className="list-disc list-inside text-xs text-gray-600">
            <li>All amounts will be processed in ₹ (INR).</li>
            <li>For now, this page is a placeholder with real navigation.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
