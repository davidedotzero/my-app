"use client";

import { useState } from 'react';
import { updateUserRoleAction } from '@/app/admin/users/actions'; // ตรวจสอบ Path

type RoleChangerProps = {
  userId: string;
  currentRole: string;
  availableRoles: string[]; // เช่น ['user', 'admin', 'editor']
};

export default function RoleChanger({ userId, currentRole, availableRoles }: RoleChangerProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text?: string; type?: 'success' | 'error' } | null>(null);

  const handleRoleChange = async () => {
    if (selectedRole === currentRole) {
      setMessage({ text: 'Role ไม่มีการเปลี่ยนแปลง', type: 'error' });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    const result = await updateUserRoleAction(userId, selectedRole);
    setIsLoading(false);

    if (result.error) {
      setMessage({ text: result.error, type: 'error' });
    } else if (result.success) {
      setMessage({ text: result.success, type: 'success' });
      // ไม่จำเป็นต้อง refresh หน้านี้โดยตรง เพราะ revalidatePath จาก server action ควรจะ update list แล้ว
      // แต่ถ้า list ไม่ update ทันที อาจจะต้องพิจารณา router.refresh()
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        disabled={isLoading}
        className="p-2 border border-input rounded-md bg-background text-foreground text-xs focus:ring-1 focus:ring-primary focus:border-primary"
      >
        {availableRoles.map(role => (
          <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
        ))}
      </select>
      <button
        onClick={handleRoleChange}
        disabled={isLoading || selectedRole === currentRole}
        className="px-3 py-2 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save Role'}
      </button>
      {message?.text && (
        <p className={`ml-2 text-xs ${message.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}