"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  Store, 
  Bell,
  Tag,
  IndianRupeeIcon,
  PiggyBank,
  Menu,
  X,
  LogOut
} from "lucide-react";

export default function SellerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Products", href: "/products", icon: ShoppingBag },
    { name: "Orders", href: "/orders", icon: ClipboardList },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Sales", href: "/sales", icon: Tag },
    { name: "Payouts", href: "/payouts", icon: IndianRupeeIcon },
    { name: "Bank", href: "/bank", icon: PiggyBank },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const LinkItem = (href: string, label: string, Icon: any) => {
    const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200
          border-2 mb-2
          ${
            isActive
              ? "bg-amazon-orange border-amazon-darkBlue text-amazon-darkBlue shadow-[4px_4px_0px_0px_rgba(19,25,33,1)] scale-[1.02]"
              : "text-amazon-mutedText border-transparent hover:bg-amazon-lightGray hover:text-amazon-darkBlue"
          }
        `}
      >
        <Icon size={20} strokeWidth={isActive ? 3 : 2} />
        <span className="tracking-tight">{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b-4 border-amazon-darkBlue flex items-center px-4 z-40">
        <button 
          onClick={() => setOpen(true)}
          className="p-2 bg-amazon-orange border-2 border-amazon-darkBlue rounded-lg shadow-[2px_2px_0px_0px_rgba(19,25,33,1)]"
        >
          <Menu size={24} className="text-amazon-darkBlue" />
        </button>
        <h1 className="ml-4 font-black text-amazon-darkBlue italic uppercase tracking-tighter">
          ShopyBucks
        </h1>
      </div>

      {/* OVERLAY (mobile) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-amazon-darkBlue/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-72 bg-white border-r-4 border-amazon-darkBlue
          flex flex-col z-50
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Brand Section */}
        <div className="p-6 border-b-2 border-amazon-borderGray shrink-0 relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-6 right-4 md:hidden p-1 border-2 border-amazon-darkBlue rounded-md"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col">
            <span className="text-3xl font-black text-[#4F1271] uppercase tracking-tighter leading-none">Shopy</span>
            <span className="text-3xl font-black text-amazon-orange italic uppercase tracking-tighter leading-none">Bucks</span>
            <div className="mt-1 flex items-center gap-2 text-[10px] font-bold bg-amazon-darkBlue text-white px-2 py-0.5 rounded-full w-fit uppercase tracking-widest">
              <Store size={10} />
              Seller Central
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-amazon-borderGray hover:scrollbar-thumb-amazon-orange">
          <nav className="mt-2">
            <p className="px-4 text-[10px] font-black text-amazon-mutedText uppercase tracking-[0.2em] mb-4">Seller Menu</p>
            {links.map((link) => (
              <div key={link.href}>
                {LinkItem(link.href, link.name, link.icon)}
              </div>
            ))}
          </nav>
        </div>

        {/* Logout Section */}
        <div className="p-6 bg-amazon-lightGray border-t-2 border-amazon-borderGray shrink-0">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="
              w-full flex items-center justify-center gap-2
              px-4 py-4 rounded-xl
              bg-white border-2 border-amazon-darkBlue text-amazon-darkBlue font-black uppercase tracking-tighter
              shadow-[4px_4px_0px_0px_rgba(177,39,4,1)]
              hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all
            "
          >
            <LogOut size={20} strokeWidth={3} className="text-red-600" />
            Logout Vibe
          </button>
        </div>
      </aside>

      {/* LOGOUT CONFIRM MODAL (Matches your Admin style) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] bg-amazon-darkBlue/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border-4 border-amazon-darkBlue rounded-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 w-full max-w-sm">
            <h3 className="text-2xl font-black mb-2 text-amazon-darkBlue uppercase italic tracking-tighter">
              Pause the grind?
            </h3>
            <p className="text-amazon-mutedText font-medium mb-8">
              Ready to log out of your seller account?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  localStorage.clear();
                  router.push("/login");
                }}
                className="w-full py-4 bg-red-600 text-white border-4 border-amazon-darkBlue rounded-xl font-black uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-4 bg-white text-amazon-darkBlue border-4 border-amazon-darkBlue rounded-xl font-black uppercase tracking-tighter hover:bg-amazon-lightGray"
              >
                Nah, Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
