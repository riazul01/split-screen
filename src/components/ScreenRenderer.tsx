import type { ButtonAction, Screen, ScreenNode } from "types/screen";
import { isScreenGroup } from "utils/screenUtils";
import ScreenGroupView from "./ScreenGroupView";
import ScreenItem from "./ScreenItem";

export type ScreenRendererProps = {
  node: ScreenNode;
  handleClick: (btn: ButtonAction, screen: Screen) => void;
  canRemove: boolean;
  onResize: (groupId: string | number, newSizes: number[]) => void;
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
    <ScreenItem
      key={node.id}
      screen={node}
      handleClick={handleClick}
      canRemove={canRemove}
    />
  );
};

export default ScreenRenderer;
