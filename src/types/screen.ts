export type Direction = "row" | "col";
export type ButtonAction = "v" | "h" | "-";

export type Screen = {
  id: string | number;
  color: string;
};

export type ScreenGroup = {
  id: string | number;
  dir: Direction;
  sizes?: number[];
  children: ScreenNode[];
};

export type ScreenNode = Screen | ScreenGroup;
