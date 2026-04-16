import React, { useState } from "react";
import { Edit2, Check, MapPin } from "lucide-react";
import { updateUserProfile } from "@/services/user";

export default function ProfileTab({ user, setUser }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const inputClass = "w-full px-4 py-3 rounded-lg text-[14px] text-[#191c1d] font-medium bg-[#f2f4f7] border-none outline-none focus:ring-2 focus:ring-[#003d9b]/20 transition-all";
  const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2";

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
  const handleAddressChange = (e) => {
    setUser({ ...user, address: { ...user.address, [e.target.name]: e.target.value } });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      await updateUserProfile({ firstName: user.firstName, lastName: user.lastName, phone: user.phone });
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

  return (
    <div className="animate-in fade-in duration-300 w-full">
      {message && (
        <div className={`p-4 mb-6 rounded-lg font-bold w-full ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      <h1 className="text-[32px] font-bold text-[#191c1d] tracking-tight mb-2">Account Profile</h1>
      <p className="text-[15px] text-gray-500 mb-8">Manage your personal information and shipping details.</p>
      
      {/* Personal Details Form */}
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

      {/* Shipping Address Section */}
      <div className="bg-[#f8f9fa] p-8 rounded-2xl border border-gray-100 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-bold text-[#191c1d] flex items-center">
            <div className="w-1.5 h-5 bg-[#0047b3] rounded-full mr-3"></div>
            Default Shipping Address
          </h2>
          {!isEditingAddress && (
            <button 
              onClick={() => setIsEditingAddress(true)}
              className="cursor-pointer flex items-center gap-1 text-[12px] font-bold text-[#0047b3] uppercase tracking-widest hover:underline"
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
              <button type="button" onClick={() => setIsEditingAddress(false)} className="cursor-pointer px-4 py-2 text-[14px] font-bold text-gray-500 hover:text-gray-800 transition-colors">Cancel</button>
              <button type="submit" disabled={isLoading} className="cursor-pointer flex items-center gap-2 bg-[#0047b3] text-white px-6 py-2 rounded-lg font-bold text-[14px] hover:bg-[#00368a] transition-colors disabled:opacity-50">
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
  );
}