"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { clsx } from "clsx";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  SOUS_ADMIN: "Sous-admin",
  NEGOCIATEUR: "NÃ©gociateur",
};

const navItems = [
  {
    label: "Tableau de bord",
    href: "/admin/dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    roles: ["ADMIN", "SOUS_ADMIN", "NEGOCIATEUR"],
  },
  {
    label: "Clients",
    href: "/admin/clients",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
    roles: ["ADMIN", "SOUS_ADMIN", "NEGOCIATEUR"],
  },
  {
    label: "Vendeurs",
    href: "/admin/vendeurs",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    roles: ["ADMIN", "SOUS_ADMIN", "NEGOCIATEUR"],
  },
  {
    label: "Ã‰quipe",
    href: "/admin/equipe",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    roles: ["ADMIN", "SOUS_ADMIN"],
  },
  {
    label: "ParamÃ¨tres",
    href: "/admin/parametres",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37c.996.608 2.296.07 2.572-1.065z(4ÄÔ€ÄÉ„Ì€Ì€À€ÄÄ´Ø€À€Ì€Ì€À€ÀÄØ€Áèˆ°4(€€€É½±•Ìèl‰5%8‰t°4(€ô°4)tì4(4)•áÁ½ÉĞ‘•™…Õ±Ğ™Õ¹Ñ¥½¸M¥‘•‰…È ¤ì4(€½¹ÍĞÁ…Ñ¡¹…µ”€ôÕÍ•A…Ñ¡¹…µ” ¤ì4(€½¹ÍĞì‘…Ñ„èÍ•ÍÍ¥½¸ô€ôÕÍ•M•Ídå¸ ¤ì4(€½¹ÍĞÕÍ•ÉI½±”€ô€¡Í•ÍÍ¥½¸ü¹ÕÍ•È…Ì…¹ä¤ü¹É½±”ñğ€‰94-TEUR 3B 0