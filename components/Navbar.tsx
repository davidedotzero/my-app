// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu as MenuIcon, X as XIcon, ShieldAlert } from "lucide-react"; // ไอคอนสำหรับ Admin
// HeaderAuth จะถูกส่งเข้ามาทาง prop authButtonSlot
// import HeaderAuth from "@/components/header-auth"; 

// Type สำหรับรายการลิงก์
export type NavLinkItem = {
  href: string;
  label: string;
  icon?: React.ReactNode; // (Optional) ไอคอนสำหรับ Mobile Menu
};

// Props type สำหรับ Navbar
type NavbarProps = {
  isAdmin?: boolean; // สำหรับแสดง/ซ่อนลิงก์ Admin Panel (อาจจะไม่ใช้ใน AccountLayout)
  authButtonSlot?: React.ReactNode; // Slot สำหรับ HeaderAuth Component
  navLinks: NavLinkItem[];         // รายการลิงก์ที่จะแสดง
  brandName: string;               // ชื่อแบรนด์/โลโก้ (text)
  brandLink?: string;              // ลิงก์ของชื่อแบรนด์ (default คือ "/")
};

export default function Navbar({ 
  isAdmin, 
  authButtonSlot, 
  navLinks, 
  brandName, 
  brandLink = "/" 
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    setIsMobileMenuOpen(false); // ปิดเมนูเมื่อ path เปลี่ยน
  }, [pathname]);
  
  const commonLinkClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out";
  const desktopNavLinkClasses = `text-foreground/80 hover:text-primary dark:text-foreground/70 dark:hover:text-primary`;
  // ฟังก์ชันสำหรับตรวจสอบ Active Link ที่แม่นยำขึ้น (เผื่อ sub-paths)
  const isActive = (href: string) => href === "/" ? pathname === href : pathname.startsWith(href);
  
  const activeDesktopNavLinkClasses = `text-primary dark:text-primary font-semibold`;

  const mobileLinkClasses = `block px-4 py-3 rounded-md text-base font-medium transition-colors text-foreground/90 dark:text-foreground/80 hover:bg-muted dark:hover:bg-slate-800`;
  const activeMobileLinkClasses = `bg-muted dark:bg-slate-700 text-primary dark:text-primary-foreground`;

  return (
    <nav className="w-full sticky top-0 bg-background/95 dark:bg-slate-900/85 backdrop-blur-md shadow-sm z-50 border-b border-border/60">
      <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand Name / Logo */}
          <div className="flex-shrink-0">
            <Link
              href={brandLink}
              className="text-xl sm:text-2xl font-bold text-primary dark:text-primary hover:opacity-80 transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {brandName}
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${commonLinkClasses} ${isActive(link.href) ? activeDesktopNavLinkClasses : desktopNavLinkClasses}`}
              >
                {link.label}
              </Link>
            ))}
            {/* แสดง Admin Link ถ้า isAdmin เป็น true (อาจจะไม่ใช้ใน AccountLayout) */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`${commonLinkClasses} ${pathname.startsWith('/admin') ? activeDesktopNavLinkClasses : desktopNavLinkClasses} flex items-center gap-1.5 ml-2`}
              >
                <ShieldAlert size={16} /> Admin
              </Link>
            )}
          </div>

          {/* Right side elements (AuthButton Slot) - Desktop */}
          <div className="hidden md:flex items-center">
            {authButtonSlot}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground/70 hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-controls="mobile-nav"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div id="mobile-nav" className="md:hidden absolute top-full left-0 w-full bg-background dark:bg-slate-900 shadow-xl rounded-b-lg border-t border-border/60 py-2">
          <div className="flex flex-col px-2 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={toggleMobileMenu}
                className={`${mobileLinkClasses} ${isActive(link.href) ? activeMobileLinkClasses : ""} flex items-center gap-3`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={toggleMobileMenu}
                className={`${mobileLinkClasses} ${pathname.startsWith('/admin') ? activeMobileLinkClasses : ""} flex items-center gap-3`}
              >
                <ShieldAlert size={20} /> Admin Panel
              </Link>
            )}
            <div className="border-t border-border/10 pt-3 mt-2 px-2">
              {authButtonSlot}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}