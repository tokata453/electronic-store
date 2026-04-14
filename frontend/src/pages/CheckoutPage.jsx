import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder } from "@/services/order";
import { getCart } from "@/services/cart";
import { getUserProfile } from "@/services/user";
import { Lock, ArrowRight, CreditCard, ShieldCheck, Info } from "lucide-react";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cart, setCart] = useState(null);
  
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Cambodia", 
    cardNumber: "", 
    expiry: "",
    cvv: ""
  });

  // AUTH CHECK & DATA FETCH
  useEffect(() => {
    // 1. Immediate local check
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        const cartData = await getCart();
        setCart(cartData);
      } catch (err) {
        console.error("Could not fetch cart");
      }
    };
    
    const fetchUserProfile = async () => {
      try {
        const result = await getUserProfile();
        if (result.success && result.data.user) {
          const user = result.data.user;
          setForm(prevForm => ({
            ...prevForm,
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.email || "",
            phone: user.phone || "",
            address: user.address?.street || "",
            city: user.address?.city || "",
            state: user.address?.state || "",
            zipCode: user.address?.zipCode || ""
          }));
        }
      } catch (err) {
        // 2. Server check: Kick out if token is expired/invalid
        if (err.response?.status === 401 || err.message?.includes("401")) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchCart();
    fetchUserProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formattedItems = cart?.items?.map(item => ({
      productId: item.productId || item.product?.id,
      quantity: item.quantity
    })) || [];

    const orderPayload = {
      items: formattedItems,
      shippingAddress: {
        fullName: form.fullName,
        addressLine1: form.address, 
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        country: form.country,
        phone: form.phone
      },
      billingAddress: {
        fullName: form.fullName,
        addressLine1: form.address,
        phone: form.phone,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        country: form.country
      },
      paymentMethod: "credit_card",
      notes: "Demo order checkout"
    };

    try {
      const result = await placeOrder(orderPayload);
      if (result.success) {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to place order.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3.5 rounded-lg text-[14px] text-[#191c1d] bg-[#f2f4f7] border-none outline-none focus:ring-2 focus:ring-[#003d9b]/20 transition-all placeholder:text-gray-400";
  const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2";
  const cardClass = "bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-6";
  const stepBadgeClass = "flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#003d9b] text-white font-bold text-sm mr-4";

  return (
    <div className="min-h-screen bg-[#fafafb] font-sans pt-10 pb-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        <div className="mb-10">
          <div className="flex items-center gap-2 text-[#003d9b] text-[11px] font-bold uppercase tracking-widest mb-3">
            <Lock size={14} /> Secure Checkout
          </div>
          <h1 className="text-[36px] font-bold text-[#191c1d] tracking-tight">Review & Pay</h1>
        </div>
        
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 font-medium rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 xl:col-span-8">
            
            {/* 1. Contact Details */}
            <div className={cardClass}>
              <div className="flex items-center mb-8">
                <div className={stepBadgeClass}>1</div>
                <h2 className="text-[20px] font-bold text-[#191c1d]">Contact Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input required name="fullName" value={form.fullName} onChange={handleChange} className={inputClass} placeholder="Enter your full name" />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input required type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="Enter your email address" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Phone Number</label>
                  <input required name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="Enter your phone number" />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className={cardClass}>
              <div className="flex items-center mb-8">
                <div className={stepBadgeClass}>2</div>
                <h2 className="text-[20px] font-bold text-[#191c1d]">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="md:col-span-6">
                  <label className={labelClass}>Street Address</label>
                  <input required name="address" value={form.address} onChange={handleChange} className={inputClass} placeholder="Enter your street address" />
                </div>
                <div className="md:col-span-3">
                  <label className={labelClass}>City</label>
                  <input required name="city" value={form.city} onChange={handleChange} className={inputClass} placeholder="Phnom Penh" />
                </div>
                <div className="md:col-span-1">
                  <label className={labelClass}>State</label>
                  <input required name="state" value={form.state} onChange={handleChange} className={inputClass} placeholder="PP" />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Zip Code</label>
                  <input required name="zipCode" value={form.zipCode} onChange={handleChange} className={inputClass} placeholder="12000" />
                </div>
              </div>
            </div>

            {/* 3. Payment Information */}
            <div className={cardClass}>
              <div className="flex items-center mb-6">
                <div className={stepBadgeClass}>3</div>
                <h2 className="text-[20px] font-bold text-[#191c1d]">Payment Information</h2>
              </div>

              {/* Demo Mode Notice */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl mb-8 border border-blue-100">
                <Info size={18} className="text-[#003d9b] mt-0.5 flex-shrink-0" />
                <p className="text-[13px] text-blue-900 leading-relaxed">
                  <span className="font-bold">THIS IS ONLY A DEMO. NO REAL PAYMENT IS PROCESSED.</span>
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Card Number</label>
                  <div className="relative">
                    <input required name="cardNumber" value={form.cardNumber} onChange={handleChange} className={inputClass} placeholder="0000 0000 0000 0000" maxLength="16" />
                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Expiry Date</label>
                    <input required name="expiry" value={form.expiry} onChange={handleChange} className={inputClass} placeholder="MM / YY" maxLength="5" />
                  </div>
                  <div>
                    <label className={labelClass}>CVC / CVV</label>
                    <input required name="cvv" value={form.cvv} onChange={handleChange} type="password" className={inputClass} placeholder="•••" maxLength="3" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-[18px] font-bold text-[#191c1d] mb-6">Order Summary</h2>
              
              <div className="space-y-6 mb-8 max-h-[35vh] overflow-y-auto pr-2">
                {cart?.items?.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-[#f8f9fa] rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                      <img 
                        src={item.product?.imageUrls?.[0] || item.product?.images?.[0] || '/placeholder.png'} 
                        alt={item.product?.name} 
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-[14px] font-bold text-[#191c1d] leading-tight mb-1">{item.product?.name}</h3>
                      <p className="text-[12px] text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right flex flex-col justify-center font-bold text-[#191c1d]">
                      ${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4 mb-6">
                <div className="flex justify-between text-[14px]">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold text-[#191c1d]">
                    ${parseFloat(cart?.summary?.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-bold text-[#003d9b]">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8 pt-6 border-t border-gray-100">
                <span className="text-[18px] font-bold text-[#191c1d]">Total</span>
                <span className="text-[32px] font-black text-[#003d9b]">
                  ${parseFloat(cart?.summary?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !cart?.items?.length}
                className="w-full bg-[#0047b3] text-white flex items-center justify-center gap-2 text-[15px] font-bold py-4 rounded-xl hover:bg-[#00368a] transition-all disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Place Order"} <ArrowRight size={18} />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium">
                <ShieldCheck size={14} className="text-gray-400" /> Secure SSL Connection
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}