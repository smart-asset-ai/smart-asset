"use client";

import { useEffect, useRef } from "react";

interface AdSenseProps {
  /** Slot ID from AdSense dashboard (e.g. "1234567890") */
  slot: string;
  /** Ad format: "auto" | "horizontal" | "rectangle" */
  format?: "auto" | "horizontal" | "rectangle";
  /** Full-width responsive (default: true) */
  responsive?: boolean;
  /** Extra className for the wrapper */
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdSense({
  slot,
  format = "auto",
  responsive = true,
  className = "",
}: AdSenseProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const ref = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet — ignore
    }
  }, [client]);

  // Don't render if no client ID configured
  if (!client) return null;

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ minHeight: 90, textAlign: "center" }}
    >
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
