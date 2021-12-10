import './Revolver.scss';

import * as React from 'react';
import Hammer from 'react-hammerjs';
import { Motion, spring } from 'react-motion';

const wrapIndex = (index: number, length: number) => {
  let a = index % length;
  if (a < 0) a = length + a;
  return a;
};

export type RevolverProps<T> = {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  itemsGap?: number;
  children: (item: T) => React.ReactNode;
};

function Revolver<T>({
  items,
  itemWidth,
  itemHeight,
  itemsGap = 0,
  children,
}: RevolverProps<T>) {
  const [offset, setOffset] = React.useState(0);
  const [motionKey, setMotionKey] = React.useState(0);
  const xRef = React.useRef(0);
  const revolverRef = React.useRef<HTMLDivElement>();
  const [revolverWidth, setRevolverWidth] = React.useState<number | null>(null);
  const [panInfo, setPanInfo] = React.useState<{
    deltaX: number;
  } | null>(null);

  const itemDistance = itemWidth + itemsGap;
  const renderedItemsCount = Math.ceil(revolverWidth / itemDistance) + 2;
  const wingItemsCount = Math.floor(renderedItemsCount / 2);

  const handlePanEnd = React.useCallback<HammerListener>(() => {
    setPanInfo(null);
    setOffset(Math.round(-xRef.current / itemDistance));
  }, []);

  const handlePan = React.useCallback<HammerListener>((event) => {
    setPanInfo({ deltaX: event.deltaX });
  }, []);

  const handleRest = React.useCallback(() => {
    const itemIndex = wrapIndex(offset, items.length);
    if(itemIndex === offset) return;
    setOffset(itemIndex);
    console.log({ offset, itemIndex });
    setMotionKey((s) => s + 1);
  }, [offset]);

  React.useEffect(() => {
    document.documentElement.classList.toggle('revolver-grabbing', !!panInfo);
  }, [panInfo]);

  React.useEffect(() => {
    const observer = new window.ResizeObserver(([entry]) => {
      setRevolverWidth(entry.target.clientWidth);
    });
    observer.observe(revolverRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <React.Fragment>
      <div
        className="revolver"
        style={{ height: itemHeight }}
        ref={revolverRef}
      >
        <Motion
          key={motionKey}
          defaultStyle={{ x: 0 }}
          style={{ x: spring((panInfo?.deltaX ?? 0) - offset * itemDistance) }}
          onRest={handleRest}
        >
          {({ x }) => {
            xRef.current = x;
            const middleItemIndex = Math.round(-x / itemDistance);
            const firstIndex = middleItemIndex - wingItemsCount;

            return (
              <div className="revolver__origin">
                {Array.from({ length: renderedItemsCount }).map((_, index) => {
                  const key = firstIndex + index;
                  const dX = itemDistance * key;
                  const itemIndex = wrapIndex(key, items.length);
                  const item = items[itemIndex];

                  return (
                    <Hammer key={key} onPanEnd={handlePanEnd} onPan={handlePan}>
                      <div
                        className="revolver__item"
                        style={{
                          width: itemWidth,
                          left: itemWidth / -2,
                          transform: `translate3d(${x + dX}px,0,0)`,
                        }}
                      >
                        {children(item)}
                      </div>
                    </Hammer>
                  );
                })}
              </div>
            );
          }}
        </Motion>
      </div>
      <pre>{JSON.stringify({ panInfo, revolverWidth })}</pre>
    </React.Fragment>
  );
}

export default Revolver;
