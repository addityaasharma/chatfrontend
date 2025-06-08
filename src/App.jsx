import React from 'react'
import UserAuth from './components/UserAuth'
import Home from './components/Home';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const App = () => {
    const isAuthenticated = !!localStorage.getItem('authToken');

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<UserAuth />} />
                <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/home" />} />
            </Routes>
        </BrowserRouter>
    );
};


export default App