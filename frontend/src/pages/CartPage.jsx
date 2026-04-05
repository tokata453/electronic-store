import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, Lock, ArrowLeft, CreditCard } from "lucide-react";
import { getCart, updateCartItem, removeFromCart } from "@/services/cart";

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Authentication Check
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    // If not logged in, we don't fetch the cart. 
    // We let the UI handle the "Please sign in" message below.
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    fetchCartData();
  }, [isLoggedIn]);

  const fetchCartData = async () => {
    setIsLoading(true);
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      setError("Failed to load your cart.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handlers for Quantity & Removal
  const handleQuantityChange = async (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    try {
      // Optimistic UI update (makes it feel instant)
      setCart(prev => {
        const updatedItems = prev.items.map(item => 
          item.id === itemId 
            ? { ...item, quantity: newQuantity, subtotal: item.price * newQuantity } 
            : item
        );
        // Recalculate basic summary for optimistic UI
        const newSubtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
        return {
          ...prev,
          items: updatedItems,
          summary: { ...prev.summary, subtotal: newSubtotal, total: newSubtotal + prev.summary.tax }
        };
      });

      // Background API call
      await updateCartItem(itemId, newQuantity);
      // Re-sync with server just to be perfectly accurate
      fetchCartData(); 
    } catch (err) {
      console.error("Failed to update quantity", err);
      fetchCartData(); // Revert on failure
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      // Optimistic removal
      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }));
      await removeFromCart(itemId);
      fetchCartData();
    } catch (err) {
      console.error("Failed to remove item", err);
      fetchCartData(); // Revert on failure
    }
  };

  // --- RENDERING STATES ---

  // Auth Gate
  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans bg-[#f8f9fa] px-6">
        <Lock size={48} className="text-[#191c1d]/20 mb-6" />
        <h1 className="text-[32px] font-black text-[#191c1d] tracking-tight mb-4">Authentication Required</h1>
        <p className="text-[#191c1d]/60 mb-8 text-center max-w-md">Please sign in to view and manage your curated selection.</p>
        <button onClick={() => navigate("/login")} className="bg-[#003d9b] text-white px-8 py-3 rounded-lg font-bold tracking-widest uppercase text-[11px] hover:bg-[#0052cc] transition-colors">
          Sign In
        </button>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 font-sans">
        <div className="h-10 w-48 bg-[#f3f4f5] animate-pulse rounded-lg mb-12"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 flex flex-col gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 bg-[#f3f4f5] animate-pulse rounded-2xl w-full"></div>
            ))}
          </div>
          <div className="lg:col-span-4 h-64 bg-[#f3f4f5] animate-pulse rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Empty Cart State
  if (!cart?.items?.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans px-6">
        <h1 className="text-[32px] font-black text-[#191c1d] tracking-tight mb-4">Your Cart is Empty</h1>
        <p className="text-[#191c1d]/60 mb-8 text-center">Looks like you haven't added any premium tech yet.</p>
        <Link to="/products" className="flex items-center gap-2 text-[#003d9b] font-bold tracking-[0.1em] uppercase text-[11px] hover:opacity-80 transition-opacity">
          <ArrowLeft size={16} /> Continue Exploring
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-12 md:py-16 font-sans">
      
      <h1 className="text-[42px] font-black text-[#191c1d] tracking-tight mb-10 leading-tight">
        Your Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
        
        {/* =========================================
            LEFT COLUMN: CART ITEMS
            ========================================= */}
        <div className="lg:col-span-8">
          
          {/* Table Headers (Hidden on mobile) */}
          <div className="hidden md:grid grid-cols-12 pb-4 border-b border-[#191c1d]/10 text-[10px] font-bold text-[#191c1d]/40 uppercase tracking-widest mb-6">
            <div className="col-span-6">Product</div>
            <div className="col-span-3 text-center">Quantity</div>
            <div className="col-span-3 text-right">Subtotal</div>
          </div>

          {/* Item List */}
          <div className="flex flex-col">
            {cart.items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6 border-b border-[#191c1d]/5">
                
                {/* Product Image & Details */}
                <div className="md:col-span-6 flex items-center gap-6">
                  <Link to={`/product/${item.product?.slug || item.productId}`} className="w-24 h-24 shrink-0 bg-[#f3f4f5] rounded-xl flex items-center justify-center p-2">
                    <img 
                      src={item.product?.images?.[0] || 'placeholder.png'} 
                      alt={item.product?.name} 
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </Link>
                  <div className="flex flex-col">
                    <Link to={`/product/${item.product?.slug || item.productId}`}>
                      <h3 className="text-[16px] font-bold text-[#191c1d] leading-tight hover:text-[#003d9b] transition-colors mb-1">
                        {item.product?.name}
                      </h3>
                    </Link>
                    <p className="text-[13px] font-medium text-[#191c1d]/50 mb-3">
                      ${parseFloat(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    
                    {/* Remove Button (Mobile moves next to details, Desktop stays here) */}
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-[#d32f2f]/80 uppercase tracking-widest hover:text-[#d32f2f] transition-colors w-fit"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="md:col-span-3 flex justify-start md:justify-center">
                  <div className="flex items-center justify-between border border-[#191c1d]/10 rounded-lg px-3 py-1 w-28 h-10">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                      disabled={item.quantity <= 1}
                      className="text-[#191c1d]/40 hover:text-[#191c1d] disabled:opacity-30 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-[13px] font-bold text-[#191c1d]">{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                      disabled={item.quantity >= (item.product?.stock || 99)}
                      className="text-[#191c1d]/40 hover:text-[#191c1d] disabled:opacity-30 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="md:col-span-3 text-left md:text-right">
                  <span className="md:hidden text-[10px] font-bold text-[#191c1d]/40 uppercase tracking-widest mr-2">Subtotal:</span>
                  <span className="text-[16px] font-bold text-[#191c1d]">
                    ${parseFloat(item.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link to="/products" className="inline-flex items-center gap-2 text-[#003d9b] font-bold tracking-[0.1em] uppercase text-[11px] border-b-2 border-[#003d9b]/10 pb-0.5 hover:border-[#003d9b] transition-all">
              <ArrowLeft size={14} strokeWidth={2.5} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* =========================================
            RIGHT COLUMN: ORDER SUMMARY
            ========================================= */}
        <div className="lg:col-span-4">
          <div className="bg-[#f8f9fa] rounded-2xl p-8 sticky top-28">
            <h2 className="text-[18px] font-bold text-[#191c1d] mb-6">Order Summary</h2>
            
            <div className="flex flex-col gap-4 text-[14px] font-medium text-[#191c1d]/70 border-b border-[#191c1d]/10 pb-6 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-[#191c1d]">
                  ${parseFloat(cart.summary?.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span className="font-bold text-[#191c1d]">
                  ${parseFloat(cart.summary?.tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="text-[16px] font-bold text-[#191c1d]">Total</span>
              <span className="text-[28px] font-black text-[#191c1d] tracking-tight">
                ${parseFloat(cart.summary?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-gradient-to-r from-[#003d9b] to-[#0052cc] text-white text-[13px] font-bold py-4 rounded-xl shadow-[0_15px_30px_rgba(0,61,155,0.2)] hover:shadow-[0_20px_40px_rgba(0,61,155,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all uppercase tracking-widest mb-6"
            >
              Proceed to Checkout
            </button>

            {/* Secure Checkout Badges */}
            <div className="flex flex-col items-center justify-center gap-3 text-[#191c1d]/40">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                <Lock size={12} /> Secure Checkout
              </div>
              <div className="flex items-center gap-4 opacity-50 grayscale">
                <CreditCard size={24} />
                {/* Using simple text elements to simulate the Visa/MC logos cleanly */}
                <span className="font-black text-sm italic">VISA</span>
                <span className="font-black text-sm relative">
                  <span className="text-red-500 absolute -left-2">●</span>
                  <span className="text-yellow-500 opacity-80">●</span>
                </span>
                <span className="font-bold text-sm">Pay</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}