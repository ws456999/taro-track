import React from 'react';
import './app.less'
import { initAutoTrack } from './tracks/init';

initAutoTrack();

const App = ({children}) => {
  return children
}

export default App
