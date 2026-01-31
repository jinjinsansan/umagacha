export type TicketCode = "free" | "basic" | "epic" | "premium" | "ex";

export const TICKET_THEMES: Record<
  TicketCode,
  { gradient: string; badge: string; accent?: string }
> = {
  free: {
    gradient: "from-gacha-free/70 to-background",
    badge: "text-gacha-free",
  },
  basic: {
    gradient: "from-gacha-basic/60 to-background",
    badge: "text-gacha-basic",
  },
  epic: {
    gradient: "from-gacha-epic/60 to-background",
    badge: "text-gacha-epic",
  },
  premium: {
    gradient: "from-gacha-premium/60 to-background",
    badge: "text-gacha-premium",
  },
  ex: {
    gradient: "from-gacha-ex/60 to-background",
    badge: "text-gacha-ex",
  },
};
