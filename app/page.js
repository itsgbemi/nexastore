'use client'
import { useState } from 'react'
import ProductCard from '../components/ProductCard'
import CheckoutForm from '../components/CheckoutForm'
import SuccessModal from '../components/SuccessModal'
import { Toaster, toast } from 'react-hot-toast'

const products = [
  {
    id: 1,
    name: "Wireless Pro Headphones",
    description: "Premium noise-cancelling wireless headphones with 30hr battery life and superior sound quality.",
    price: 45000,
    icon: "fa-headphones",
    features: ["30hr Battery", "Noise Cancelling", "Wireless Charging"]
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracking with heart rate monitoring, GPS, and smartphone notifications.",
    price: 35000,
    icon: "fa-clock",
    features: ["Heart Rate Monitor", "GPS Tracking", "Water Resistant"]
  },
  {
    id: 3,
    name: "Ultra HD Camera",
    description: "Professional 4K camera with advanced image stabilization and wireless connectivity.",
    price: 89000,
    icon: "fa-camera",
    features: ["4K Video", "Image Stabilization", "WiFi Connect"]
  }
]

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [transactionData, setTransactionData] = useState(null)

  const handleProductSelect = (product) => {
    setSelectedProduct(product)
  }

  const handlePaymentSuccess = (data) => {
    setTransactionData(data)
    setShowSuccessModal(true)
    setSelectedProduct(null)
  }

  return (
    <div className="container">
      <Toaster position="top-right" />
      
      <div className="header">
        <h1>NexaStore</h1>
        <p>Modern Shopping Experience</p>
      </div>

      <div className="product-grid">
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={handleProductSelect}
            isSelected={selectedProduct?.id === product.id}
          />
        ))}
      </div>

      {selectedProduct && (
        <CheckoutForm
          product={selectedProduct}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setSelectedProduct(null)}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          transactionData={transactionData}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  )
}
