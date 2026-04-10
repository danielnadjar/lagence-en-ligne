"use client";

import { useEffect, useRef } from "react";

export function AdBanner({ slot }: { slot: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || ref.current.querySelector("script")) return;
    const script = document.createElement("script");
    script.src = "https://regie-pub-lemon.vercel.app/ad-widget.js";
    script.setAttribute("data-slot", slot);
    script.async = true;
    ref.current.appendChild(script);
  }, [slot]);

  return <div ref={ref} style={{ textAlign: "center", margin: "16px 0" }} />;
}
