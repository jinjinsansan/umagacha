import { NextResponse } from "next/server";
import { GACHA_ANIMATIONS, GACHA_DEFINITIONS } from "@/constants/gacha";

const MOCK_HORSES = [
  { name: "ディープインパクト", rarity: 12 },
  { name: "ナリタブライアン", rarity: 11 },
  { name: "ダンスインザダーク", rarity: 9 },
  { name: "エルコンドルパサー", rarity: 8 },
  { name: "ナイスネイチャ", rarity: 6 },
  { name: "ツインターボ", rarity: 5 },
  { name: "ハルウララ", rarity: 3 },
  { name: "サクラバクシンオー", rarity: 7 },
  { name: "メイショウドトウ", rarity: 4 },
  { name: "地方馬A", rarity: 2 },
];

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const gacha = GACHA_DEFINITIONS.find((item) => item.id === params.id);
  if (!gacha) {
    return NextResponse.json({ error: "Gacha not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({ repeat: 1 }));
  const repeat = Math.min(Number(body.repeat) || 1, 10);
  const [minRarity, maxRarity] = gacha.rarityRange;

  const results = Array.from({ length: repeat }).map(() => {
    const pool = MOCK_HORSES.filter(
      (horse) => horse.rarity >= minRarity && horse.rarity <= maxRarity
    );
    const selection = pool[Math.floor(Math.random() * pool.length)] ?? MOCK_HORSES[0];
    const animation =
      GACHA_ANIMATIONS.find(
        (anim) => selection.rarity >= anim.rarityRange[0] && selection.rarity <= anim.rarityRange[1]
      )?.key ?? "g1";

    return {
      horse: selection.name,
      rarity: selection.rarity,
      animation,
    };
  });

  return NextResponse.json(
    {
      ticket: gacha.ticketLabel,
      results,
    },
    { status: 200 }
  );
}
