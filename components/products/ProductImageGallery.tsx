// components/products/ProductImageGallery.tsx
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';

type ProductImageGalleryProps = {
  mainImageUrl?: string | null;
  galleryImageUrls?: string[] | null;
  altText: string;
};

export default function ProductImageGallery({ mainImageUrl, galleryImageUrls, altText }: ProductImageGalleryProps) {
  // รวม mainImageUrl เข้าไปใน allImages เพื่อให้เป็นส่วนหนึ่งของ thumbnails และสามารถเลือกได้
  const initialImages = mainImageUrl ? [mainImageUrl] : [];
  const allDisplayImages = Array.from(new Set([...initialImages, ...(galleryImageUrls || [])])).filter(Boolean) as string[];
  
  const [currentImage, setCurrentImage] = useState(allDisplayImages[0] || 'https://via.placeholder.com/600x600/e2e8f0/94a3b8?text=No+Image');

  useEffect(() => {
    // อัปเดต currentImage ถ้า mainImageUrl หรือ allDisplayImages เปลี่ยนไป และ currentImage ไม่ได้อยู่ใน allDisplayImages แล้ว
    // หรือถ้า currentImage ยังเป็นค่าเริ่มต้น placeholder และ allDisplayImages มีรูปแล้ว
    const effectiveMainImage = allDisplayImages[0] || 'https://via.placeholder.com/600x600/e2e8f0/94a3b8?text=No+Image';
    if (currentImage === 'https://via.placeholder.com/600x600/e2e8f0/94a3b8?text=No+Image' && effectiveMainImage !== currentImage) {
         setCurrentImage(effectiveMainImage);
    } else if (!allDisplayImages.includes(currentImage) && allDisplayImages.length > 0) {
         setCurrentImage(effectiveMainImage);
    } else if (allDisplayImages.length === 0 && currentImage !== 'https://via.placeholder.com/600x600/e2e8f0/94a3b8?text=No+Image') {
         setCurrentImage('https://via.placeholder.com/600x600/e2e8f0/94a3b8?text=No+Image');
    }
  }, [mainImageUrl, galleryImageUrls, allDisplayImages, currentImage]);


  if (allDisplayImages.length === 0) {
    return (
      <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center border border-border shadow-inner">
        <p className="text-muted-foreground text-sm">ไม่มีรูปภาพสินค้า</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg border border-border bg-muted">
        <Image
          src={currentImage}
          alt={altText}
          fill
          sizes="(max-width: 1023px) 100vw, 50vw"
          className="object-contain"
          priority={currentImage === allDisplayImages[0]}
          key={currentImage} 
        />
      </div>

      {/* Thumbnails */}
      {allDisplayImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 md:gap-3">
          {allDisplayImages.map((imgUrl, index) => (
            <button
              key={imgUrl + index} // ใช้ imgUrl + index เพื่อ unique key
              type="button"
              onClick={() => setCurrentImage(imgUrl)}
              className={`aspect-square relative w-full overflow-hidden rounded-md border-2 transition-all
                          ${currentImage === imgUrl 
                            ? 'border-primary ring-2 ring-primary ring-offset-1' 
                            : 'border-transparent hover:border-primary/50 focus:border-primary/70 opacity-70 hover:opacity-100'
                          }`}
              aria-label={`ดูรูปภาพ ${index + 1}`}
            >
              <Image
                src={imgUrl}
                alt={`${altText} - รูปตัวอย่าง ${index + 1}`}
                fill
                sizes="20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}