import React from 'react';
import { FaPhoneAlt, FaFacebook, FaInstagram, FaTelegramPlane, FaYoutube } from 'react-icons/fa';

export default function TopHeaderBar() {
  return (
    <div className="w-full bg-[#f8f9fa] py-2 px-4 md:px-8 border-b border-[#191c1d]/5 flex justify-between items-center text-xs sm:text-sm">
      
      {/* Left Side: Phone Number */}
      <div className="flex items-center gap-2 font-medium">
        <FaPhoneAlt className="text-[#191c1d]/40" />
        <span className="text-[#191c1d]/70">(+855) 123 456 789</span>
      </div>

      {/* Right Side: Social Media Links */}
      <div className="flex items-center gap-3 font-medium">
        <span className="hidden sm:inline-block text-[#191c1d]/70">Social Media:</span>
        
        {/* Parent div applies the default muted color to all icons inside */}
        <div className="flex items-center gap-4 text-[#191c1d]/40">
          
          {/* Facebook */}
          <a href="#" aria-label="Facebook" className="hover:text-[#003d9b] transition-colors">
            <FaFacebook size={16} />
          </a>
          
          {/* Instagram */}
          <a href="#" aria-label="Instagram" className="hover:text-[#003d9b] transition-colors">
            <FaInstagram size={16} />
          </a>
          
          {/* Telegram */}
          <a href="#" aria-label="Telegram" className="hover:text-[#003d9b] transition-colors">
            <FaTelegramPlane size={16} />
          </a>
          
          {/* YouTube */}
          <a href="#" aria-label="YouTube" className="hover:text-[#003d9b] transition-colors">
            <FaYoutube size={16} />
          </a>
          
        </div>
      </div>

    </div>
  );
}