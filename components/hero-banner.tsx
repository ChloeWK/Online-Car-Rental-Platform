"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BannerImage {
  src: string
  alt: string
}

interface HeroBannerProps {
  className?: string
  children?: React.ReactNode
}

export default function HeroBanner({ className, children }: HeroBannerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Banner images - scenic roads and landscapes
  const bannerImages: BannerImage[] = [
    {
      src: "/banner-1.png",
      alt: "Scenic mountain road with luxury car",
    },
    {
      src: "/banner-2.png",
      alt: "Coastal highway with ocean view",
    },
    {
      src: "/banner-3.png",
      alt: "Desert road with sunset",
    },
  ]

  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage()
    }, 6000)

    return () => clearInterval(interval)
  }, [currentImageIndex])

  const nextImage = () => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bannerImages.length)

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }

  const prevImage = () => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? bannerImages.length - 1 : prevIndex - 1))

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }

  return (
    <div className={cn("relative w-full h-[500px] md:h-[600px] overflow-hidden", className)}>
      {/* Image Carousel */}
      {bannerImages.map((image, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 w-full h-full transition-opacity duration-1000",
            index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0",
          )}
        >
          <Image
            src={image.src || "/placeholder.svg"}
            alt={image.alt}
            fill
            priority={index === 0}
            className="object-cover"
          />
        </div>
      ))}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-20" />

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 text-white hover:bg-black/20 h-10 w-10 rounded-full"
        onClick={prevImage}
        disabled={isTransitioning}
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">Previous image</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 text-white hover:bg-black/20 h-10 w-10 rounded-full"
        onClick={nextImage}
        disabled={isTransitioning}
      >
        <ChevronRight className="h-6 w-6" />
        <span className="sr-only">Next image</span>
      </Button>

      {/* Image Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {bannerImages.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all",
              index === currentImageIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/80",
            )}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true)
                setCurrentImageIndex(index)
                setTimeout(() => setIsTransitioning(false), 500)
              }
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Content Container */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4">{children}</div>
    </div>
  )
}
