'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import FavoriteButton from './FavoriteButton';

// Swipeable mobile gallery: horizontal scroll-snap carousel of every photo with a
// live counter and dots. Forced dir="ltr" so the index math is the same in RTL.
export default function Gallery({
  images,
  propertyId,
  favorited,
  isFeatured,
}: {
  images: { url: string }[];
  propertyId: string;
  favorited?: boolean;
  isFeatured?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  function onScroll() {
    const el = ref.current;
    if (!el || el.clientWidth === 0) return;
    setIdx(Math.min(images.length - 1, Math.round(Math.abs(el.scrollLeft) / el.clientWidth)));
  }

  function go(i: number) {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  }

  return (
    <div className="relative md:hidden">
      <div
        ref={ref}
        onScroll={onScroll}
        dir="ltr"
        className="flex aspect-[4/3] w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-2xl bg-sand-100 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.length === 0 && <div className="h-full w-full shrink-0 bg-sand-100" />}
        {images.map((img, i) => (
          <div key={i} className="relative h-full w-full shrink-0 snap-center" style={{ flexBasis: '100%' }}>
            <Image
              src={img.url}
              alt=""
              fill
              sizes="100vw"
              priority={i === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="absolute end-3 top-3">
        <FavoriteButton propertyId={propertyId} initial={favorited} />
      </div>

      {images.length > 1 && (
        <span className="absolute end-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
          {idx + 1} / {images.length}
        </span>
      )}

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`photo ${i + 1}`}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all active:scale-90 ${i === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`}
            />
          ))}
        </div>
      )}

      {isFeatured && <span className="badge-amber absolute start-3 top-3">★</span>}
    </div>
  );
}
