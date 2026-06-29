'use client';

import { useRef, useState } from 'react';

type Item = { id: string; preview: string; url?: string; uploading: boolean; error?: boolean; errorMsg?: string };

// Downscale to a max edge + re-encode as JPEG so phone photos upload fast and stay within limits.
async function resizeToJpeg(file: File, max = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  if (Math.max(width, height) > max) {
    const s = max / Math.max(width, height);
    width = Math.round(width * s);
    height = Math.round(height * s);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', quality),
  );
}

export default function ImageUploader({ onChange, max = 8 }: { onChange: (urls: string[]) => void; max?: number }) {
  const [items, setItems] = useState<Item[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const emit = (next: Item[]) => onChange(next.filter((i) => i.url).map((i) => i.url!));

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const chosen = Array.from(files).slice(0, Math.max(0, max - items.length));
    for (const file of chosen) {
      const id = Math.random().toString(36).slice(2);
      setItems((p) => [...p, { id, preview: URL.createObjectURL(file), uploading: true }]);
      try {
        let blob: Blob = file;
        try {
          blob = await resizeToJpeg(file);
        } catch {
          /* unsupported decode (e.g. HEIC) → upload original, server still validates */
        }
        const fd = new FormData();
        fd.append('file', blob, 'photo.jpg');
        const res = await fetch('/api/uploads', { method: 'POST', body: fd });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error?.message || `Upload failed (${res.status})`);
        }
        const { url } = await res.json();
        setItems((p) => {
          const n = p.map((i) => (i.id === id ? { ...i, url, uploading: false } : i));
          emit(n);
          return n;
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Upload failed';
        setItems((p) => p.map((i) => (i.id === id ? { ...i, uploading: false, error: true, errorMsg } : i)));
      }
    }
    if (inputRef.current) inputRef.current.value = '';
  }

  function remove(id: string) {
    setItems((p) => {
      const n = p.filter((i) => i.id !== id);
      emit(n);
      return n;
    });
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {items.map((it) => (
        <div key={it.id} className="relative aspect-square overflow-hidden rounded-xl bg-sand-100 ring-1 ring-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={it.preview} alt="" className="h-full w-full object-cover" />
          {it.uploading && <div className="absolute inset-0 grid place-items-center bg-black/30 text-xs font-medium text-white">…</div>}
          {it.error && (
            <div className="absolute inset-0 grid place-content-center gap-0.5 bg-rose-600/80 p-1 text-center text-white">
              <span className="text-lg font-bold leading-none">!</span>
              {it.errorMsg && <span className="text-[9px] leading-tight">{it.errorMsg}</span>}
            </div>
          )}
          <button
            type="button"
            onClick={() => remove(it.id)}
            aria-label="remove"
            className="absolute end-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/55 text-sm text-white"
          >
            ×
          </button>
        </div>
      ))}
      {items.length < max && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-black/15 text-ink/40 transition hover:bg-sand-100"
        >
          <span className="text-2xl leading-none">＋</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}
