import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import App from './App.jsx';
import './index.css';
import HomePage from './pages/HomePage.jsx';
import PlayPage from './pages/PlayPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import StarsPage from './pages/StarsPage.jsx';
import StarVideosPage from './pages/StarVideosPage.jsx';
import ChannelsPage from './pages/ChannelsPage.jsx';
import ChannelVideosPage from './pages/ChannelVideosPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';

import ManageAccountPage from './pages/ManageAccountPage.jsx';

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    ),
  },
  {
    path: '/',
    element: (
      <AuthProvider>
        <PrivateRoute>
          <App />
        </PrivateRoute>
      </AuthProvider>
    ),
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/account',
        element: <ManageAccountPage />,
      },
      {
        path: '/history',
        element: <HistoryPage />,
      },
      {
        path: '/play/:id',
        element: <PlayPage />,
      },
      {
        path: '/search',
        element: <SearchPage />,
      },
      {
        path: '/stars',
        element: <StarsPage />,
      },
      {
        path: '/star/:name',
        element: <StarVideosPage />,
      },
      {
        path: '/channels',
        element: <ChannelsPage />,
      },
      {
        path: '/channel/:name',
        element: <ChannelVideosPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
