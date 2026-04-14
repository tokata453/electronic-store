import React, { useState } from "react";
import { ChevronDown, HelpCircle, Truck, ShieldCheck, FileText, RotateCcw, Clock, CreditCard, Lock } from "lucide-react";
import { useSearchParams } from "react-router-dom";



export default function HelpCenterPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "faq";

    const [expandedFaq, setExpandedFaq] = useState(1);

    // --- STATIC DATA ---
    const categories = [
        { id: "faq", label: "General FAQ", icon: HelpCircle },
        { id: "shipping", label: "Shipping & Returns", icon: Truck },
        { id: "privacy", label: "Privacy Policy", icon: ShieldCheck },
        { id: "terms", label: "Terms of Service", icon: FileText },
    ];

    const faqs = [
        {
            id: 1,
            category: "General",
            question: "Are your products brand new and authentic?",
            answer: "Yes, absolutely. i-Tech only sources brand-new, factory-sealed electronics directly from authorized manufacturers and certified distributors. Every product comes with standard manufacturer warranties."
        },
        {
            id: 2,
            category: "General",
            question: "Do you offer technical support for purchased items?",
            answer: "We offer basic setup assistance for all purchases. For in-depth technical troubleshooting, we recommend contacting the manufacturer directly, though our team is always happy to point you in the right direction."
        },
        {
            id: 3,
            category: "Orders",
            question: "Can I modify or cancel my order after placing it?",
            answer: "Orders are processed rapidly to ensure quick delivery. You can cancel or modify your order within 1 hour of placement by contacting our support team. After that window, the order will need to be processed as a return."
        },
        {
            id: 4,
            category: "Orders",
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and offer financing options through select partners at checkout."
        }
    ];

    // --- RENDER HELPERS ---
    const renderFaqContent = () => (
        <div className="animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-[#003d9b]/10 flex items-center justify-center text-[#003d9b]">
                    <HelpCircle size={22} />
                </div>
                <h2 className="text-[28px] font-bold text-[#191c1d] tracking-tight">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
                {faqs.map((faq) => {
                    const isOpen = expandedFaq === faq.id;
                    return (
                        <div 
                            key={faq.id} 
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200"
                        >
                            <button
                                onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span className="text-[16px] font-bold text-[#191c1d] pr-4 leading-snug">
                                    {faq.question}
                                </span>
                                <ChevronDown 
                                    size={20} 
                                    className={`text-[#003d9b] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
                                />
                            </button>
                            <div 
                                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[500px] pb-6 opacity-100" : "max-h-0 opacity-0"}`}
                            >
                                <p className="text-[15px] text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderShippingContent = () => (
        <div className="animate-in fade-in duration-300 bg-white p-8 lg:p-12 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-[#003d9b]/10 flex items-center justify-center text-[#003d9b]">
                    <Truck size={22} />
                </div>
                <h2 className="text-[28px] font-bold text-[#191c1d] tracking-tight">Shipping & Returns</h2>
            </div>
            
            <div className="space-y-10 text-[15px] text-gray-600 leading-relaxed">
                <section>
                    <div className="flex items-center gap-2 mb-3 text-[#191c1d]">
                        <Clock size={20} className="text-[#003d9b]"/>
                        <h3 className="text-[18px] font-bold">Order Processing & Timelines</h3>
                    </div>
                    <p>All orders are processed within 1-2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped containing your tracking information.</p>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-3 text-[#191c1d]">
                        <Truck size={20} className="text-[#003d9b]"/>
                        <h3 className="text-[18px] font-bold">Domestic & International Shipping</h3>
                    </div>
                    <p className="mb-3">We offer flat-rate shipping options as well as expedited delivery. Shipping charges for your order will be calculated and displayed at checkout.</p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-500">
                        <li><strong className="text-gray-700">Standard Shipping:</strong> 3-5 business days (Free on orders over $500)</li>
                        <li><strong className="text-gray-700">Express Shipping:</strong> 1-2 business days ($15.00 flat rate)</li>
                        <li><strong className="text-gray-700">International Shipping:</strong> 7-14 business days (Rates vary by destination country)</li>
                    </ul>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-3 text-[#191c1d]">
                        <RotateCcw size={20} className="text-[#003d9b]"/>
                        <h3 className="text-[18px] font-bold">Return Policy</h3>
                    </div>
                    <p className="mb-3">We accept returns up to 30 days after delivery, provided the item is unused, in its original condition, and with all original packaging and accessories included. We will refund the full order amount minus the shipping costs for the return.</p>
                    <p><strong>Open-Box Electronics:</strong> Any opened electronic devices that are not defective are subject to a 15% restocking fee. Items must be wiped of any personal data and removed from any cloud accounts (e.g., iCloud, Google accounts) prior to return.</p>
                </section>
            </div>
        </div>
    );

    const renderPrivacyContent = () => (
        <div className="animate-in fade-in duration-300 bg-white p-8 lg:p-12 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-[#003d9b]/10 flex items-center justify-center text-[#003d9b]">
                    <ShieldCheck size={22} />
                </div>
                <h2 className="text-[28px] font-bold text-[#191c1d] tracking-tight">Privacy Policy</h2>
            </div>

            <div className="space-y-8 text-[15px] text-gray-600 leading-relaxed">
                <p className="font-medium text-gray-400 uppercase tracking-widest text-xs">Last updated: April 2026</p>
                
                <p>At i-Tech, we take your privacy seriously. This privacy policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our store.</p>

                <section>
                    <h3 className="text-[18px] font-bold text-[#191c1d] mb-3">1. Information We Collect</h3>
                    <p>When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, when you make a purchase, we collect your Name, Billing Address, Shipping Address, Payment Information, Email Address, and Phone Number.</p>
                </section>

                <section>
                    <h3 className="text-[18px] font-bold text-[#191c1d] mb-3">2. How We Use Your Information</h3>
                    <p className="mb-2">We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this information to:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-500">
                        <li>Communicate with you</li>
                        <li>Screen our orders for potential risk or fraud</li>
                        <li>Provide you with information or advertising relating to our products or services (only if you opt-in)</li>
                    </ul>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-3 text-[#191c1d]">
                        
                        <h3 className="text-[18px] font-bold">3. Data Security</h3>
                    </div>
                    <p>We use industry-standard encryption protocols (SSL) to protect your personal and payment data during transmission. Your credit card information is never stored on our servers; it is securely processed directly by our payment gateway providers.</p>
                </section>
            </div>
        </div>
    );

    const renderTermsContent = () => (
        <div className="animate-in fade-in duration-300 bg-white p-8 lg:p-12 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-[#003d9b]/10 flex items-center justify-center text-[#003d9b]">
                    <FileText size={22} />
                </div>
                <h2 className="text-[28px] font-bold text-[#191c1d] tracking-tight">Terms of Service</h2>
            </div>

            <div className="space-y-8 text-[15px] text-gray-600 leading-relaxed">
                <p>Welcome to i-Tech. By accessing our website and purchasing our products, you engage in our "Service" and agree to be bound by the following terms and conditions.</p>

                <section>
                    <h3 className="text-[18px] font-bold text-[#191c1d] mb-3">1. Online Store Terms</h3>
                    <p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction.</p>
                </section>

                <section>
                    <h3 className="text-[18px] font-bold text-[#191c1d] mb-3">2. Products & Pricing</h3>
                    <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.</p>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-3 text-[#191c1d]">
                        
                        <h3 className="text-[18px] font-bold">3. Accuracy of Billing and Account Information</h3>
                    </div>
                    <p>We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. You agree to provide current, complete and accurate purchase and account information for all purchases made at our store.</p>
                </section>

                <section>
                    <h3 className="text-[18px] font-bold text-[#191c1d] mb-3">4. Limitation of Liability</h3>
                    <p>In no case shall i-Tech, our directors, officers, employees, affiliates, agents, contractors, or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind arising from your use of any of the service or any products procured using the service.</p>
                </section>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fafafb] font-sans">
            
            {/* HERO SECTION - Perfectly Centered */}
            <div className="pt-16 pb-12 px-6 text-center max-w-4xl mx-auto">
                <p className="text-[11px] font-bold text-[#003d9b] uppercase tracking-widest mb-4">Help Center</p>
                <h1 className="text-[40px] md:text-[56px] font-black text-[#191c1d] tracking-tighter leading-tight mb-6">
                    How can we help?
                </h1>
                <p className="text-[16px] text-gray-500 max-w-xl mx-auto leading-relaxed">
                    Everything you need to know about our premium tech curation, from shipping logistics to technical support for your high-end devices.
                </p>
            </div>

            {/* MAIN LAYOUT 
              - Uses flex-row and justify-between to balance the three sections.
              - The left and right sidebars have identical widths, forcing the center to be perfectly symmetrical.
            */}
            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 xl:px-16 pb-32 flex flex-col lg:flex-row justify-between items-start gap-10">
                
                {/* 1. LEFT SIDEBAR */}
                <aside className="w-full lg:w-72 shrink-0 sticky top-28">
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">Categories</h3>
                    <nav className="flex flex-col gap-1.5">
                        {categories.map((cat) => {
                            const isActive = activeTab === cat.id;
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-left text-[15px] font-bold transition-all ${
                                        isActive 
                                            ? "bg-white text-[#003d9b] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100" 
                                            : "text-gray-500 hover:bg-gray-100 hover:text-[#191c1d]"
                                    }`}
                                >
                                    <Icon size={18} className={isActive ? "text-[#003d9b]" : "text-gray-400"} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* 2. CENTER CONTENT */}
                <div className="flex-1 w-full flex justify-center lg:px-10">
                    <div className="w-full max-w-3xl">
                        {activeTab === "faq" && renderFaqContent()}
                        {activeTab === "shipping" && renderShippingContent()}
                        {activeTab === "privacy" && renderPrivacyContent()}
                        {activeTab === "terms" && renderTermsContent()}
                    </div>
                </div>

                {/* 3. INVISIBLE RIGHT SIDEBAR (For Perfect Symmetry) 
                  - This takes up the exact same space as the left sidebar, ensuring 
                    the center content aligns perfectly with the centered Hero text.
                */}
                <div className="hidden lg:block w-72 shrink-0 pointer-events-none"></div>

            </div>
        </div>
    );
}