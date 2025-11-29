import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const PhoneInput = () => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (phone.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Update user profile with phone number
            await axios.put('http://localhost:3000/api/users/me', {
                phone
            }, {
                headers: {
                    'x-firebase-uid': currentUser.uid
                }
            });

            // Navigate to bank discovery
            navigate('/bank-discovery');
        } catch (err) {
            console.error('Phone update error:', err);
            setError('Error saving phone number. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                padding: '60px 40px',
                borderRadius: '16px',
                boxShadow: 'var(--shadow)',
                maxWidth: '500px',
                width: '100%'
            }}>
                <h1 style={{
                    fontSize: '2rem',
                    marginBottom: '10px',
                    textAlign: 'center'
                }}>
                    Connect Your Bank Accounts
                </h1>

                <p style={{
                    color: 'var(--text-light)',
                    textAlign: 'center',
                    marginBottom: '40px'
                }}>
                    Enter your phone number to discover your bank accounts
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="Enter 10-digit mobile number"
                            required
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: 'red',
                            fontSize: '14px',
                            marginBottom: '15px',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '10px' }}
                        disabled={loading}
                    >
                        {loading ? 'Please wait...' : 'Continue'}
                    </button>
                </form>

                <div style={{
                    marginTop: '30px',
                    padding: '20px',
                    background: 'var(--bg-light)',
                    borderRadius: '8px'
                }}>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-light)',
                        margin: 0
                    }}>
                        🔒 Your data is secure. We use Account Aggregator technology to safely access your financial information with your consent.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PhoneInput;
