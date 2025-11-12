'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MediaGalleryProps {
  photos: string[]
  title?: string
}

export function MediaGallery({ photos, title = 'Gallery' }: MediaGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No photos available</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(photo)}
              className="relative aspect-video rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all group no-print"
            >
              <Image
                src={photo}
                alt={`Gallery image ${index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 no-print"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="relative max-w-5xl w-full aspect-video">
            <Image
              src={selectedImage}
              alt="Full size image"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}

