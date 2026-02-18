import HeroCarousel from "./components/HeroCarousel"
import Marquee from "./components/Marquee"


export default function App() {
  return (
    <div className="min-h-screen">
      <h1>Electronic store</h1>
      <HeroCarousel />
      <Marquee />
    </div>
  )
}