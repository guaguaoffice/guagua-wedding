export const CARD_COLORS = [
  { label: "米白", value: "#f5f0eb", accent: "#8b7d6b" },
  { label: "紅",   value: "#f5e8e8", accent: "#b05050" },
  { label: "橙",   value: "#f5ede3", accent: "#b07040" },
  { label: "黃",   value: "#f5f0de", accent: "#a08830" },
  { label: "綠",   value: "#e4f0ea", accent: "#69ac90" },
  { label: "藍",   value: "#e8eef5", accent: "#4878a8" },
  { label: "紫",   value: "#ede8f5", accent: "#7858b0" },
  { label: "灰",   value: "#ececec", accent: "#606060" },
  { label: "白",   value: "#fafafa", accent: "#808080" },
] as const;

const DEFAULT_BG = "#e4f0ea";
const DEFAULT_ACCENT = "#69ac90";

export function getCardAccent(bgColor: string | null): string {
  const found = CARD_COLORS.find((c) => c.value === (bgColor ?? DEFAULT_BG));
  return found?.accent ?? DEFAULT_ACCENT;
}

export function getCardBg(bgColor: string | null): string {
  return bgColor ?? DEFAULT_BG;
}
