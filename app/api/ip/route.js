import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // Get client IP from request headers
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const vercelIp = request.headers.get('x-vercel-ip')
    
    // Get outbound IP by calling external service
    const ipResponse = await fetch('https://api.ipify.org?format=json')
    const ipData = await ipResponse.json()
    
    return NextResponse.json({
      outbound_ip: ipData.ip,
      headers: {
        'x-forwarded-for': forwarded,
        'x-real-ip': realIp,
        'x-vercel-ip': vercelIp
      },
      note: 'Add the "outbound_ip" to Paystack whitelist'
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to detect IP',
      details: error.message
    }, { status: 500 })
  }
}
