import 'normalize.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Revolver from './revolver/Revolver';

import './demo.scss';

ReactDOM.render(
  <Revolver items={[1, 2, 3]} itemWidth={100} itemHeight={108} itemsGap={12}>
    {(item) => <div className="item">{item}</div>}
  </Revolver>,
  document.getElementById('root')
);
