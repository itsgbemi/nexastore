import { useState, useEffect } from 'react'
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

  // Load Paystack script dynamically
  useEffect(() => {
    if (!window.PaystackPop) {
      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.async = true
      document.body.appendChild(script)
      
      script.onload = () => {
        console.log('Paystack script loaded successfully')
      }
      
      script.onerror = () => {
        console.error('Failed to load Paystack script')
        toast.error('Failed to load payment service')
      }
    }
  }, [])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const initializePayment = async () => {
    // Validate form fields
    if (!formData.email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    if (!formData.firstName.trim()) {
      toast.error('Please enter your first name')
      return
    }

    if (!formData.lastName.trim()) {
      toast.error('Please enter your last name')
      return
    }

    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
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
            address: formData.address,
            product_id: product.id
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        // Check if Paystack is loaded
        if (!window.PaystackPop) {
          toast.error('Payment service is still loading. Please try again.')
          setIsProcessing(false)
          return
        }

        // Initialize Paystack payment
        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          email: formData.email,
          amount: product.price * 100, // Convert to kobo
          currency: 'NGN',
          ref: data.reference,
          metadata: {
            custom_fields: [
              {
                display_name: "Product Name",
                variable_name: "product_name",
                value: product.name
              },
              {
                display_name: "Customer Name", 
                variable_name: "customer_name",
                value: `${formData.firstName} ${formData.lastName}`
              },
              {
                display_name: "Phone Number",
                variable_name: "phone",
                value: formData.phone
              }
            ]
          },
          callback: function(response) {
            // Payment successful
            console.log('Payment successful:', response)
            toast.success('Payment completed successfully!')
            
            onSuccess({
              reference: response.reference,
              product: product.name,
              amount: product.price,
              customer: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              transaction_date: new Date().toISOString()
            })
          },
          onClose: function() {
            // Payment modal closed
            console.log('Payment window closed')
            toast('Payment was not completed', {
              icon: 'ℹ️',
              duration: 4000
            })
            setIsProcessing(false)
          }
        })
        
        handler.openIframe()
      } else {
        toast.error(data.error || 'Failed to initialize payment')
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('Payment initialization error:', error)
      toast.error('An error occurred while processing payment')
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
        <label htmlFor="email">
          Email Address *
          <span className="required-asterisk">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-input"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleInputChange}
          required
          disabled={isProcessing}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">
            First Name *
            <span className="required-asterisk">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="form-input"
            placeholder="John"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            disabled={isProcessing}
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastName">
            Last Name *
            <span className="required-asterisk">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className="form-input"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            disabled={isProcessing}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="phone">
          Phone Number *
          <span className="required-asterisk">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="form-input"
          placeholder="+234 800 000 0000"
          value={formData.phone}
          onChange={handleInputChange}
          required
          disabled={isProcessing}
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
          disabled={isProcessing}
          style={{ borderRadius: '15px', resize: 'vertical' }}
        />
      </div>

      <div className="order-summary">
        <h3>
          <i className="fas fa-receipt"></i>
          Order Summary
        </h3>
        <div className="summary-row">
          <span>Product:</span>
          <span>{product.name}</span>
        </div>
        <div className="summary-row">
          <span>Unit Price:</span>
          <span>₦{product.price.toLocaleString()}</span>
        </div>
        <div className="summary-row">
          <span>Quantity:</span>
          <span>1</span>
        </div>
        <div className="summary-row total">
          <span>Total Amount:</span>
          <span className="price">₦{product.price.toLocaleString()}</span>
        </div>
      </div>

      <div className="button-group">
        <button
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isProcessing}
        >
          <i className="fas fa-arrow-left"></i>
          Back to Products
        </button>
        
        <button
          className={`btn btn-primary btn-full ${isProcessing ? 'loading' : ''}`}
          onClick={initializePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <i className="fas fa-spinner loading-spinner"></i>
              Initializing Payment...
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
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .required-asterisk {
          color: #ef4444;
          margin-left: 0.25rem;
        }
        
        .order-summary {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 15px;
          margin-top: 1rem;
          border: 1px solid #e2e8f0;
        }
        
        .order-summary h3 {
          margin-bottom: 1rem;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
          color: #64748b;
        }
        
        .summary-row:last-child {
          margin-bottom: 0;
          border-bottom: none;
        }
        
        .summary-row.total {
          font-weight: 700;
          color: #1e293b;
          font-size: 1.1rem;
          padding-top: 0.75rem;
          border-top: 2px solid #e2e8f0;
        }
        
        .summary-row .price {
          font-weight: 700;
          color: #ea580c;
          font-size: 1.2rem;
        }
        
        .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }
        
        .btn.loading {
          cursor: wait;
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .button-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
