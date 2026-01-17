// components/SidebarLink.tsx
import Link from "next/link";

interface Props {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

export default function SidebarLink({ href, active, children }: Props) {
  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 rounded-md transition-all duration-200 group ${
        active
          ? "bg-amazon-navy text-white border-l-4 border-amazon-orange"
          : "text-gray-300 hover:bg-amazon-navy hover:text-white"
      }`}
    >
      <span className={`font-medium ${active ? "translate-x-1" : ""} transition-transform`}>
        {children}
      </span>
    </Link>
  );
}