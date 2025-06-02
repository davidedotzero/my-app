// components/admin/media/MediaSelectorModal.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { getMediaItemsAction, type MediaItem } from '@/app/admin/media/actions'; // ตรวจสอบ Path
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ImageIcon, CheckSquare, Square } from 'lucide-react';
import Link from 'next/link';

type MediaSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect?: (selectedImageUrl: string, selectedAltText?: string) => void;
  onImagesSelect?: (selectedImageUrls: string[]) => void;
  multiSelect?: boolean;
  currentImageUrl?: string | null; // (Optional) เพื่อ highlight รูปที่ถูกเลือกอยู่ (ถ้ามี)
};

const ITEMS_PER_PAGE = 12;

export default function MediaSelectorModal({
  isOpen,
  onClose,
  onImageSelect,
  onImagesSelect,
  currentImageUrl,
  multiSelect = false,
}: MediaSelectorModalProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [locallySelectedUrls, setLocallySelectedUrls] = useState<string[]>([]);

  const fetchMedia = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getMediaItemsAction(page, ITEMS_PER_PAGE);
      if (result.error) {
        setError(result.error);
        setMediaItems([]);
        setTotalPages(0);
      } else {
        setMediaItems(result.items);
        if (result.count) {
          setTotalPages(Math.ceil(result.count / ITEMS_PER_PAGE));
        } else {
          setTotalPages(0);
        }
      }
    } catch (e: any) {
      setError('เกิดข้อผิดพลาดในการโหลดมีเดีย');
      setMediaItems([]);
      setTotalPages(0);
    }
    setIsLoading(false);
  }, []); // useCallback dependency array

  useEffect(() => {
    if (isOpen) {
      fetchMedia(currentPage);
    }
  }, [isOpen, currentPage, fetchMedia]);

  const handleItemClick = (item: MediaItem) => {
    if (!item.publicUrl) return;

    if (!multiSelect) { // โหมด Single Select (สำหรับรูปภาพหลัก)
      if (onImageSelect) onImageSelect(item.publicUrl, item.alt_text || item.title || undefined);
      onClose();
    } else { // โหมด Multi Select (สำหรับแกลเลอรี)
      setLocallySelectedUrls(prev =>
        prev.includes(item.publicUrl!)
          ? prev.filter(url => url !== item.publicUrl) // ถ้าเลือกแล้ว ให้เอาออก
          : [...prev, item.publicUrl!] // ถ้ายังไม่ได้เลือก ให้เพิ่มเข้าไป
      );
    }
  };

  const handleConfirmMultiSelect = () => {
    if (onImagesSelect) onImagesSelect(locallySelectedUrls);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-border">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">เลือกรูปภาพจากคลังมีเดีย</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted">
            <X size={22} />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
          {isLoading && <div className="flex justify-center items-center h-40"><p className="text-muted-foreground">กำลังโหลดรูปภาพ...</p></div>}
          {error && <div className="flex justify-center items-center h-40"><p className="text-destructive">{error}</p></div>}
          {!isLoading && !error && mediaItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <ImageIcon size={48} className="text-muted-foreground mb-3" />
              <p className="text-muted-foreground">ไม่พบรูปภาพในคลัง</p>
              <Link href="/admin/media" className="mt-2 text-sm text-primary hover:underline">
                ไปที่หน้าจัดการรูปภาพเพื่ออัปโหลด
              </Link>
            </div>
          )}
          {!isLoading && !error && mediaItems.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {mediaItems.map((item) => {
                const isSelected = multiSelect && item.publicUrl && locallySelectedUrls.includes(item.publicUrl);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`aspect-square relative rounded-md overflow-hidden border-2 transition-all 
                                ${isSelected ? 'border-primary ring-2 ring-primary ring-offset-1'
                        : 'border-border hover:border-primary/70 focus:border-primary/70'}`}
                    title={item.title || item.original_filename || 'เลือกรูปภาพนี้'}
                  >
                    {multiSelect && isSelected && (
                      <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5 z-10">
                        <CheckSquare size={14} />
                      </div>
                    )}
                    {item.publicUrl ? (
                      <Image src={item.publicUrl} alt={item.alt_text || item.original_filename || ''} fill sizes="20vw" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground p-1">No Preview</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-border flex justify-center items-center gap-2 text-sm">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 disabled:opacity-50 text-muted-foreground hover:text-primary disabled:hover:text-muted-foreground rounded-md hover:bg-muted"><ChevronLeft size={20} /></button>
            <span className="text-foreground">หน้า {currentPage} จาก {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 disabled:opacity-50 text-muted-foreground hover:text-primary disabled:hover:text-muted-foreground rounded-md hover:bg-muted"><ChevronRight size={20} /></button>
          </div>
        )}

        {multiSelect && mediaItems.length > 0 && (
          <div className="p-4 border-t border-border flex justify-end gap-3">
            <button type="button" onClick={onClose} className="py-2 px-4 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md">ยกเลิก</button>
            <button
              type="button"
              onClick={handleConfirmMultiSelect}
              className="py-2 px-4 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
            >
              ยืนยันการเลือก ({locallySelectedUrls.length} รูป)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}