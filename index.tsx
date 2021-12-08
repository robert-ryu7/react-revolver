import 'normalize.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Revolver from './revolver/Revolver';

import './demo.scss';

ReactDOM.render(
  <Revolver items={[1, 2, 3, 4]} itemWidth={100} itemHeight={108}>
    {({ item, index }) => (
      <div className="item" data-index={index}>
        {item}
      </div>
    )}
  </Revolver>,
  document.getElementById('root')
);
