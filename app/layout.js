import { Atkinson_Hyperlegible } from 'next/font/google'
import './globals.css'

const atkinson = Atkinson_Hyperlegible({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'NexaStore | Modern Shopping',
  description: 'Modern ecommerce with Paystack integration',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={atkinson.className}>
        {children}
      </body>
    </html>
  )
}
