'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { useEffect, useState } from 'react';

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function ArticleImagePreview() {
  const [image, setImage] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('image-preview-open', Boolean(image));

    return () => {
      document.documentElement.classList.remove('image-preview-open');
    };
  }, [image]);

  useEffect(() => {
    const images = Array.from(document.querySelectorAll('.post-content img'));

    const openImage = (img) => {
      setImage({
        alt: img.getAttribute('alt') || 'Article image',
        src: img.currentSrc || img.getAttribute('src'),
      });
    };

    const cleanups = images.map((img) => {
      const handleClick = () => openImage(img);
      const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openImage(img);
        }
      };

      img.classList.add('is-previewable');
      img.setAttribute('role', 'button');
      img.setAttribute('tabindex', '0');
      img.setAttribute('title', 'Open image preview');
      img.addEventListener('click', handleClick);
      img.addEventListener('keydown', handleKeyDown);

      return () => {
        img.classList.remove('is-previewable');
        img.removeAttribute('role');
        img.removeAttribute('tabindex');
        img.removeAttribute('title');
        img.removeEventListener('click', handleClick);
        img.removeEventListener('keydown', handleKeyDown);
      };
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <Dialog.Root open={Boolean(image)} onOpenChange={(open) => !open && setImage(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="image-preview-overlay" />
        <Dialog.Content className="image-preview-content" aria-describedby={undefined}>
          <Dialog.Title className="image-preview-title">
            {image?.alt || 'Image preview'}
          </Dialog.Title>
          {image && (
            <div className="image-preview-frame">
              <Image
                className="image-preview-media"
                src={image.src}
                alt={image.alt}
                fill
                sizes="100vw"
                unoptimized
                onClick={() => setImage(null)}
              />
            </div>
          )}
          <Dialog.Close className="image-preview-close" aria-label="Close image preview">
            <CloseIcon />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
