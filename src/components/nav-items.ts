export const NAV_ITEMS = [
  { key: "home", href: "/", label: "總覽" },
  { key: "plan", href: "/plan", label: "規劃" },
  { key: "guest", href: "/guest", label: "賓客" },
  { key: "onsite", href: "/onsite", label: "現場" },
  { key: "more", href: "/more", label: "更多" },
] as const;

export function isActiveNav(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}
