'use client';

import type React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName?: string;
}

export function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  imageName,
}: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {/* biome-ignore lint/performance/noImgElement: Next/Image not desired for modal preview */}
        <img
          src={imageUrl || undefined}
          alt={imageName ?? 'Expanded image'}
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        />
      </DialogContent>
    </Dialog>
  );
}
