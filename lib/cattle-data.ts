export type CattleStatus = "Available" | "Reserved" | "Sold";

export type Cattle = {
  id: string;
  code: string;
  name: string;
  breed: string;
  color: string;
  weight_kg: number;
  age_teeth: number;
  height_inches: number;
  feed: string;
  health: string;
  price_bdt: number;
  status: CattleStatus;
  image_url: string | null;
  video_url: string | null;
  sort_order: number;
};

export const formatBDT = (n: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(n);
