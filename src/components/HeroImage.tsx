import { useCallback } from 'react';

/**
 * Archive images arrive in every aspect ratio: a 1940s photograph is portrait,
 * the 2010 banknote is landscape, a museum hall is nearly square. A fixed
 * frame with object-cover would zoom a wide banknote into a giant crop of the
 * face, so a clearly wider-than-tall image switches to object-contain (the
 * frame keeps its uniform size, the image is letterboxed on the card
 * background instead of being cut up).
 */
export function HeroImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const adapt = useCallback((el: HTMLImageElement | null) => {
    if (!el || !el.complete || !el.naturalWidth) return;
    if (el.naturalWidth > el.naturalHeight) {
      el.classList.remove('object-cover', 'object-top');
      el.classList.add('object-contain');
    }
  }, []);

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      ref={adapt}
      onLoad={(e) => adapt(e.currentTarget)}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}
