import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  return (
    <div>
      <Header />
      <div className="app__page">
        <Sidebar />
        <main className="app__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;
