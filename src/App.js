import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import DeviceList from './components/DeviceList';
import CrusherInformation from './components/CrusherInformation';
import './App.css';
import ClassComponent from './components/ClassComponent';
import FunctionComponent from './components/Function_Component';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path='/' element={<AuthForm />} />
          <Route path='/DeviceList' element={<DeviceList />} />
          <Route path='/ClassComponent' element={<ClassComponent />} />
          <Route path='/crusher/:id' element={<CrusherInformation />} />
          <Route
            path='/FunctionComponent'
            element={<FunctionComponent />}
          ></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
