// Import Swiper and modules

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

export default function HeroCarousel() {
    // images
    const slides = [
        { id: 1, image: "pc.jpg" },
        { id: 2, image: "rtx4090.jpg" },
        { id: 3, image: "test.webp" }
    ];
    return (
    // size control
    <div className="max-w-5xl h-125 mx-auto justify-center items-center rounded-2xl overflow-hidden">
      <Swiper

        speed={1000} // speed of transition
        spaceBetween={0}
        centeredSlides={true}
        loop={true} // loop to first image 
        autoplay={{
          delay: 4000, // display time for each image
          disableOnInteraction: false,
        }}
        pagination={{clickable: true,}}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            {/* Slide Content */}
            <div className="relative w-full h-full">
              {/* Background Image */}
              <img 
                src={slide.image} 
                alt={slide.title}
                className="w-full h-full object-cover" 
              />

            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}