"use client";

import { usePathname } from "next/navigation";
import SidebarLink from "./SidebarLink";
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
  Building,
  PiggyBank
} from "lucide-react"; // Using lucide-react (standard with shadcn/ui)

export default function SellerSidebar() {
  const pathname = usePathname();

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

  return (
    <aside className="w-64 bg-amazon-darkBlue text-white min-h-screen flex flex-col">
      {/* Brand Section */}
      <div className="p-6 border-b border-gray-700 flex items-center gap-2">
        <div className="bg-amazon-orange p-1.5 rounded-lg text-amazon-darkBlue">
          <Store size={24} strokeWidth={2.5} />
        </div>
        <h2 className="text-xl font-bold tracking-tight">
          <span className="text-xl md:text-2xl font-black text-[#4F1271] uppercase tracking-tighter">Shopy</span>
            <span className="text-xl md:text-2xl font-black text-amazon-orange italic uppercase tracking-tighter">Bucks</span>
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          
          return (
            <SidebarLink 
              key={link.name} 
              href={link.href} 
              active={isActive}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className={isActive ? "text-amazon-orange" : "text-gray-400"} />
                <span>{link.name}</span>
              </div>
            </SidebarLink>
          );
        })}
      </nav>

      {/* Footer / Status */}
      <div className="p-4 border-t border-gray-700">
        <div className="bg-navy p-3 rounded-lg flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Online Store</span>
        </div>
      </div>
    </aside>
  );
}