import { useState } from "react";
import ScreenRenderer from "./components/ScreenRenderer";
import type { ButtonAction, Screen, ScreenNode } from "./types/screen";
import {
  countScreens,
  removeNode,
  splitNode,
  updateGroupSizes,
} from "./utils/screenUtils";

const initialScreenData: Screen = {
  id: "screen-1",
  color: "#3b82f6",
};

const App = () => {
  const [screens, setScreens] = useState<ScreenNode>(initialScreenData);

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
