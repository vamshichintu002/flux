import Link from 'next/link'
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs'

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Flux Lora
        </Link>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <Link href="/generate" className="text-blue-600 hover:text-blue-800">
                Generate Image
              </Link>
            </li>
            <SignedIn>
              <li>
                <UserButton afterSignOutUrl="/" />
              </li>
            </SignedIn>
            <SignedOut>
              <li>
                <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Sign Up
                </Link>
              </li>
            </SignedOut>
          </ul>
        </nav>
      </div>
    </header>
  )
}