import { NextResponse } from 'next/server'
import fetch from 'node-fetch'

const API_URL = "https://api-inference.huggingface.co/models/XLabs-AI/flux-RealismLora"
const HUGGING_FACE_API_KEY = process.env.HUGGINGFACE_KEY

export async function POST(req: Request) {
  const { prompt } = await req.json()
  console.log('Received prompt:', prompt)

  try {
    console.log('Sending request to Hugging Face API')
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hugging Face API error:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    console.log('Received response from Hugging Face API')
    const imageBuffer = await response.buffer()
    const base64 = imageBuffer.toString('base64')
    const imageUrl = `data:image/jpeg;base64,${base64}`

    console.log('Image generated successfully')
    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}