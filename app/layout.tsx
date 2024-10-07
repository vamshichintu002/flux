import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import SupabaseUserProvider from '@/components/SupabaseUserProvider'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <SupabaseUserProvider>{children}</SupabaseUserProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
