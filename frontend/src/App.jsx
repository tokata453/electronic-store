import HeroCarousel from "./components/HeroCarousel"
import Marquee from "./components/Marquee"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import BestSellers  from "./components/BestSellers"
import { OnSaleSection } from "./components/OnSaleProducts"
import BrowseCategories from "./components/BrowseCategories"
import Register from "./components/Register"

export default function App() {
  return (
    <div className="min-h-screen">
      {/* <Navbar />
      <HeroCarousel />
      <Marquee />
      <BestSellers />
      <OnSaleSection />
      <BrowseCategories />
      <Footer /> */}
      <Register />
    </div>
  )
}