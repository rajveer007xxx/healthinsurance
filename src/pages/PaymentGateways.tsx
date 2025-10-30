import React from 'react'

const PaymentGateways: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Payment Gateways</h1>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Add Gateway
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">No payment gateways configured</p>
        <p className="text-gray-400 text-sm mt-2">Click "Add Gateway" to configure a payment gateway</p>
      </div>
    </div>
  )
}

export default PaymentGateways
