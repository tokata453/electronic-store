import React, { useRef, useState } from "react";
import { User, Package, LogOut, Camera, Loader2 } from "lucide-react";
import { uploadAvatar } from "@/services/user";
import { toast } from "react-hot-toast";

export default function AccountSidebar({ user, setUser, activeTab, changeTab, handleLogout }) {
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const result = await uploadAvatar(formData);
      if (result.success) {
        setUser((prev) => ({
          ...prev,
          avatar: result.data.avatarKey,
          avatarUrl: result.data.avatarUrl,
        }));
        toast.success("Profile picture updated!");
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to upload image");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const tabClass = (tab) => `flex items-center gap-3 px-6 py-4 cursor-pointer font-bold transition-all ${
    activeTab === tab 
      ? "text-[#0047b3] bg-white rounded-r-full shadow-sm border-l-4 border-[#0047b3]" 
      : "text-gray-500 hover:text-[#191c1d] hover:bg-gray-50/50 rounded-r-full border-l-4 border-transparent"
  }`;

  // --- AVATAR FORMATTING LOGIC ---
  // 1. Set the default UI fallback
  let displayAvatar = `https://ui-avatars.com/api/?name=${user.firstName || "U"}&background=003d9b&color=fff`;

  if (user.avatarUrl) {
    displayAvatar = user.avatarUrl;
  } else if (user.avatar && user.avatar.startsWith("http")) {
    displayAvatar = user.avatar;
  }

  return (
    <div className="w-full md:w-80 flex-shrink-0 flex flex-col">
      <div className="flex items-center gap-4 px-4 mb-8">
        <div 
          className="relative w-16 h-16 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0 cursor-pointer group shadow-sm"
          onClick={() => fileInputRef.current?.click()}
        >
          {/* 3. Use the newly formatted displayAvatar here */}
          <img 
            src={displayAvatar} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
            <Camera size={20} className="text-white" />
          </div>
          {isUploadingAvatar && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Loader2 size={20} className="animate-spin text-[#003d9b]" />
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/jpeg, image/png" 
            onChange={handleAvatarUpload} 
          />
        </div>

        <div>
          <h3 className="text-[16px] font-bold text-[#191c1d] leading-tight">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-[10px] font-bold text-[#003d9b] uppercase tracking-wider mt-0.5">Member</p>
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
  );
}
