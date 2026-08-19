"use client";

import { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";

export function BaiduAnalyticsHead({ loader }: { loader: string }) {
  const inserted = useRef(false);

  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;

    return <script id="agentmatter-baidu-analytics" dangerouslySetInnerHTML={{ __html: loader }} />;
  });

  return null;
}
