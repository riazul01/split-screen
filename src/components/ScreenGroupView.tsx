import { Fragment, useRef, useState } from "react";
import type { ButtonAction, Screen, ScreenGroup } from "types/screen";
import { getEdgeColor } from "utils/screenUtils";
import ScreenRenderer from "./ScreenRenderer";
import ResizeDivider from "./ResizeDivider";

type ScreenGroupViewProps = {
  group: ScreenGroup;
  handleClick: (btn: ButtonAction, screen: Screen) => void;
  canRemove: boolean;
  onResize: (groupId: string | number, newSizes: number[]) => void;
};

const ScreenGroupView = ({
  group,
  handleClick,
  canRemove,
  onResize,
}: ScreenGroupViewProps) => {
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
              <ResizeDivider
                index={idx}
                dir={group.dir}
                colorA={colorA}
                colorB={colorB}
                isFocusedOrActive={isFocusedOrActive}
                onPointerDown={handlePointerDown}
                onFocus={(i) => setFocusedDivider(i)}
                onBlur={() => setFocusedDivider(null)}
                onKeyDown={handleKeyDown}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

export default ScreenGroupView;
