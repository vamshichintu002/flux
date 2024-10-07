'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { getImages } from '@/lib/supabase'
import Image from 'next/image'

interface GeneratedImage {
  id: string;
  image_url: string;
  prompt: string;
}

export default function ImageGrid() {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [showUserImages, setShowUserImages] = useState(false)
  const { user, isLoaded } = useUser()

  const fetchImages = useCallback(async () => {
    try {
      const data = await getImages(showUserImages ? user?.id : undefined)
      setImages(data)
    } catch (error) {
      console.error('Error fetching images:', error)
    }
  }, [showUserImages, user])

  useEffect(() => {
    if (isLoaded) {
      fetchImages()
    }
  }, [isLoaded, fetchImages])

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">{showUserImages ? 'Your Generated Images' : 'All Generated Images'}</h2>
        <button
          onClick={() => setShowUserImages(!showUserImages)}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {showUserImages ? 'Show All Images' : 'Show My Images'}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <Image src={image.image_url} alt={image.prompt} width={300} height={192} className="w-full h-48 object-cover" />
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
  )
}