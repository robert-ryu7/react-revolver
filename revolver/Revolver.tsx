import './Revolver.scss';

import * as React from 'react';
import Hammer from 'react-hammerjs';
import { Motion, spring } from 'react-motion';
import clsx from 'clsx';

type ItemToRender<T> = {
  item: T;
  index: number;
};

export type RevolverProps<T> = {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  children: (item: ItemToRender<T>) => React.ReactNode;
};

function Revolver<T>({
  items,
  itemWidth,
  itemHeight,
  children,
}: RevolverProps<T>) {
  const itemsToRender = React.useMemo<ItemToRender<T>[]>(() => {
    return items.map((item, index) => ({ item, index }));
  }, [items]);
  const [panInfo, setPanInfo] = React.useState<{
    deltaX: number;
  } | null>(null);

  const handlePanEnd = React.useCallback<HammerListener>((event) => {
    setPanInfo(null);
  }, []);

  const handlePan = React.useCallback<HammerListener>((event) => {
    setPanInfo({ deltaX: event.deltaX });
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle('revolver-grabbing', !!panInfo);
  }, [panInfo]);

  return (
    <React.Fragment>
      <div className="revolver" style={{ height: itemHeight }}>
        <div className="revolver__origin">
          {itemsToRender.map((item, index) => (
            <Motion
              defaultStyle={{ x: 0 }}
              style={{ x: spring(panInfo?.deltaX ?? 0) }}
            >
              {({ x }) => (
                <Hammer onPanEnd={handlePanEnd} onPan={handlePan}>
                  <div
                    key={index}
                    className={clsx(
                      'revolver__item',
                      panInfo && 'revolver__item--grabbing'
                    )}
                    style={{
                      width: itemWidth,
                      left: itemWidth / -2,
                      transform: `translate3d(${x}px,0,0)`,
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
      <pre>{JSON.stringify({ panInfo })}</pre>
    </React.Fragment>
  );
}

export default Revolver;
