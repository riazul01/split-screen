import type { ButtonAction, Screen } from "types/screen";

type ScreenItemProps = {
  screen: Screen;
  handleClick: (btn: ButtonAction, screen: Screen) => void;
  canRemove: boolean;
};

const ScreenItem = ({
  screen,
  handleClick,
  canRemove,
}: ScreenItemProps) => {
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

export default ScreenItem;
