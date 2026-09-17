import { useState } from "react";

type Direction = "row" | "col";
type ButtonAction = "v" | "h" | "-";

type Screen = {
  id: string | number;
  color: string;
};

type ScreenGroup = {
  id: string | number;
  dir: Direction;
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
  children: [
    {
      id: "group-1",
      dir: "col",
      children: [
        {
          id: "group-2",
          dir: "row",
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
      className="w-full h-full flex-1 flex items-center justify-center rounded-[0.4rem] min-w-0 min-h-0 transition-all duration-200"
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
};

const ScreenRenderer = ({
  node,
  handleClick,
  canRemove,
}: ScreenRendererProps) => {
  if (isScreenGroup(node)) {
    return (
      <div
        className={`w-full h-full flex-1 flex ${
          node.dir === "col" ? "flex-col" : "flex-row"
        } items-stretch justify-stretch gap-[0.2rem] min-w-0 min-h-0`}
      >
        {node.children.map((child) => (
          <ScreenRenderer
            key={child.id}
            node={child}
            handleClick={handleClick}
            canRemove={canRemove}
          />
        ))}
      </div>
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

    const updatedChildren = item.children
      .map((child) => removeNode(child, targetId))
      .filter((child): child is ScreenNode => child !== null);

    if (updatedChildren.length === 0) {
      return null;
    }

    // Collapse single-child group to its child to restore previous state
    if (updatedChildren.length === 1) {
      return updatedChildren[0];
    }

    return {
      ...item,
      children: updatedChildren,
    };
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
    <div className="p-[0.2rem] w-screen h-screen flex items-center justify-center bg-white overflow-hidden box-border">
      <ScreenRenderer
        node={screens}
        handleClick={handleClick}
        canRemove={totalScreens > 1}
      />
    </div>
  );
};

export default App;
