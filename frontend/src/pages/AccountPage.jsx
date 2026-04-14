import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "@/services/user";
import { getOrders } from "@/services/order";
import { User, Package, MapPin, LogOut, Edit2, Check } from "lucide-react";

export default function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "profile";
  
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: { street: "", city: "", state: "", zipCode: "" }
  });
  
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // AUTH CHECK & PROFILE FETCH
  useEffect(() => {
    // 1. Immediate local check
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const result = await getUserProfile();
        if (result.success) {
          setUser({
            ...result.data.user,
            address: result.data.user.address || { street: "", city: "", state: "", zipCode: "" }
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        // 2. Server check: If the token is invalid/expired, kick them out
        if (err.response?.status === 401 || err.message?.includes("401")) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "orders") {
      const fetchUserOrders = async () => {
        setIsLoadingOrders(true);
        try {
          const result = await getOrders();
          if (result.success) {
            setOrders(result.data.orders);
          }
        } catch (err) {
          console.error("Failed to load orders", err);
        } finally {
          setIsLoadingOrders(false);
        }
      };
      fetchUserOrders();
    }
  }, [activeTab]);

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
  
  const handleAddressChange = (e) => {
    setUser({ ...user, address: { ...user.address, [e.target.name]: e.target.value } });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      await updateUserProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage("Failed to update profile.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      await updateUserProfile({ address: user.address });
      setMessage("Address saved successfully!");
      setIsEditingAddress(false);
    } catch (err) {
      setMessage("Failed to save address.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const changeTab = (tabName) => setSearchParams({ tab: tabName });

  const inputClass = "w-full px-4 py-3 rounded-lg text-[14px] text-[#191c1d] font-medium bg-[#f2f4f7] border-none outline-none focus:ring-2 focus:ring-[#003d9b]/20 transition-all";
  const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2";
  const tabClass = (tab) => `flex items-center gap-3 px-6 py-4 cursor-pointer font-bold transition-all ${
    activeTab === tab 
      ? "text-[#0047b3] bg-white rounded-r-full shadow-sm border-l-4 border-[#0047b3]" 
      : "text-gray-500 hover:text-[#191c1d] hover:bg-gray-50/50 rounded-r-full border-l-4 border-transparent"
  }`;

  return (
    <div className="min-h-screen bg-[#fafafb] font-sans pt-10 pb-10">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 flex flex-col md:flex-row gap-10">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col">
          <div className="flex items-center gap-4 px-4 mb-8">
            <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName || "U"}&background=003d9b&color=fff`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#191c1d] leading-tight">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-[10px] font-bold text-[#003d9b] uppercase tracking-wider">Member</p>
            </div>
          </div>

          <nav className="flex flex-col pr-4">
            <div onClick={() => changeTab("profile")} className={tabClass("profile")}>
              <User size={18} /> Profile
            </div>
            <div onClick={() => changeTab("orders")} className={tabClass("orders")}>
              <Package size={18} /> Orders
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100/50">
              <div 
                onClick={handleLogout}
                className="flex items-center gap-3 px-6 py-4 cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-r-full font-bold transition-all border-l-4 border-transparent"
              >
                <LogOut size={18} /> Logout
              </div>
            </div>
          </nav>
        </div>

        {/* ================= RIGHT CONTENT AREA ================= */}
        <div className="flex-1">
          {message && (
            <div className={`p-4 mb-6 rounded-lg font-bold w-full ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {message}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="animate-in fade-in duration-300 w-full">
              <h1 className="text-[32px] font-bold text-[#191c1d] tracking-tight mb-2">Account Profile</h1>
              <p className="text-[15px] text-gray-500 mb-8">Manage your personal information and shipping details.</p>
              
              <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 mb-8 w-full">
                <h2 className="text-[18px] font-bold text-[#191c1d] mb-8 flex items-center">
                  <div className="w-1.5 h-5 bg-[#0047b3] rounded-full mr-3"></div>
                  Personal Details
                </h2>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input required name="firstName" value={user.firstName} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input required name="lastName" value={user.lastName} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input value={user.email} readOnly className={`${inputClass} opacity-60 cursor-not-allowed`} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input name="phone" value={user.phone} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                    <button 
                      type="submit" disabled={isLoading}
                      className="bg-[#0047b3] text-white px-8 py-3 rounded-lg font-bold text-[14px] hover:bg-[#00368a] transition-colors disabled:opacity-50"
                    >
                      {isLoading && !isEditingAddress ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-[#f8f9fa] p-8 rounded-2xl border border-gray-100 w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[18px] font-bold text-[#191c1d] flex items-center">
                    <div className="w-1.5 h-5 bg-[#0047b3] rounded-full mr-3"></div>
                    Default Shipping Address
                  </h2>
                  {!isEditingAddress && (
                    <button 
                      onClick={() => setIsEditingAddress(true)}
                      className="flex items-center gap-1 text-[12px] font-bold text-[#0047b3] uppercase tracking-widest hover:underline"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  )}
                </div>

                {isEditingAddress ? (
                  <form onSubmit={handleSaveAddress} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div>
                      <label className={labelClass}>Street Address</label>
                      <input required name="street" value={user.address.street} onChange={handleAddressChange} className={inputClass} placeholder="123 Main St" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="col-span-2 md:col-span-1">
                        <label className={labelClass}>City</label>
                        <input required name="city" value={user.address.city} onChange={handleAddressChange} className={inputClass} placeholder="Phnom Penh" />
                      </div>
                      <div>
                        <label className={labelClass}>State/Province</label>
                        <input name="state" value={user.address.state} onChange={handleAddressChange} className={inputClass} placeholder="PP" />
                      </div>
                      <div>
                        <label className={labelClass}>Zip Code</label>
                        <input name="zipCode" value={user.address.zipCode} onChange={handleAddressChange} className={inputClass} placeholder="12000" />
                      </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                      <button type="button" onClick={() => setIsEditingAddress(false)} className="px-4 py-2 text-[14px] font-bold text-gray-500 hover:text-gray-800 transition-colors">Cancel</button>
                      <button type="submit" disabled={isLoading} className="flex items-center gap-2 bg-[#0047b3] text-white px-6 py-2 rounded-lg font-bold text-[14px] hover:bg-[#00368a] transition-colors disabled:opacity-50">
                        {isLoading && isEditingAddress ? "Saving..." : <><Check size={16} /> Save Address</>}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-white p-6 rounded-xl flex items-start gap-4 shadow-sm border border-gray-50">
                    <div className="w-8 h-8 rounded-full bg-[#0047b3]/10 text-[#0047b3] flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[#191c1d] mb-1">Primary Destination</h3>
                      {user.address?.street ? (
                        <p className="text-[14px] text-gray-500 leading-relaxed">
                          {user.address.street}<br/>{user.address.city}, {user.address.state} {user.address.zipCode}
                        </p>
                      ) : (
                        <p className="text-[14px] text-gray-400 italic">No default address saved yet. Click Edit to add one.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="animate-in fade-in duration-300 w-full">
              <h1 className="text-[32px] font-bold text-[#191c1d] tracking-tight mb-2">Order History</h1>
              <p className="text-[15px] text-gray-500 mb-8">View and track your recent purchases.</p>
              
              {isLoadingOrders ? (
                <div className="flex justify-center py-12 w-full">
                  <div className="w-8 h-8 border-4 border-[#0047b3] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 text-center w-full">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-[18px] font-bold text-[#191c1d] mb-2">No orders yet</h3>
                  <p className="text-gray-500 text-[14px] mb-6">Looks like you haven't made a purchase yet.</p>
                  <button onClick={() => navigate("/")} className="text-[#0047b3] font-bold hover:underline">Start Shopping</button>
                </div>
              ) : (
                <div className="space-y-6 w-full">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden w-full">
                      <div className="bg-[#f8f9fa] p-5 border-b border-gray-100 flex flex-wrap justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order Placed</p>
                          <p className="text-[14px] font-bold text-[#191c1d]">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total</p>
                          <p className="text-[14px] font-bold text-[#0047b3]">${parseFloat(order.totalAmount).toLocaleString()}</p>
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Order #</p>
                          <p className="text-[14px] text-gray-700 font-mono">{order.orderNumber}</p>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="inline-block px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 mb-4">{order.status}</div>
                        <div className="space-y-4">
                          {order.items?.map(item => {
                            let imageUrl = '/placeholder.png';
                            if (item.product?.imageUrls?.[0]) imageUrl = item.product.imageUrls[0];
                            else if (item.product?.images?.[0]) imageUrl = item.product.images[0];
                            else if (item.productImage) {
                              let rawImage = item.productImage;
                              if (typeof rawImage === 'string' && rawImage.startsWith('[')) {
                                try {
                                  const parsed = JSON.parse(rawImage);
                                  if (parsed && parsed.length > 0) imageUrl = parsed[0];
                                } catch(e) {}
                              } else {
                                imageUrl = rawImage;
                              }
                            }
                            if (imageUrl !== '/placeholder.png' && !imageUrl.startsWith('http')) {
                              imageUrl = `https://d20rb27rhcs9jr.cloudfront.net/${imageUrl.replace(/^\//, '')}`;
                            }
                            return (
                              <div key={item.id} className="flex gap-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-2 border border-gray-100 flex-shrink-0">
                                  <img src={imageUrl} alt={item.productName || item.product?.name} className="w-full h-full object-contain mix-blend-multiply" />
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                  <h4 className="text-[14px] font-bold text-[#191c1d] leading-tight mb-1">{item.productName || item.product?.name}</h4>
                                  <p className="text-[12px] text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right flex flex-col justify-center font-bold text-[#191c1d]">
                                  ${parseFloat(item.totalPrice || (item.price * item.quantity)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}