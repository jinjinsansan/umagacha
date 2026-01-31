export type GachaDefinition = {
  id: "free" | "basic" | "epic" | "premium" | "ex";
  name: string;
  rarityRange: [number, number];
  ticketLabel: string;
  description: string;
  priceLabel: string;
  gradient: string;
  rates: { label: string; value: string }[];
  featuredNote?: string;
};

export const GACHA_DEFINITIONS: GachaDefinition[] = [
  {
    id: "free",
    name: "フリー",
    rarityRange: [1, 3],
    ticketLabel: "フリーチケット",
    description: "毎日1回無料で回せるスタンダードガチャ。",
    priceLabel: "FREE / DAY",
    gradient: "from-gacha-free/70 to-background",
    rates: [
      { label: "★3", value: "5%" },
      { label: "★2", value: "20%" },
      { label: "★1", value: "75%" },
    ],
  },
  {
    id: "basic",
    name: "ベーシック",
    rarityRange: [1, 6],
    ticketLabel: "ベーシックチケット",
    description: "王道のG1レース演出を楽しめる定番ライン。",
    priceLabel: "¥1,100",
    gradient: "from-gacha-basic/60 to-background",
    rates: [
      { label: "★6", value: "2%" },
      { label: "★4-5", value: "28%" },
      { label: "★1-3", value: "70%" },
    ],
  },
  {
    id: "epic",
    name: "エピック",
    rarityRange: [3, 8],
    ticketLabel: "エピックチケット",
    description: "名馬の誕生演出を軸にした中級者向け。",
    priceLabel: "¥5,500",
    gradient: "from-gacha-epic/60 to-background",
    rates: [
      { label: "★8", value: "1%" },
      { label: "★6-7", value: "24%" },
      { label: "★3-5", value: "75%" },
    ],
    featuredNote: "10連で★7以上確定",
  },
  {
    id: "premium",
    name: "プレミアム",
    rarityRange: [5, 10],
    ticketLabel: "プレミアムチケット",
    description: "有馬記念フィナーレに近い重厚演出。",
    priceLabel: "¥11,000",
    gradient: "from-gacha-premium/60 to-background",
    rates: [
      { label: "★10", value: "0.7%" },
      { label: "★8-9", value: "9.3%" },
      { label: "★5-7", value: "90%" },
    ],
    featuredNote: "追い込み演出確率 1.4x",
  },
  {
    id: "ex",
    name: "EX",
    rarityRange: [7, 12],
    ticketLabel: "EXチケット",
    description: "最上級の名馬と演出を備えた究極ガチャ。",
    priceLabel: "¥110,000",
    gradient: "from-gacha-ex/60 to-background",
    rates: [
      { label: "★12", value: "0.1%" },
      { label: "★10-11", value: "4.9%" },
      { label: "★7-9", value: "95%" },
    ],
    featuredNote: "演出完全解放",
  },
];

export const GACHA_ANIMATIONS = [
  { key: "g1", name: "G1レーススタート", rarityRange: [1, 6], duration: 5 },
  { key: "stables", name: "厩舎トレーニング", rarityRange: [1, 3], duration: 4 },
  { key: "birth", name: "名馬の誕生", rarityRange: [7, 9], duration: 6 },
  { key: "arima", name: "有馬記念フィナーレ", rarityRange: [10, 12], duration: 8 },
];
