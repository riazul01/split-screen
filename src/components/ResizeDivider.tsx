import type { Direction } from "types/screen";

type ResizeDividerProps = {
  index: number;
  dir: Direction;
  colorA: string;
  colorB: string;
  isFocusedOrActive: boolean;
  onPointerDown: (index: number, e: React.PointerEvent<HTMLDivElement>) => void;
  onFocus: (index: number) => void;
  onBlur: () => void;
  onKeyDown: (index: number, e: React.KeyboardEvent) => void;
};

const ResizeDivider = ({
  index,
  dir,
  colorA,
  colorB,
  isFocusedOrActive,
  onPointerDown,
  onFocus,
  onBlur,
  onKeyDown,
}: ResizeDividerProps) => {
  const gradientBackground =
    dir === "row"
      ? `linear-gradient(to right, ${colorA}, ${colorB})`
      : `linear-gradient(to bottom, ${colorA}, ${colorB})`;

  return (
    <div
      tabIndex={0}
      onPointerDown={(e) => onPointerDown(index, e)}
      onFocus={() => onFocus(index)}
      onBlur={onBlur}
      onKeyDown={(e) => onKeyDown(index, e)}
      className={`shrink-0 flex items-center justify-center select-none z-10 group outline-none ${
        dir === "row"
          ? "w-[0.3rem] h-full cursor-col-resize"
          : "h-[0.3rem] w-full cursor-row-resize"
      }`}
      title="Drag or use arrow keys to resize"
    >
      <div
        className={`rounded-full transition-all duration-300 ease-out ${
          dir === "row" ? "w-0.5 h-6" : "h-0.5 w-6"
        } ${isFocusedOrActive ? "scale-110" : "group-hover:scale-110"}`}
        style={{
          background: isFocusedOrActive ? gradientBackground : undefined,
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
  );
};

export default ResizeDivider;
