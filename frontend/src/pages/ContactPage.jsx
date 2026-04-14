import React, { useState } from "react";
import { MapPin, Phone, Mail, ShieldCheck, Clock, ArrowRight, Send, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        firstName: "",
        email: "",
        subject: "General Inquiry",
        message: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate an API call
        setTimeout(() => {
            toast.success("Message sent successfully! We'll be in touch soon.");
            setForm({ firstName: "", email: "", subject: "General Inquiry", message: "" });
            setIsSubmitting(false);
        }, 1500);
    };

    const inputClass = "w-full bg-[#f2f4f7] border-none rounded-xl px-4 py-3.5 text-[14px] text-[#191c1d] outline-none focus:ring-2 focus:ring-[#003d9b]/20 transition-all placeholder:text-gray-400";
    const labelClass = "block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2";

    return (
        <div className="min-h-screen bg-[#fafafb] font-sans pb-24">
            
            {/* HERO SECTION */}
            <div className="pt-20 pb-16 px-6 max-w-7xl mx-auto">
                <p className="text-[11px] font-bold text-[#003d9b] uppercase tracking-widest mb-4">Connect With Us</p>
                <h1 className="text-[48px] md:text-[64px] font-black text-[#191c1d] tracking-tighter leading-tight mb-6">
                    Get in Touch.
                </h1>
                <p className="text-[16px] text-gray-500 max-w-xl leading-relaxed">
                    Reach out for order inquiries, technical consultation, or product support. Our tech specialists are available to assist with your requirements.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                
                {/* =========================================
                    TOP SECTION: FORM AREA
                ========================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-32 items-start">
                    
                    {/* Left: Info */}
                    <div className="lg:col-span-5 pt-4">
                        <h2 className="text-[28px] font-bold text-[#191c1d] tracking-tight mb-4">Direct Inquiry</h2>
                        <p className="text-[15px] text-gray-600 leading-relaxed mb-10">
                            Complete the form to begin your support request. A dedicated tech specialist will review your inquiry and respond within 24 hours.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-[#003d9b]/10 flex items-center justify-center text-[#003d9b] shrink-0">
                                    <ShieldCheck size={16} />
                                </div>
                                <span className="text-[14px] font-bold text-[#191c1d]">Secured & Encrypted Channel</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-[#003d9b]/10 flex items-center justify-center text-[#003d9b] shrink-0">
                                    <Clock size={16} />
                                </div>
                                <span className="text-[14px] font-bold text-[#191c1d]">Global Support 24/7</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Form Card */}
                    <div className="lg:col-span-7">
                        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Name</label>
                                        <input required name="firstName" value={form.firstName} onChange={handleChange} className={inputClass} placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Email</label>
                                        <input required type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="john@example.com" />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Subject</label>
                                    <div className="relative">
                                        <select name="subject" value={form.subject} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer pr-10`}>
                                            <option value="General Inquiry">General Inquiry</option>
                                            <option value="Order Status">Order Status & Tracking</option>
                                            <option value="Technical Support">Technical Support</option>
                                            <option value="Returns & Exchanges">Returns & Exchanges</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Message</label>
                                    <textarea 
                                        required 
                                        name="message" 
                                        value={form.message} 
                                        onChange={handleChange} 
                                        rows="5" 
                                        className={`${inputClass} resize-none`} 
                                        placeholder="Describe your requirements in detail..."
                                    ></textarea>
                                </div>

                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="bg-[#191c1d] hover:bg-[#003d9b] text-white font-bold text-[14px] px-8 py-4 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70"
                                    >
                                        {isSubmitting ? "Sending..." : "Submit Inquiry"} 
                                        {!isSubmitting && <Send size={16} className="ml-1" />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* =========================================
                    BOTTOM SECTION: LOCATION AREA
                ========================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
                    
                    {/* Left: Location Details */}
                    <div className="lg:col-span-5 order-2 lg:order-1">
                        <h2 className="text-[32px] font-bold text-[#191c1d] tracking-tight mb-4">Our Flagship.</h2>
                        <p className="text-[15px] text-gray-600 leading-relaxed mb-10">
                            Visit our primary service center in the heart of Phnom Penh for an immersive experience with our latest tech collections.
                        </p>

                        <div className="space-y-8 mb-10">
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-xl bg-[#003d9b]/10 flex items-center justify-center text-[#003d9b] shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-bold text-[#191c1d] mb-1">Phnom Penh HQ</h3>
                                    <p className="text-[14px] text-gray-500 leading-relaxed">
                                        246Eo, 246E0 Monivong Blvd<br />
                                        Sangkat Boung Raing, Khan Doun Penh<br />
                                        Phnom Penh 12211, Cambodia
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-xl bg-[#003d9b]/10 flex items-center justify-center text-[#003d9b] shrink-0">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-bold text-[#191c1d] mb-1">Direct Line</h3>
                                    <a href="tel:+855012345678" className="text-[14px] text-gray-500 hover:text-[#003d9b] transition-colors">+855 012 345 678</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-xl bg-[#003d9b]/10 flex items-center justify-center text-[#003d9b] shrink-0">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-bold text-[#191c1d] mb-1">Support Email</h3>
                                    <a href="mailto:support@itech.com" className="text-[14px] text-gray-500 hover:text-[#003d9b] transition-colors">support@itech.com</a>
                                </div>
                            </div>
                        </div>

                        {/* Updated link to open directions to Monivong Blvd address directly in Google Maps */}
                        <a 
                            href="https://www.google.com/maps/dir/?api=1&destination=246E0+Monivong+Blvd,+Sangkat+Boung+Raing,+Phnom+Penh" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[11px] font-bold text-[#003d9b] uppercase tracking-widest hover:gap-3 transition-all"
                        >
                            Get Directions <ArrowRight size={14} />
                        </a>
                    </div>

                    {/* Right: Visual/Image */}
                    <div className="lg:col-span-7 order-1 lg:order-2">
                        <div className="relative rounded-[2rem] overflow-hidden aspect-square lg:aspect-[4/3] bg-gray-100 shadow-sm">
                            
                            {/* Updated Google Maps iFrame */}
                            <iframe 
                                src="https://maps.google.com/maps?q=246E0%20Monivong%20Blvd,%20Sangkat%20Boung%20Raing,%20Phnom%20Penh&t=&z=16&ie=UTF8&iwloc=&output=embed"
                                className="absolute inset-0 w-full h-full grayscale-[20%] contrast-125"
                                style={{ border: 0 }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                title="i-Tech Headquarters Map"
                            ></iframe>
                            
                            {/* Floating Overlay Card */}
                            <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 bg-white/95 backdrop-blur px-6 py-4 rounded-2xl shadow-lg flex items-center gap-4 pointer-events-none">
                                <div className="w-10 h-10 bg-[#191c1d] rounded-full flex items-center justify-center text-white shrink-0">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <h4 className="text-[12px] font-bold text-[#191c1d] uppercase tracking-widest mb-0.5">i-Tech HQ</h4>
                                    <p className="text-[12px] text-gray-500 font-medium">Preah Monivong Blvd</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}