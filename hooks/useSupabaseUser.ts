'use client'

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function useSupabaseUser() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      const saveUser = async () => {
        console.log('Attempting to save user to Supabase:', { id: user.id, email: user.primaryEmailAddress?.emailAddress });
        try {
          const response = await fetch('/api/save-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to save user');
          }

          console.log('User saved successfully:', data);
        } catch (error) {
          console.error('Error saving user:', error);
        }
      };

      saveUser();
    }
  }, [isSignedIn, user]);
}