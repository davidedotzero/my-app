import { resetPasswordAction } from "@/app/actions"; // ตรวจสอบ Path ของ Server Action
import { FormMessage, type Message } from "@/components/form-message"; // ตรวจสอบ Path
import { SubmitButton } from "@/components/submit-button"; // ตรวจสอบ Path
import { Input } from "@/components/ui/input"; // จาก Shadcn/UI
import { Label } from "@/components/ui/label"; // จาก Shadcn/UI
import Link from "next/link"; // สำหรับลิงก์ "กลับไปหน้า Sign In"

// Metadata ควรจะถูก export จาก Server Component หรือ Layout ที่ครอบหน้านี้
// export const metadata = { title: "ตั้งรหัสผ่านใหม่ | บ้านไม้ดาวิ" };

export default async function ResetPasswordPage(props: {
  // หมายเหตุ: searchParams ที่เป็น Promise<Message> นั้นไม่ปกติสำหรับ Server Component Page Props
  // โดยทั่วไป searchParams จะเป็น object { [key: string]: string | string[] | undefined }
  // หรือ Message โดยตรง (ถ้า Message คือ type ของ searchParams object)
  // การใช้ await props.searchParams จะทำงานถ้า props.searchParams เป็น Promise จริงๆ
  searchParams: Promise<Message>; 
}) {
  // ใช้ await props.searchParams ตามที่คุณเคยทำแล้วได้ผลกับ Error ก่อนหน้า
  const messageState = await props.searchParams;

  return (
    // Layout หลักของส่วน Auth (เช่น app/(auth-pages)/layout.tsx) ควรจะจัดการเรื่อง Card และการจัดกึ่งกลาง
    // ฟอร์มนี้จะเน้นที่ content ภายใน Card นั้น
    <form
      action={resetPasswordAction}
      className="flex w-full flex-col space-y-6" // ใช้ space-y-6 สำหรับระยะห่างหลักระหว่างกลุ่ม elements
    >
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          ตั้งรหัสผ่านใหม่
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          กรุณากรอกรหัสผ่านใหม่ที่คุณต้องการใช้งาน
        </p>
      </div>
      
      <div className="space-y-2"> {/* กลุ่ม Label และ Input */}
        <Label htmlFor="password">รหัสผ่านใหม่ (New Password)</Label>
        <Input
          type="password"
          name="password"
          id="password"
          placeholder="••••••••"
          required
          className="bg-background focus:border-primary" // ให้ Input ใช้สีพื้นหลังจาก Theme
        />
      </div>

      <div className="space-y-2"> {/* กลุ่ม Label และ Input */}
        <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่ (Confirm New Password)</Label>
        <Input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          placeholder="••••••••"
          required
          className="bg-background focus:border-primary" // ให้ Input ใช้สีพื้นหลังจาก Theme
        />
      </div>

      {/* แสดง message ที่ได้จาก Server Action (ผ่าน searchParams) */}
      <FormMessage message={messageState} />

      <SubmitButton formAction={resetPasswordAction} className="w-full !mt-8"> 
        {/* !mt-8 เพื่อเพิ่มระยะห่างด้านบนของปุ่มให้มากขึ้น (ถ้าต้องการ) */}
        ตั้งรหัสผ่านใหม่
      </SubmitButton>

      <div className="mt-4 text-center text-sm">
        <Link 
          href="/sign-in" // หรือ path หน้า login/sign-in ของคุณ
          className="text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors"
        >
          &larr; กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    </form>
  );
}