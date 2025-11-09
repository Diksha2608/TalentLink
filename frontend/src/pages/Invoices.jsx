// frontend/src/pages/Invoices.jsx
import { FileText, IndianRupee } from 'lucide-react';

export default function Invoices() {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">
          <FileText className="text-purple-600" />
          Invoices & Billing
        </h1>
        <div className="bg-white rounded-xl shadow p-6 text-sm text-gray-700">
          <p className="mb-2">
            This section will show downloadable invoices for contracts and payments.
          </p>
          <p className="text-xs text-gray-500">
            Currency: <span className="font-semibold">₹ INR</span>
          </p>
        </div>
      </div>
    </div>
  );
}
