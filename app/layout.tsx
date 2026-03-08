import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Currency Converter',
  description: 'Convert currencies with real-time exchange rates',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentYear = new Date().getFullYear()

  return (
    <html lang="en">
      <body className={inter.className}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <footer className="text-center text-sm text-gray-500 py-4 px-4">
          &copy; {currentYear} GoWell Technologies. All rights reserved.
        </footer>
      </body>
    </html>
  )
}