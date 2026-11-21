import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
/** Class joiner that lets later utilities (e.g. a caller's `w-40`) override earlier ones (`w-full`). */
export const cn = (...v: ClassValue[]) => twMerge(clsx(v));
