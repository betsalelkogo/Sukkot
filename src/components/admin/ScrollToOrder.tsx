"use client";

import { useEffect } from "react";

export function ScrollToOrder() {
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) {
      return;
    }
    document.getElementById(id)?.scrollIntoView({ block: "center" });
  }, []);
  return null;
}
