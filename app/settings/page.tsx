"use client";

import { useEffect, useState } from "react";
import SellerLayout from "@/components/layout/SellerLayout";
import { api } from "@/lib/api";
import { 
  User, 
  Store, 
  Settings as SettingsIcon, 
  Save, 
  Upload, 
  Globe, 
  ShieldCheck 
} from "lucide-react";

type TabType = "profile" | "store" | "general";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form States
  const [formData, setFormData] = useState<any>({
    name: "", email: "",
    storeName: "", supportEmail: "", supportPhone: "", address: "",
    currency: "INR", maintenanceMode: false,
    logo: null
  });

  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      setFormData({ ...res.data });
      if (res.data.logo) {
        setPreviewLogo(`${process.env.NEXT_PUBLIC_API_URL}/uploads/settings/${res.data.logo}`);
      }
    } catch (err) {
      console.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (type: TabType) => {
    setSaving(true);
    try {
      if (type === "profile") {
        await api.patch("/settings/profile", { name: formData.name, email: formData.email });
      } else if (type === "store") {
        const data = new FormData();
        data.append("storeName", formData.storeName);
        data.append("supportEmail", formData.supportEmail);
        data.append("supportPhone", formData.supportPhone);
        data.append("address", formData.address);
        if (formData.logoFile) data.append("logo", formData.logoFile);
        
        await api.patch("/settings/store", data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else if (type === "general") {
        await api.patch("/settings/general", { 
          currency: formData.currency, 
          maintenanceMode: formData.maintenanceMode 
        });
      }
      alert("Settings updated successfully!");
    } catch (err) {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SellerLayout><div className="p-10 text-center">Loading settings...</div></SellerLayout>;

  return (
    <SellerLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amazon-text">Settings</h1>
          <p className="text-amazon-mutedText">Configure your store profile and application preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 space-y-2">
            {[
              { id: "profile", label: "Admin Profile", icon: User },
              { id: "store", label: "Store Details", icon: Store },
              { id: "general", label: "General Settings", icon: SettingsIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.id 
                  ? "bg-amazon-orange text-amazon-darkBlue shadow-md" 
                  : "bg-white text-amazon-mutedText hover:bg-gray-100 border border-amazon-borderGray"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 bg-white rounded-2xl border border-amazon-borderGray shadow-sm p-8">
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold border-b pb-4">Personal Information</h2>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Full Name</label>
                    <input 
                      className="w-full border border-amazon-borderGray p-2.5 rounded-lg focus:ring-1 focus:ring-amazon-orange outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Email Address</label>
                    <input 
                      className="w-full border border-amazon-borderGray p-2.5 rounded-lg focus:ring-1 focus:ring-amazon-orange outline-none"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "store" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold border-b pb-4">Store Identity</h2>
                
                {/* Logo Upload */}
                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl border border-dashed border-amazon-borderGray">
                  <div className="relative w-20 h-20 bg-white rounded-lg border overflow-hidden flex items-center justify-center">
                    {previewLogo ? (
                      <img src={previewLogo} className="w-full h-full object-contain" alt="Store Logo" />
                    ) : (
                      <Store size={32} className="text-gray-300" />
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer bg-white border border-amazon-borderGray px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
                      <Upload size={16} /> Change Logo
                      <input 
                        type="file" className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({...formData, logoFile: file});
                            setPreviewLogo(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                    <p className="text-[11px] text-amazon-mutedText mt-2">Recommended: 200x200px (PNG or JPG)</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Display Store Name</label>
                    <input 
                      className="w-full border border-amazon-borderGray p-2.5 rounded-lg outline-none"
                      value={formData.storeName}
                      onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1.5">Support Email</label>
                      <input className="w-full border border-amazon-borderGray p-2.5 rounded-lg outline-none" value={formData.supportEmail} onChange={(e) => setFormData({...formData, supportEmail: e.target.value})}/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1.5">Support Phone</label>
                      <input className="w-full border border-amazon-borderGray p-2.5 rounded-lg outline-none" value={formData.supportPhone} onChange={(e) => setFormData({...formData, supportPhone: e.target.value})}/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Physical Address</label>
                    <textarea rows={3} className="w-full border border-amazon-borderGray p-2.5 rounded-lg outline-none" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}/>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold border-b pb-4">General Preferences</h2>
                <div className="grid gap-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Globe className="text-blue-600" size={20} />
                      <div>
                        <p className="font-bold text-sm">System Currency</p>
                        <p className="text-xs text-amazon-mutedText">Used for all product pricing</p>
                      </div>
                    </div>
                    <select 
                      className="bg-white border p-2 rounded-lg text-sm font-bold outline-none"
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    >
                      <option value="INR">₹ INR (Rupees)</option>
                      <option value="USD">$ USD (Dollars)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-amazon-danger" size={20} />
                      <div>
                        <p className="font-bold text-sm">Maintenance Mode</p>
                        <p className="text-xs text-amazon-mutedText">Take the store offline for customers</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" className="sr-only peer"
                        checked={formData.maintenanceMode}
                        onChange={(e) => setFormData({...formData, maintenanceMode: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amazon-danger"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-10 pt-6 border-t flex justify-end">
              <button 
                disabled={saving}
                onClick={() => handleUpdate(activeTab)}
                className="flex items-center gap-2 bg-amazon-darkBlue text-white px-8 py-2.5 rounded-xl font-bold hover:bg-amazon-navy transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : <><Save size={18} /> Save {activeTab} Settings</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}