import Header from '@/components/Header'
import ImageGrid from '@/components/ImageGrid'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Flux Lora Image Gallery</h1>
        <ImageGrid />
      </div>
    </main>
  )
}
