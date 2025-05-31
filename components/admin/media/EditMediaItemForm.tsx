// components/admin/media/EditMediaItemForm.tsx
"use client";

import { useState } from 'react';
import { updateMediaItemMetadataAction } from '@/app/admin/media/actions'; // ตรวจสอบ Path
import type { MediaItem } from '@/app/admin/media/page'; // Import MediaItem type

type EditMediaItemFormProps = {
  item: MediaItem;
};

export default function EditMediaItemForm({ item }: EditMediaItemFormProps) {
  const [altText, setAltText] = useState(item.alt_text || '');
  const [title, setTitle] = useState(item.title || '');
  const [caption, setCaption] = useState(item.caption || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text?: string; type?: 'success' | 'error' } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('alt_text', altText);
    formData.append('title', title);
    formData.append('caption', caption);

    const result = await updateMediaItemMetadataAction(item.id, formData);
    setIsLoading(false);

    if (result.error) {
      setMessage({ text: result.error, type: 'error' });
    } else if (result.success) {
      setMessage({ text: result.message || 'อัปเดตสำเร็จ', type: 'success' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
      <div>
        <label htmlFor={`title-${item.id}`} className="block text-xs font-medium text-foreground/80 mb-1">Title:</label>
        <input
          type="text"
          id={`title-${item.id}`}
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-input rounded-md bg-background text-foreground text-xs"
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor={`alt_text-${item.id}`} className="block text-xs font-medium text-foreground/80 mb-1">Alt Text (สำคัญสำหรับ SEO):</label>
        <input
          type="text"
          id={`alt_text-${item.id}`}
          name="alt_text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          className="w-full p-2 border border-input rounded-md bg-background text-foreground text-xs"
          disabled={isLoading}
          placeholder="คำอธิบายรูปภาพสำหรับ SEO"
        />
      </div>
      <div>
        <label htmlFor={`caption-${item.id}`} className="block text-xs font-medium text-foreground/80 mb-1">Caption:</label>
        <textarea
          id={`caption-${item.id}`}
          name="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          className="w-full p-2 border border-input rounded-md bg-background text-foreground text-xs"
          disabled={isLoading}
        />
      </div>
      <div className="flex items-center gap-2">
        <button 
          type="submit" 
          disabled={isLoading}
          className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Meta'}
        </button>
        {message?.text && (
          <span className={`text-xs ${message.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>
            {message.text}
          </span>
        )}
      </div>
       <p className="text-xs text-muted-foreground mt-1">Path: <input type="text" readOnly value={item.storage_object_path} className="bg-transparent w-full text-xs"/></p>
       <p className="text-xs text-muted-foreground">Uploaded: {new Date(item.created_at).toLocaleDateString('th-TH', {day:'2-digit', month:'short', year:'numeric'})}</p>
    </form>
  );
}