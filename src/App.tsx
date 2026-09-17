import { useState } from "react";

type Direction = "row" | "col";
type ButtonDirection = "v" | "h";

type Screen = {
  id: number;
  color: string;
};

type ScreenGroup = {
  dir: Direction;
  children: ScreenNode[];
};

type ScreenNode = Screen | ScreenGroup;

const screensData: ScreenGroup = {
  dir: "row",
  children: [
    {
      dir: "col",
      children: [
        {
          dir: "row",
          children: [
            {
              id: 1,
              color: "red",
            },
            {
              id: 2,
              color: "tomato",
            },
          ],
        },
        {
          id: 3,
          color: "green",
        },
      ],
    },
    {
      id: 4,
      color: "blue",
    },
    {
      id: 5,
      color: "orange",
    },
  ],
};

const isScreenGroup = (item: ScreenNode): item is ScreenGroup => {
  return "dir" in item && "children" in item;
};

type ScreenProps = {
  screen: Screen;
  handleClick: (btn: ButtonDirection, screen: Screen) => void;
};

const Screen = ({ screen, handleClick }: ScreenProps) => {
  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-[0.4rem]"
      style={{ background: screen.color }}
    >
      <button
        onClick={() => handleClick("v", screen)}
        className="px-[0.65rem] py-1 text-white text-[1rem] border border-[#444] outline-none cursor-pointer bg-[#222] rounded-l-[0.3rem] border-r-0"
      >
        V
      </button>

      <button
        onClick={() => handleClick("h", screen)}
        className="px-[0.65rem] py-1 text-white text-[1rem] border border-[#444] outline-none cursor-pointer bg-[#222] rounded-r-[0.3rem]"
      >
        H
      </button>
    </div>
  );
};

type ScreensProps = {
  obj: ScreenGroup;
  handleClick: (btn: ButtonDirection, screen: Screen) => void;
};

const Screens = ({ obj, handleClick }: ScreensProps) => {
  return (
    <div
      className={`w-full h-full flex ${
        obj.dir === "col" ? "flex-col" : "flex-row"
      } items-center justify-center gap-[0.2rem]`}
    >
      {obj.children.map((item) => {
        if (isScreenGroup(item)) {
          return (
            <Screens
              key={crypto.randomUUID()}
              obj={item}
              handleClick={handleClick}
            />
          );
        }

        return <Screen key={item.id} screen={item} handleClick={handleClick} />;
      })}
    </div>
  );
};

const App = () => {
  const [screens, setScreens] = useState<ScreenGroup>(screensData);

  const recursiveMap = (
    item: ScreenNode,
    screen: Screen,
    btn: ButtonDirection,
  ): ScreenNode => {
    if (isScreenGroup(item)) {
      return {
        ...item,
        children: item.children.map((child) =>
          recursiveMap(child, screen, btn),
        ),
      };
    }

    if (item.id === screen.id) {
      return {
        dir: btn === "v" ? "row" : "col",
        children: [
          {
            id: Date.now(),
            color: "red",
          },
          item,
        ],
      };
    }

    return item;
  };

  const updateById = (btn: ButtonDirection, screen: Screen) => {
    const updatedScreens = recursiveMap(screens, screen, btn);

    if (isScreenGroup(updatedScreens)) {
      setScreens(updatedScreens);
    }
  };

  const handleClick = (btn: ButtonDirection, screen: Screen) => {
    updateById(btn, screen);
  };

  return (
    <div className="p-[0.2rem] w-full h-screen flex items-center justify-center">
      <Screens obj={screens} handleClick={handleClick} />
    </div>
  );
};

export default App;
