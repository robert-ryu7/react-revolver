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
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const revolverRef = React.useRef<HTMLDivElement>();
  const [revolverWidth, setRevolverWidth] = React.useState<number | null>(null);
  const [panInfo, setPanInfo] = React.useState<{
    deltaX: number;
  } | null>(null);

  const itemDistance = itemWidth + itemsGap;
  const renderedItemsCount = Math.ceil(revolverWidth / itemDistance) + 2;
  const wingItemsCount = Math.floor(renderedItemsCount / 2);
  const firstIndex = currentIndex - wingItemsCount;

  const handlePanEnd = React.useCallback<HammerListener>(() => {
    setPanInfo(null);
  }, []);

  const handlePan = React.useCallback<HammerListener>((event) => {
    setPanInfo({ deltaX: event.deltaX });
  }, []);

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
      <Motion
        defaultStyle={{ x: 0 }}
        style={{ x: spring(panInfo?.deltaX ?? 0) }}
      >
        {({ x }) => (
          <div
            className="revolver"
            style={{ height: itemHeight }}
            ref={revolverRef}
          >
            <div className="revolver__origin">
              {Array.from({ length: renderedItemsCount }).map((_, index) => {
                const key = firstIndex + index;
                const dX = itemDistance * key;
                const itemIndex = wrapIndex(key, items.length);
                const item = items[itemIndex];

                return (
                  <Hammer onPanEnd={handlePanEnd} onPan={handlePan}>
                    <div
                      key={key}
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
          </div>
        )}
      </Motion>
      <pre>{JSON.stringify({ panInfo, revolverWidth })}</pre>
    </React.Fragment>
  );
}

export default Revolver;
