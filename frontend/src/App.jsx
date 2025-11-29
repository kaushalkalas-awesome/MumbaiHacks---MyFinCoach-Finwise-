import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import OnboardingFlow from './pages/OnboardingFlow';
import PhoneInput from './pages/PhoneInput';
import BankDiscovery from './pages/BankDiscovery';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/" />;
}; // <-- This closing brace and semicolon was misplaced

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route
                        path="/onboarding"
                        element={
                            <ProtectedRoute>
                                <OnboardingFlow />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/phone-input"
                        element={
                            <ProtectedRoute>
                                <PhoneInput />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/bank-discovery"
                        element={
                            <ProtectedRoute>
                                <BankDiscovery />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;