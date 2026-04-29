import * as React from "react"
import Autoplay from "embla-carousel-autoplay"

import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const slides = [ 
  // 1920x1080p images
  {
    id: 1,
    title: "Summer Collection",
    description: "Discover our latest summer styles designed for comfort and elegance.",
    cta: "Shop Now",
    image: "/Carousal/Lenovo.jpg",
  },
  {
    id: 2,
    title: "New Arrivals",
    description: "Be the first to explore our brand new inventory hitting the shelves today.",
    cta: "View New",
    image: "/Carousal/headphones.jpg",
  },
  {
    id: 3,
    title: "Exclusive Offers",
    description: "Members get up to 50% off on selected items this weekend only.",
    cta: "Join Now",
    image: "/Carousal/Phone.jpg",
  },
  {
    id: 4,
    title: "Exclusive Offers",
    description: "Members get up to 50% off on selected items this weekend only.",
    cta: "Join Now",
    image: "/Carousal/Logitech-Gaming.jpg",
  }
]

export default function HeroCarousel () {
  // Autoscroll for images
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true }) // time between each image
  )

  return (
    <div className="mx-auto w-full max-w-8xl px-4 py-6">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop} //Stop on hover
        onMouseLeave={plugin.current.reset}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className="relative w-full h-160 overflow-hidden rounded-lg">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  )
}
