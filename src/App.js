import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import DeviceList from './components/DeviceList';
import CrusherInformation from './components/CrusherInformation';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path='/' element={<AuthForm />} />
          <Route path='/DeviceList' element={<DeviceList />} />
          <Route path='/crusher/:id' element={<CrusherInformation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
