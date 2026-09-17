import { Fragment, useRef, useState } from "react";

type Direction = "row" | "col";
type ButtonAction = "v" | "h" | "-";

type Screen = {
  id: string | number;
  color: string;
};

type ScreenGroup = {
  id: string | number;
  dir: Direction;
  sizes?: number[];
  children: ScreenNode[];
};

type ScreenNode = Screen | ScreenGroup;

const COLOR_PALETTE = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#84cc16",
  "#e11d48",
  "#0284c7",
  "#7c3aed",
  "#d946ef",
  "#22c55e",
];

const getRandomColor = (): string => {
  return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
};

const screensData: ScreenGroup = {
  id: "root-group",
  dir: "row",
  sizes: [50, 25, 25],
  children: [
    {
      id: "group-1",
      dir: "col",
      sizes: [60, 40],
      children: [
        {
          id: "group-2",
          dir: "row",
          sizes: [50, 50],
          children: [
            {
              id: "screen-1",
              color: "#ef4444",
            },
            {
              id: "screen-2",
              color: "#f97316",
            },
          ],
        },
        {
          id: "screen-3",
          color: "#10b981",
        },
      ],
    },
    {
      id: "screen-4",
      color: "#3b82f6",
    },
    {
      id: "screen-5",
      color: "#f59e0b",
    },
  ],
};

const isScreenGroup = (item: ScreenNode): item is ScreenGroup => {
  return "dir" in item && "children" in item;
};

const countScreens = (node: ScreenNode): number => {
  if (!isScreenGroup(node)) return 1;
  return node.children.reduce((acc, child) => acc + countScreens(child), 0);
};

type ScreenProps = {
  screen: Screen;
  handleClick: (btn: ButtonAction, screen: Screen) => void;
  canRemove: boolean;
};

const Screen = ({ screen, handleClick, canRemove }: ScreenProps) => {
  return (
    <div
      className="w-full h-full flex-1 flex items-center justify-center rounded-[0.4rem] min-w-0 min-h-0 transition-all duration-200 select-none"
      style={{ background: screen.color }}
    >
      <div className="flex items-center shadow-md rounded-[0.35rem] overflow-hidden bg-[#222]/90 backdrop-blur-sm border border-black/20">
        <button
          onClick={() => handleClick("v", screen)}
          className="px-3 py-1.5 text-white font-medium text-sm hover:bg-[#333] active:bg-[#444] transition-colors cursor-pointer border-r border-[#444]"
          title="Split Vertically"
        >
          v
        </button>

        <button
          onClick={() => handleClick("h", screen)}
          className={`px-3 py-1.5 text-white font-medium text-sm hover:bg-[#333] active:bg-[#444] transition-colors cursor-pointer ${
            canRemove ? "border-r border-[#444]" : ""
          }`}
          title="Split Horizontally"
        >
          h
        </button>

        {canRemove && (
          <button
            onClick={() => handleClick("-", screen)}
            className="px-3 py-1.5 text-white font-medium text-sm transition-colors hover:bg-red-600 active:bg-red-700 cursor-pointer"
            title="Remove Screen"
          >
            -
          </button>
        )}
      </div>
    </div>
  );
};

type ScreenRendererProps = {
  node: ScreenNode;
  handleClick: (btn: ButtonAction, screen: Screen) => void;
  canRemove: boolean;
  onResize: (groupId: string | number, newSizes: number[]) => void;
};

const getEdgeColor = (node: ScreenNode, edge: "first" | "last"): string => {
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

const ScreenGroupView = ({
  group,
  handleClick,
  canRemove,
  onResize,
}: {
  group: ScreenGroup;
  handleClick: (btn: ButtonAction, screen: Screen) => void;
  canRemove: boolean;
  onResize: (groupId: string | number, newSizes: number[]) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDivider, setActiveDivider] = useState<number | null>(null);
  const [focusedDivider, setFocusedDivider] = useState<number | null>(null);

  const sizes =
    group.sizes && group.sizes.length === group.children.length
      ? group.sizes
      : group.children.map(() => 100 / group.children.length);

  const handlePointerDown = (
    index: number,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const isRow = group.dir === "row";
    const startPos = isRow ? e.clientX : e.clientY;
    const rect = container.getBoundingClientRect();
    const totalPx = isRow ? rect.width : rect.height;
    if (totalPx <= 0) return;

    const initialSizes = [...sizes];
    const sizeA = initialSizes[index];
    const sizeB = initialSizes[index + 1];
    const combinedSize = sizeA + sizeB;
    const MIN_PERCENT = 4;

    setActiveDivider(index);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const currentPos = isRow ? moveEvent.clientX : moveEvent.clientY;
      const deltaPx = currentPos - startPos;
      const deltaPercent = (deltaPx / totalPx) * 100;

      let newSizeA = sizeA + deltaPercent;
      let newSizeB = sizeB - deltaPercent;

      if (newSizeA < MIN_PERCENT) {
        newSizeA = MIN_PERCENT;
        newSizeB = combinedSize - MIN_PERCENT;
      } else if (newSizeB < MIN_PERCENT) {
        newSizeB = MIN_PERCENT;
        newSizeA = combinedSize - MIN_PERCENT;
      }

      const nextSizes = [...initialSizes];
      nextSizes[index] = newSizeA;
      nextSizes[index + 1] = newSizeB;

      onResize(group.id, nextSizes);
    };

    const handlePointerUp = () => {
      setActiveDivider(null);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    const isRow = group.dir === "row";
    const step = e.shiftKey ? 5 : 2;
    let delta = 0;

    if (isRow) {
      if (e.key === "ArrowLeft") delta = -step;
      if (e.key === "ArrowRight") delta = step;
    } else {
      if (e.key === "ArrowUp") delta = -step;
      if (e.key === "ArrowDown") delta = step;
    }

    if (delta !== 0) {
      e.preventDefault();
      const initialSizes = [...sizes];
      const sizeA = initialSizes[index];
      const sizeB = initialSizes[index + 1];
      const combinedSize = sizeA + sizeB;
      const MIN_PERCENT = 4;

      let newSizeA = sizeA + delta;
      let newSizeB = sizeB - delta;

      if (newSizeA < MIN_PERCENT) {
        newSizeA = MIN_PERCENT;
        newSizeB = combinedSize - MIN_PERCENT;
      } else if (newSizeB < MIN_PERCENT) {
        newSizeB = MIN_PERCENT;
        newSizeA = combinedSize - MIN_PERCENT;
      }

      const nextSizes = [...initialSizes];
      nextSizes[index] = newSizeA;
      nextSizes[index + 1] = newSizeB;
      onResize(group.id, nextSizes);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex-1 flex ${
        group.dir === "col" ? "flex-col" : "flex-row"
      } items-stretch justify-stretch min-w-0 min-h-0 ${
        activeDivider !== null ? "select-none" : ""
      }`}
    >
      {group.children.map((child, idx) => {
        const size = sizes[idx] ?? 100 / group.children.length;
        const isNotLast = idx < group.children.length - 1;

        const nextChild = isNotLast ? group.children[idx + 1] : null;
        const colorA = isNotLast ? getEdgeColor(child, "last") : "";
        const colorB = nextChild ? getEdgeColor(nextChild, "first") : "";
        const isFocusedOrActive =
          activeDivider === idx || focusedDivider === idx;

        const gradientBackground = isNotLast
          ? group.dir === "row"
            ? `linear-gradient(to right, ${colorA}, ${colorB})`
            : `linear-gradient(to bottom, ${colorA}, ${colorB})`
          : undefined;

        return (
          <Fragment key={child.id}>
            <div
              className="min-w-0 min-h-0 flex items-stretch"
              style={{
                flex: `${size} 1 0%`,
              }}
            >
              <ScreenRenderer
                node={child}
                handleClick={handleClick}
                canRemove={canRemove}
                onResize={onResize}
              />
            </div>

            {isNotLast && (
              <div
                tabIndex={0}
                onPointerDown={(e) => handlePointerDown(idx, e)}
                onFocus={() => setFocusedDivider(idx)}
                onBlur={() => setFocusedDivider(null)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`flex-shrink-0 flex items-center justify-center select-none z-10 group outline-none ${
                  group.dir === "row"
                    ? "w-[0.3rem] h-full cursor-col-resize"
                    : "h-[0.3rem] w-full cursor-row-resize"
                }`}
                title="Drag or use arrow keys to resize"
              >
                <div
                  className={`rounded-full transition-all duration-300 ease-out ${
                    group.dir === "row" ? "w-[2px] h-6" : "h-[2px] w-6"
                  } ${
                    isFocusedOrActive
                      ? "scale-110"
                      : "group-hover:scale-110"
                  }`}
                  style={{
                    background: isFocusedOrActive
                      ? gradientBackground
                      : undefined,
                    boxShadow: isFocusedOrActive
                      ? `0 0 6px ${colorA}80, 0 0 6px ${colorB}80`
                      : undefined,
                  }}
                >
                  {!isFocusedOrActive && (
                    <div className="w-full h-full rounded-full bg-neutral-300 group-hover:bg-neutral-600 transition-colors duration-300" />
                  )}
                </div>
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

const ScreenRenderer = ({
  node,
  handleClick,
  canRemove,
  onResize,
}: ScreenRendererProps) => {
  if (isScreenGroup(node)) {
    return (
      <ScreenGroupView
        group={node}
        handleClick={handleClick}
        canRemove={canRemove}
        onResize={onResize}
      />
    );
  }

  return (
    <Screen
      key={node.id}
      screen={node}
      handleClick={handleClick}
      canRemove={canRemove}
    />
  );
};

const App = () => {
  const [screens, setScreens] = useState<ScreenNode>(screensData);

  const splitNode = (
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
        color: getRandomColor(),
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

  const removeNode = (
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

  const updateGroupSizes = (
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

  const handleResize = (groupId: string | number, newSizes: number[]) => {
    setScreens((prev) => updateGroupSizes(prev, groupId, newSizes));
  };

  const handleClick = (btn: ButtonAction, screen: Screen) => {
    if (btn === "-") {
      if (countScreens(screens) <= 1) return;
      const updatedScreens = removeNode(screens, screen.id);
      if (updatedScreens) {
        setScreens(updatedScreens);
      }
    } else {
      const updatedScreens = splitNode(screens, screen.id, btn);
      setScreens(updatedScreens);
    }
  };

  const totalScreens = countScreens(screens);

  return (
    <div className="p-[0.3rem] w-screen h-screen flex items-center justify-center bg-white overflow-hidden box-border">
      <ScreenRenderer
        node={screens}
        handleClick={handleClick}
        canRemove={totalScreens > 1}
        onResize={handleResize}
      />
    </div>
  );
};

export default App;
