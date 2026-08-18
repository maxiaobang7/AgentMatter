"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "agentmatter:favorites";

export function FavoriteButton({ resourceId }: { resourceId: string }) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const ids = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[];
        setFavorite(ids.includes(resourceId));
      } catch { setFavorite(false); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [resourceId]);

  function toggle() {
    let ids: string[] = [];
    try { ids = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[]; } catch { ids = []; }
    const next = ids.includes(resourceId) ? ids.filter((id) => id !== resourceId) : [...ids, resourceId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setFavorite(next.includes(resourceId));
  }

  return <button className={favorite ? "favorite-button active" : "favorite-button"} type="button" aria-pressed={favorite} onClick={toggle}><span aria-hidden="true">{favorite ? "★" : "☆"}</span>{favorite ? "已收藏" : "收藏到本机"}</button>;
}
