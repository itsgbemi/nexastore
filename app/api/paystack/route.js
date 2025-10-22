import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, amount, metadata } = body

    // Validate required fields
    if (!email || !amount) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and amount are required' 
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please provide a valid email address' 
        },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount < 100) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Amount must be at least ₦100' 
        },
        { status: 400 }
      )
    }

    // Check if Paystack secret key is configured
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error('PAYSTACK_SECRET_KEY is not configured')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment service is not configured properly' 
        },
        { status: 500 }
      )
    }

    // Generate unique reference
    const reference = `NEXA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.toUpperCase()

    console.log('Initializing Paystack payment:', {
      email,
      amount,
      reference,
      product: metadata?.product_name
    })

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo
        reference,
        currency: 'NGN',
        metadata: metadata || {},
        callback_url: `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL || 'http://localhost:3000'}/success`
      })
    })

    const data = await paystackResponse.json()

    console.log('Paystack API response:', {
      status: data.status,
      message: data.message,
      reference: data.data?.reference
    })

    if (data.status) {
      return NextResponse.json({
        success: true,
        reference: data.data.reference,
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        message: 'Payment initialized successfully'
      })
    } else {
      console.error('Paystack API error:', data.message)
      return NextResponse.json(
        { 
          success: false, 
          error: data.message || 'Failed to initialize payment' 
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Paystack API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again.' 
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Optional: Add GET method for testing the endpoint
export async function GET() {
  return NextResponse.json({ 
    message: 'Paystack Payment API',
    status: 'active',
    usage: 'Send POST request with email, amount, and metadata to initialize payment',
    example: {
      email: 'customer@example.com',
      amount: 5000,
      metadata: {
        product_name: 'Wireless Headphones',
        customer_name: 'John Doe'
      }
    }
  })
}
