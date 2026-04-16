import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getUserProfile } from "@/services/user";
import AccountSidebar from "@/components/account/AccountSidebar";
import ProfileTab from "@/components/account/ProfileTab";
import OrdersTab from "@/components/account/OrdersTab";

export default function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "profile";
  
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: { street: "", city: "", state: "", zipCode: "" },
    avatar: ""
  });

  // AUTH CHECK & PROFILE FETCH
  useEffect(() => {
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
        if (err.response?.status === 401 || err.message?.includes("401")) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const changeTab = (tabName) => setSearchParams({ tab: tabName });

  return (
    <div className="min-h-screen bg-[#fafafb] font-sans pt-10 pb-10">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 flex flex-col md:flex-row gap-10">
        
        <AccountSidebar 
          user={user} 
          setUser={setUser} 
          activeTab={activeTab} 
          changeTab={changeTab} 
          handleLogout={handleLogout} 
        />

        <div className="flex-1">
          {activeTab === "profile" && <ProfileTab user={user} setUser={setUser} />}
          {activeTab === "orders" && <OrdersTab />}
        </div>
        
      </div>
    </div>
  );
}