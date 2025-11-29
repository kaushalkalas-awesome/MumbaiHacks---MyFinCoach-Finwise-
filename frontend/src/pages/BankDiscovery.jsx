import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const BankDiscovery = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setAccounts([
            { id: '1', fipId: 'HDFC_BANK', maskedNumber: 'XXXX1234', type: 'DEPOSIT' },
            { id: '2', fipId: 'ICICI_BANK', maskedNumber: 'XXXX5678', type: 'DEPOSIT' },
            { id: '3', fipId: 'SBI_BANK', maskedNumber: 'XXXX9012', type: 'DEPOSIT' }
        ]);
    }, []);

    const toggleAccount = (accountId) => {
        setSelectedAccounts(prev =>
            prev.includes(accountId) ? prev.filter(id => id !== accountId) : [...prev, accountId]
        );
    };

    const handleContinue = async () => {
        if (selectedAccounts.length === 0) {
            setError('Please select at least one account');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const userResponse = await axios.get('http://localhost:3000/api/users/me', {
                headers: { 'x-firebase-uid': currentUser.uid }
            });

            const customerId = userResponse.data.user.customerId?.customerId;
            if (!customerId) {
                throw new Error('Customer ID not found');
            }

            const payload = {
                ver: '1.0',
                timestamp: new Date().toISOString(),
                txnid: `TXN${Date.now()}`,
                redirectUrl: 'http://localhost:5173/dashboard',
                Detail: {
                    consentStart: new Date().toISOString(),
                    consentExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                    Customer: { id: customerId },
                    FIDataRange: {
                        from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
                        to: new Date().toISOString()
                    },
                    consentMode: 'STORE',
                    consentTypes: ['TRANSACTIONS'],
                    fetchType: 'ONETIME',
                    Frequency: { unit: 'MONTHLY', value: 1 },
                    DataLife: { unit: 'MONTH', value: 12 },
                    DataConsumer: { id: 'mock_fiu_client_123' },
                    DataFilter: [],
                    Purpose: {
                        code: '101',
                        refUri: 'https://api.rebit.org.in',
                        text: 'Wealth management',
                        Category: { type: 'string' }
                    },
                    fiTypes: ['DEPOSIT']
                }
            };

            const res = await axios.post('http://localhost:3000/consents', payload, {
                headers: {
                    'x-client-id': 'mock_fiu_client_123',
                    'x-client-secret': 'mock_secret_key_456'
                }
            });

            window.location.href = `http://localhost:3000/mock-aa/consents/${res.data.id}`;
        } catch (err) {
            setError(err.response?.data?.errorMsg || err.message);
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-light)', padding: '40px 20px' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Select Your Bank Accounts</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '40px' }}>
                    Choose which accounts you want to connect
                </p>

                {error && (
                    <div style={{ background: '#fee', color: 'red', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'grid', gap: '15px', marginBottom: '30px' }}>
                    {accounts.map(account => (
                        <div
                            key={account.id}
                            onClick={() => toggleAccount(account.id)}
                            style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '12px',
                                border: `2px solid ${selectedAccounts.includes(account.id) ? 'var(--primary-color)' : '#e5e7eb'}`,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px'
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedAccounts.includes(account.id)}
                                onChange={() => { }}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <div style={{ flex: 1 }}>
                                <h3 style={{ marginBottom: '5px' }}>{account.fipId.replace('_', ' ')}</h3>
                                <p style={{ color: 'var(--text-light)', fontSize: '14px', margin: 0 }}>
                                    {account.type} • {account.maskedNumber}
                                </p>
                            </div>
                            <div style={{ fontSize: '24px' }}>🏦</div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleContinue}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={loading || selectedAccounts.length === 0}
                >
                    {loading ? 'Creating consent...' : `Continue with ${selectedAccounts.length} account${selectedAccounts.length !== 1 ? 's' : ''}`}
                </button>

                <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '14px', marginTop: '20px' }}>
                    🔒 Your data is encrypted and secure
                </p>
            </div>
        </div>
    );
};

export default BankDiscovery;
