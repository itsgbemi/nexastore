import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function CheckoutForm({ product, onSuccess, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const initializePayment = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.phone) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          amount: product.price,
          metadata: {
            product_name: product.name,
            customer_name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            address: formData.address
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        // Initialize Paystack payment
        if (window.PaystackPop) {
          const handler = window.PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
            email: formData.email,
            amount: product.price * 100, // Convert to kobo
            currency: 'NGN',
            ref: data.reference,
            metadata: {
              custom_fields: [
                {
                  display_name: "Product",
                  variable_name: "product",
                  value: product.name
                },
                {
                  display_name: "Customer Name",
                  variable_name: "customer_name",
                  value: `${formData.firstName} ${formData.lastName}`
                }
              ]
            },
            callback: function(response) {
              // Payment successful
              onSuccess({
                reference: response.reference,
                product: product.name,
                amount: product.price,
                customer: `${formData.firstName} ${formData.lastName}`,
                email: formData.email
              })
            },
            onClose: function() {
              toast.error('Payment was not completed')
            }
          })
          handler.openIframe()
        }
      } else {
        toast.error('Failed to initialize payment')
      }
    } catch (error) {
      toast.error('An error occurred while processing payment')
      console.error('Payment error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="checkout-form">
      <h2>
        <i className="fas fa-credit-card"></i>
        Checkout - {product.name}
      </h2>

      <div className="form-group">
        <label htmlFor="email">Email Address *</label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-input"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="form-input"
            placeholder="John"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className="form-input"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number *</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="form-input"
          placeholder="+234 800 000 0000"
          value={formData.phone}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="address">Delivery Address</label>
        <textarea
          id="address"
          name="address"
          className="form-input"
          placeholder="Enter your delivery address..."
          rows="3"
          value={formData.address}
          onChange={handleInputChange}
          style={{ borderRadius: '15px', resize: 'vertical' }}
        />
      </div>

      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="summary-row">
          <span>Product:</span>
          <span>{product.name}</span>
        </div>
        <div className="summary-row">
          <span>Amount:</span>
          <span className="price">₦{product.price.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isProcessing}
        >
          <i className="fas fa-arrow-left"></i>
          Back
        </button>
        
        <button
          className="btn btn-primary btn-full"
          onClick={initializePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <i className="fas fa-spinner loading-spinner"></i>
              Processing...
            </>
          ) : (
            <>
              <i className="fas fa-lock"></i>
              Pay ₦{product.price.toLocaleString()}
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .order-summary {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 15px;
          margin-top: 1rem;
        }
        .order-summary h3 {
          margin-bottom: 1rem;
          color: #1e293b;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          color: #64748b;
        }
        .summary-row .price {
          font-weight: 700;
          color: #ea580c;
          font-size: 1.2rem;
        }
      `}</style>

      {/* Load Paystack inline script */}
      <script src="https://js.paystack.co/v1/inline.js" async></script>
    </div>
  )
}
