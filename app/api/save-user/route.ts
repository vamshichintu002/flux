import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'

export async function POST(req: Request) {
  const { id, email } = await req.json()

  console.log('Attempting to save user:', { id, email })

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert(
        { 
          id, 
          email, 
          last_sign_in: new Date().toISOString() 
        },
        { 
          onConflict: 'id'
        }
      )

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('User saved successfully')
    return NextResponse.json({ message: 'User saved successfully' })
  } catch (error: any) {
    console.error('Error saving user:', error)
    return NextResponse.json({ message: 'Error saving user', error: error.message }, { status: 500 })
  }
}