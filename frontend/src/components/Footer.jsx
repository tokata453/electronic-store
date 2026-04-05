import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-[#191c1d]/5 pt-20 pb-10 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Top Section: Brand & Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* 1. Brand & Description */}
          <div className="flex flex-col">
            <Link to="/" className="text-2xl font-black text-[#003d9b] tracking-tight mb-6">
              i-Tech
            </Link>
            <p className="text-[13px] text-[#191c1d]/60 leading-relaxed font-medium mb-6 max-w-xs">
              Curating the future of personal technology. We provide premium, precision electronics for the modern professional.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 text-[#191c1d]/40">
              <a href="#" className="hover:text-[#003d9b] transition-colors"><Facebook size={18} strokeWidth={1.5} /></a>
              <a href="#" className="hover:text-[#003d9b] transition-colors"><Twitter size={18} strokeWidth={1.5} /></a>
              <a href="#" className="hover:text-[#003d9b] transition-colors"><Instagram size={18} strokeWidth={1.5} /></a>
              <a href="#" className="hover:text-[#003d9b] transition-colors"><Youtube size={18} strokeWidth={1.5} /></a>
            </div>
          </div>

          {/* 2. Shop Links */}
          <div className="flex flex-col">
            <h3 className="text-[11px] font-bold text-[#191c1d] uppercase tracking-[0.15em] mb-6">
              Shop Collections
            </h3>
            <ul className="flex flex-col gap-4 text-[13px] text-[#191c1d]/60 font-medium">
              <li><Link to="/category/smartphones" className="hover:text-[#003d9b] transition-colors">Smartphones</Link></li>
              <li><Link to="/category/laptops" className="hover:text-[#003d9b] transition-colors">Laptops & Computers</Link></li>
              <li><Link to="/category/audio" className="hover:text-[#003d9b] transition-colors">Premium Audio</Link></li>
              <li><Link to="/category/accessories" className="hover:text-[#003d9b] transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* 3. Client Services */}
          <div className="flex flex-col">
            <h3 className="text-[11px] font-bold text-[#191c1d] uppercase tracking-[0.15em] mb-6">
              Client Services
            </h3>
            <ul className="flex flex-col gap-4 text-[13px] text-[#191c1d]/60 font-medium">
              <li><Link to="/contact" className="hover:text-[#003d9b] transition-colors">Contact Us</Link></li>
              <li><Link to="/track-order" className="hover:text-[#003d9b] transition-colors">Track Order</Link></li>
              <li><Link to="/returns" className="hover:text-[#003d9b] transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/faq" className="hover:text-[#003d9b] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* 4. Contact Info */}
          <div className="flex flex-col">
            <h3 className="text-[11px] font-bold text-[#191c1d] uppercase tracking-[0.15em] mb-6">
              Contact Us
            </h3>
            <div className="flex flex-col gap-4 text-[13px] text-[#191c1d]/60 font-medium">
              <p className="leading-relaxed">
                123 Innovation Drive<br />
                Phnom Penh, Cambodia
              </p>
              <p>
                <a href="tel:+855012345678" className="hover:text-[#003d9b] transition-colors">+855 012 345 678</a>
              </p>
              <p>
                <a href="mailto:support@itech.com" className="hover:text-[#003d9b] transition-colors border-b border-transparent hover:border-[#003d9b] pb-0.5">
                  support@itech.com
                </a>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal (Mimicking your sketch exactly) */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[#191c1d]/10 gap-6">
          
          <div className="text-[14px] font-bold text-[#191c1d] tracking-tight">
            i-Tech Curator
          </div>

          <ul className="flex flex-wrap justify-center items-center gap-6 md:gap-10 text-[10px] font-bold text-[#191c1d]/40 uppercase tracking-[0.15em]">
            <li><Link to="/privacy" className="hover:text-[#003d9b] transition-colors">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-[#003d9b] transition-colors">Terms</Link></li>
            <li><Link to="/shipping" className="hover:text-[#003d9b] transition-colors">Shipping</Link></li>
          </ul>

          <div className="text-[10px] font-bold text-[#191c1d]/40 uppercase tracking-[0.15em]">
            &copy; {new Date().getFullYear()} I-TECH. All rights reserved.
          </div>

        </div>
      </div>
    </footer>
  );
}