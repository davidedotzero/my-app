// components/Footer.tsx
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/50 bg-card text-card-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          {/* Section 1: About / Brand */}
          <div className="space-y-3">
            <Link href="/" className="inline-block">
              <h3 className="text-xl font-semibold text-primary">บ้านไม้ดาวิ</h3>
              <p className="text-xs text-muted-foreground">(ไดกิ บอนไซ)</p>
            </Link>
            <p className="text-sm text-muted-foreground">
              จำหน่ายบอนไซคุณภาพ และอุปกรณ์ตกแต่งสวนสไตล์ญี่ปุ่น พร้อมให้คำปรึกษา
            </p>
          </div>

          {/* Section 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">ลิงก์ด่วน</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/creations" className="text-muted-foreground hover:text-primary transition-colors">ผลงานของเรา (สินค้า)</Link></li>
              <li><Link href="/articles" className="text-muted-foreground hover:text-primary transition-colors">บทความ</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">เกี่ยวกับเรา</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">ติดต่อเรา</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">คำถามที่พบบ่อย</Link></li>
            </ul>
          </div>

          {/* Section 3: Contact Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">ติดต่อเรา</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={16} className="text-primary/80" />
                <span>123 หมู่บ้านบอนไซ, ถนนสุขุมวิท, กรุงเทพฯ 10110</span> {/* <--- แก้ไขเป็นที่อยู่จริง */}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone size={16} className="text-primary/80" />
                <a href="tel:+66812345678" className="hover:text-primary transition-colors">081-234-5678</a> {/* <--- แก้ไขเป็นเบอร์โทรจริง */}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail size={16} className="text-primary/80" />
                <a href="mailto:contact@baanmaidavi.com" className="hover:text-primary transition-colors">contact@baanmaidavi.com</a> {/* <--- แก้ไขเป็นอีเมลจริง */}
              </li>
            </ul>
          </div>
          
          {/* Section 4: Social Media (Optional) */}
          <div className="space-y-3 md:col-start-3 lg:col-start-4"> {/* จัดตำแหน่งสำหรับจอใหญ่ */}
            <h4 className="font-semibold text-foreground">ติดตามเรา</h4>
            <div className="flex space-x-4">
              <Link href="https://facebook.com/yourpage" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={20} />
              </Link>
              <Link href="https://instagram.com/yourpage" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={20} />
              </Link>
              <Link href="https://youtube.com/yourchannel" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; {currentYear} บ้านไม้ดาวิ (ไดกิ บอนไซ). สงวนลิขสิทธิ์</p>
          <p className="mt-1">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">นโยบายความเป็นส่วนตัว</Link> | 
            <Link href="/terms-of-service" className="hover:text-primary transition-colors ml-1">ข้อกำหนดการใช้งาน</Link>
          <ThemeSwitcher/>
          </p>
        </div>
      </div>
    </footer>
  );
}