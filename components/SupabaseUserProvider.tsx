'use client'

import { useSupabaseUser } from '@/hooks/useSupabaseUser'

export default function SupabaseUserProvider({ children }: { children: React.ReactNode }) {
  useSupabaseUser()
  return <>{children}</>
}