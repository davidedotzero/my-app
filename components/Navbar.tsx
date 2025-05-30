// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu as MenuIcon, X as XIcon, ShieldAlert, UserCircle } from "lucide-react";
// ไม่ต้อง import HeaderAuth ที่นี่โดยตรง

type NavbarProps = {
    isAdmin: boolean;
    authButtonSlot?: React.ReactNode; // Prop ใหม่สำหรับรับ AuthButton
};

const navLinks = [
    { href: "/articles", label: "บทความ" },
    { href: "/creations", label: "ผลงานของเรา" },
    { href: "/about", label: "เกี่ยวกับเรา" },
    { href: "/contact", label: "ติดต่อเรา" },
];

export default function Navbar({ isAdmin, authButtonSlot }: NavbarProps) { // รับ authButtonSlot
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // ... (โค้ดส่วน useState, useEffect, toggleMobileMenu, link classes เหมือนเดิม) ...
    const pathname = usePathname();
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);
    const commonLinkClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out";
    const desktopNavLinkClasses = `text-foreground/80 hover:text-primary dark:text-foreground/70 dark:hover:text-primary`;
    const activeDesktopNavLinkClasses = `text-primary dark:text-primary font-semibold`;
    const mobileLinkClasses = `block px-3 py-3 rounded-md text-base font-medium transition-colors`;
    const activeMobileLinkClasses = `bg-muted dark:bg-slate-700 text-primary dark:text-primary-foreground`;


    return (
        <nav className="w-full sticky top-0 bg-white backdrop-blur-md shadow-sm z-50 border-b border-border/60">
            <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* ... (ส่วน Logo และ Desktop Navigation Links เหมือนเดิม) ... */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-xl sm:text-2xl font-bold text-primary dark:text-primary hover:opacity-80 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
                            Baan Mai Davi
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
                        {navLinks.map(link => (
                            <Link key={link.href} href={link.href} className={`${commonLinkClasses} ${pathname.startsWith(link.href) ? activeDesktopNavLinkClasses : desktopNavLinkClasses}`}>
                                {link.label}
                            </Link>
                        ))}
                        {isAdmin && (
                            <Link href="/admin" className={`${commonLinkClasses} ${pathname.startsWith('/admin') ? activeDesktopNavLinkClasses : desktopNavLinkClasses} flex items-center gap-1.5`}>
                                <ShieldAlert size={16} /> Admin
                            </Link>
                        )}
                    </div>


                    {/* Right side elements (Profile Link และ AuthButton Slot) - Desktop */}
                    <div className="hidden md:flex items-center gap-3 sm:gap-4">
                        <Link href="/account" className={`${commonLinkClasses} ${pathname.startsWith('/account') ? activeDesktopNavLinkClasses : desktopNavLinkClasses}`}>
                            โปรไฟล์
                        </Link>
                        {authButtonSlot} {/* <--- แสดง AuthButton ที่ส่งมาจาก prop */}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={toggleMobileMenu} type="button" className="inline-flex items-center justify-center p-2 rounded-md text-foreground/70 hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary" aria-controls="mobile-nav" aria-expanded={isMobileMenuOpen}>
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div id="mobile-nav" className="md:hidden absolute top-full left-0 w-full bg-background dark:bg-slate-900 shadow-xl rounded-b-lg border-t border-border/60 py-2">
                    <div className="flex flex-col px-4 space-y-1">
                        {/* ... (Nav Links และ Admin Link ใน Mobile Menu เหมือนเดิม) ... */}
                        {navLinks.map(link => (
                            <Link key={link.href} href={link.href} onClick={toggleMobileMenu} className={`${mobileLinkClasses} ${pathname.startsWith(link.href) ? activeMobileLinkClasses : "hover:bg-muted dark:hover:bg-slate-800"}`}>
                                {link.label}
                            </Link>
                        ))}
                        {isAdmin && (
                            <Link href="/admin" onClick={toggleMobileMenu} className={`${mobileLinkClasses} ${pathname.startsWith('/admin') ? activeMobileLinkClasses : "hover:bg-muted dark:hover:bg-slate-800"} flex items-center gap-2`}>
                                <ShieldAlert size={20} /> Admin Panel
                            </Link>
                        )}
                        <Link href="/account" onClick={toggleMobileMenu} className={`${mobileLinkClasses} ${pathname.startsWith('/account') ? activeMobileLinkClasses : "hover:bg-muted dark:hover:bg-slate-800"} flex items-center gap-2`}>
                            <UserCircle size={20} /> โปรไฟล์
                        </Link>

                        <div className="border-t border-border/10 pt-3 mt-2">
                            {authButtonSlot} {/* <--- แสดง AuthButton ที่ส่งมาจาก prop ใน Mobile Menu ด้วย */}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}