import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email, amount, metadata } = await request.json()

    // Generate unique reference
    const reference = `TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

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
        metadata,
        callback_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/success`
      })
    })

    const data = await paystackResponse.json()

    if (data.status) {
      return NextResponse.json({
        success: true,
        reference: data.data.reference,
        authorization_url: data.data.authorization_url
      })
    } else {
      return NextResponse.json(
        { success: false, error: data.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Paystack API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
