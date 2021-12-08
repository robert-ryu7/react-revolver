import './Revolver.scss';

import * as React from 'react';
import Hammer from 'react-hammerjs';
import { Motion, spring } from 'react-motion';

type ItemToRender<T> = {
  item: T;
  key: number;
  x: number;
};

export type RevolverProps<T> = {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  itemsGap?: number;
  children: (item: ItemToRender<T>) => React.ReactNode;
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

  const itemsToRender = React.useMemo<ItemToRender<T>[]>(() => {
    const dx = itemWidth + itemsGap;
    const visibleItemsCount = Math.ceil(revolverWidth / dx) + 2;
    const maxDistance = Math.floor(visibleItemsCount / 2);
    const firstIndex = currentIndex - maxDistance;
    const indexes = Array.from({ length: visibleItemsCount }).map((_, i) => {
      const revolverItemKey = firstIndex + i;
      const temp = revolverItemKey % items.length;
      if (temp < 0) return [revolverItemKey, items.length + temp];
      return [revolverItemKey, temp];
    });
    return indexes.map(([key, index]) => {
      const x = dx * key;
      return { item: items[index], key, x };
    });
  }, [items, itemWidth, itemsGap, currentIndex, revolverWidth, panInfo]);

  return (
    <React.Fragment>
      <div
        className="revolver"
        style={{ height: itemHeight }}
        ref={revolverRef}
      >
        <div className="revolver__origin">
          {itemsToRender.map((item) => (
            <Motion
              defaultStyle={{ x: 0 }}
              style={{ x: spring(panInfo?.deltaX ?? 0) }}
            >
              {({ x }) => (
                <Hammer onPanEnd={handlePanEnd} onPan={handlePan}>
                  <div
                    key={item.key}
                    className="revolver__item"
                    style={{
                      width: itemWidth,
                      left: itemWidth / -2,
                      transform: `translate3d(${x + item.x}px,0,0)`,
                    }}
                  >
                    {children(item)}
                  </div>
                </Hammer>
              )}
            </Motion>
          ))}
        </div>
      </div>
      <pre>{JSON.stringify({ panInfo, revolverWidth })}</pre>
    </React.Fragment>
  );
}

export default Revolver;
