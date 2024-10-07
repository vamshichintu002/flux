'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabaseClient'
import { getImages } from '@/lib/supabase'

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      fetchHistory()
    }
  }, [user])

  const fetchHistory = async () => {
    if (user) {
      const images = await getImages(user.id)
      setHistory(images)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setImageUrl('')  // Clear previous image

    try {
      console.log('Sending request to generate image')
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.imageUrl) {
        throw new Error('No image URL in response')
      }

      console.log('Image generated successfully')
      setImageUrl(data.imageUrl)

      if (user) {
        // Convert base64 to blob
        const base64Response = await fetch(data.imageUrl)
        const blob = await base64Response.blob()

        // Generate a unique filename
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`

        // Upload the image to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('generated-images')
          .upload(`${user.id}/${filename}`, blob, {
            contentType: 'image/jpeg'
          })

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`)
        }

        // Get the public URL of the uploaded image
        const { data: publicUrlData } = supabase.storage
          .from('generated-images')
          .getPublicUrl(`${user.id}/${filename}`)

        const publicUrl = publicUrlData.publicUrl

        // Store the image metadata in Supabase
        const { error: storeError } = await supabase
          .from('generated_images')
          .insert([
            { 
              user_id: user.id, 
              image_url: publicUrl, 
              prompt: prompt 
            }
          ])

        if (storeError) {
          throw new Error(`Failed to store image metadata: ${storeError.message}`)
        }

        console.log('Image uploaded and metadata stored successfully')
        fetchHistory()
      }

      // If we've made it this far, the image was successfully generated and saved
      console.log('Image processing completed successfully')
    } catch (error: unknown) {
      console.error('Error processing image:', error)
      if (error instanceof Error) {
        alert(`Failed to process image: ${error.message}`)
      } else {
        alert('An unknown error occurred while processing the image')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            Enter your prompt
          </label>
          <input
            type="text"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="A futuristic city with flying cars"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Image'}
        </button>
      </form>
      {imageUrl && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Generated Image</h2>
          <img src={imageUrl} alt="Generated image" className="w-full rounded-md shadow-lg" />
          <a
            href={imageUrl}
            download="generated-image.jpg"
            className="mt-4 inline-block bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            Download Image
          </a>
        </div>
      )}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Your Generated Images</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {history.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={image.image_url} alt={image.prompt} className="w-full h-48 object-cover" />
              <div className="p-4">
                <p className="text-sm text-gray-600 truncate">{image.prompt}</p>
                <a
                  href={image.image_url}
                  download={`generated-image-${image.id}.jpg`}
                  className="mt-2 inline-block text-blue-600 hover:text-blue-800"
                >
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}