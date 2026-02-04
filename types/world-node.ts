export type WorldNode = {
  _id: string;
  _creationTime: number;
  type: "tree" | "rock" | "ore_deposit";
  x: number;
  y: number;
  health: number;
  respawnAt?: number;
};
