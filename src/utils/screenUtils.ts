import type { Screen, ScreenGroup, ScreenNode } from "types/screen";

export const COLOR_PALETTE = [
  // Reds & Corals
  "#ef4444",
  "#dc2626",
  "#f43f5e",
  "#e11d48",
  "#ff6b6b",
  "#fb7185",

  // Oranges & Ambers
  "#f97316",
  "#ea580c",
  "#f59e0b",
  "#d97706",
  "#fb923c",
  "#e67e22",

  // Yellows & Limes
  "#eab308",
  "#84cc16",
  "#65a30d",
  "#a3e635",

  // Greens & Teals
  "#22c55e",
  "#16a34a",
  "#10b981",
  "#059669",
  "#14b8a6",
  "#0d9488",
  "#2ec4b6",

  // Cyans & Blues
  "#06b6d4",
  "#0891b2",
  "#0ea5e9",
  "#0284c7",
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  "#4895ef",

  // Indigos, Purples & Violets
  "#6366f1",
  "#4f46e5",
  "#8b5cf6",
  "#7c3aed",
  "#a855f7",
  "#9333ea",

  // Fuchsias & Pinks
  "#d946ef",
  "#c026d3",
  "#ec4899",
  "#db2777",
  "#f72585",
];

export const getRandomColor = (excludeColor?: string): string => {
  const available = excludeColor
    ? COLOR_PALETTE.filter((c) => c.toLowerCase() !== excludeColor.toLowerCase())
    : COLOR_PALETTE;
  return available[Math.floor(Math.random() * available.length)];
};

export const isScreenGroup = (item: ScreenNode): item is ScreenGroup => {
  return "dir" in item && "children" in item;
};

export const countScreens = (node: ScreenNode): number => {
  if (!isScreenGroup(node)) return 1;
  return node.children.reduce((acc, child) => acc + countScreens(child), 0);
};

export const getEdgeColor = (node: ScreenNode, edge: "first" | "last"): string => {
  if (!isScreenGroup(node)) {
    return node.color;
  }
  if (node.children.length === 0) return "#94a3b8";
  const targetChild =
    edge === "first"
      ? node.children[0]
      : node.children[node.children.length - 1];
  return getEdgeColor(targetChild, edge);
};

export const splitNode = (
  item: ScreenNode,
  targetId: string | number,
  btn: "v" | "h"
): ScreenNode => {
  if (isScreenGroup(item)) {
    return {
      ...item,
      children: item.children.map((child) =>
        splitNode(child, targetId, btn)
      ),
    };
  }

  if (item.id === targetId) {
    const newScreen: Screen = {
      id: crypto.randomUUID(),
      color: getRandomColor(item.color),
    };
    return {
      id: crypto.randomUUID(),
      dir: btn === "v" ? "row" : "col",
      sizes: [50, 50],
      children: [newScreen, item],
    };
  }

  return item;
};

export const removeNode = (
  item: ScreenNode,
  targetId: string | number
): ScreenNode | null => {
  if (!isScreenGroup(item)) {
    return item.id === targetId ? null : item;
  }

  const currentSizes =
    item.sizes && item.sizes.length === item.children.length
      ? item.sizes
      : item.children.map(() => 100 / item.children.length);

  const remainingChildren: ScreenNode[] = [];
  const remainingSizes: number[] = [];

  item.children.forEach((child, idx) => {
    const updatedChild = removeNode(child, targetId);
    if (updatedChild !== null) {
      remainingChildren.push(updatedChild);
      remainingSizes.push(currentSizes[idx]);
    }
  });

  if (remainingChildren.length === 0) {
    return null;
  }

  // Collapse single-child group to its child to restore previous state
  if (remainingChildren.length === 1) {
    return remainingChildren[0];
  }

  // Normalize remaining sizes so they sum to 100%
  const totalSize = remainingSizes.reduce((acc, val) => acc + val, 0);
  const normalizedSizes =
    totalSize > 0
      ? remainingSizes.map((s) => (s / totalSize) * 100)
      : remainingChildren.map(() => 100 / remainingChildren.length);

  return {
    ...item,
    children: remainingChildren,
    sizes: normalizedSizes,
  };
};

export const updateGroupSizes = (
  node: ScreenNode,
  groupId: string | number,
  newSizes: number[]
): ScreenNode => {
  if (!isScreenGroup(node)) return node;

  if (node.id === groupId) {
    return {
      ...node,
      sizes: newSizes,
    };
  }

  return {
    ...node,
    children: node.children.map((child) =>
      updateGroupSizes(child, groupId, newSizes)
    ),
  };
};
