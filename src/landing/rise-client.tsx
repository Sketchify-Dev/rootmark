"use client";

import type { ReactNode } from "react";
import { useChapterInk } from "./motion";
import { useRise } from "./rise";

export function Rise({ children }: { children: ReactNode }) {
  useRise();
  useChapterInk();
  return <>{children}</>;
}
