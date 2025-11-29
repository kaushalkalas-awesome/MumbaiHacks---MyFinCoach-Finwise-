import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const USER_TYPES = [
    {
        id: 'GIG_WORKER',
        title: '🚗 Gig Worker',
        description: 'Uber, Ola, Deliveroo, or similar platform work'
    },
    {
        id: 'FREELANCER',
        title: '💼 Freelancer',
        description: 'Designer, Developer, Writer, Consultant'
    },
    {
        id: 'BUSINESS_OWNER',
        title: '🏪 Small Business Owner',
        description: 'Running your own business or shop'
    },
    {
        id: 'SALARIED',
        title: '💰 Salaried Employee',
        description: 'Regular monthly salary from employer'
    },
    {
        id: 'STUDENT',
        title: '📚 Student',
        description: 'Currently studying, part-time income'
    }
];

const QUESTIONS = {
    GIG_WORKER: [
        { q: 'How often do you receive payments?', options: ['Daily', 'Weekly', 'Monthly'] },
        { q: 'Do you track your expenses?', options: ['Yes', 'No', 'Sometimes'] },
        { q: "What's your biggest financial challenge?", options: ['Irregular income', 'Taxes', 'Savings'] },
        { q: 'Have you filed taxes before?', options: ['Yes', 'No'] },
        { q: 'Do you have an emergency fund?', options: ['Yes', 'No', 'Building one'] }
    ],
    FREELANCER: [
        { q: 'How many clients do you typically work with?', options: ['1-2', '3-5', '6+'] },
        { q: 'Do you invoice clients?', options: ['Yes', 'No', 'Sometimes'] },
        { q: 'How do you manage business expenses?', options: ['Separate account', 'Same account', "Don't track"] },
        { q: 'Are you registered as a business?', options: ['Yes', 'No', 'Planning to'] },
        { q: 'Do you save for taxes?', options: ['Yes', 'No', 'Need help'] }
    ],
    BUSINESS_OWNER: [
        { q: 'How long have you been in business?', options: ['<1 year', '1-3 years', '3+ years'] },
        { q: 'Do you have separate business accounts?', options: ['Yes', 'No', 'Planning to'] },
        { q: 'How do you track inventory/expenses?', options: ['Software', 'Spreadsheet', 'Manual'] },
        { q: 'Do you have employees?', options: ['Yes', 'No'] },
        { q: "What's your biggest challenge?", options: ['Cash flow', 'Growth', 'Compliance'] }
    ],
    SALARIED: [
        { q: 'Do you have a monthly budget?', options: ['Yes', 'No', 'Trying to create one'] },
        { q: 'How much do you save monthly?', options: ['<10%', '10-20%', '20%+'] },
        { q: 'Do you invest your savings?', options: ['Yes', 'No', 'Want to learn'] },
        { q: 'Do you have loans/EMIs?', options: ['Yes', 'No'] },
        { q: "What's your financial goal?", options: ['Save more', 'Invest better', 'Clear debt'] }
    ],
    STUDENT: [
        { q: 'Do you have part-time income?', options: ['Yes', 'No', 'Occasionally'] },
        { q: 'Who manages your finances?', options: ['Self', 'Parents', 'Both'] },
        { q: 'Do you track your spending?', options: ['Yes', 'No', 'Sometimes'] },
        { q: 'What do you spend most on?', options: ['Food', 'Transport', 'Entertainment'] },
        { q: 'Do you want to learn about investing?', options: ['Yes', 'No', 'Maybe later'] }
    ]
};

const OnboardingFlow = () => {
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setStep(2);
    };

    const handleAnswer = (answer) => {
        const newAnswers = [...answers, {
            question: QUESTIONS[selectedType][currentQuestion].q,
            answer
        }];
        setAnswers(newAnswers);

        if (currentQuestion < QUESTIONS[selectedType].length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Submit onboarding
            submitOnboarding(newAnswers);
        }
    };

    const submitOnboarding = async (finalAnswers) => {
        try {
            console.log('Submitting onboarding for user:', currentUser.uid);

            // Register user in backend
            const registerResponse = await axios.post('http://localhost:3000/api/users/register', {
                firebaseUid: currentUser.uid,
                email: currentUser.email,
                name: currentUser.displayName || currentUser.email.split('@')[0],
                userType: selectedType
            });

            console.log('User registered:', registerResponse.data);

            // Save onboarding answers
            const onboardingResponse = await axios.post('http://localhost:3000/api/users/onboarding', {
                answers: finalAnswers
            }, {
                headers: {
                    'x-firebase-uid': currentUser.uid
                }
            });

            console.log('Onboarding saved:', onboardingResponse.data);

            // Navigate to phone input for bank connection
            navigate('/phone-input');
        } catch (error) {
            console.error('Onboarding error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            const errorMessage = error.response?.data?.errorMsg || error.message || 'Unknown error';
            alert(`Error saving your information: ${errorMessage}\n\nPlease check if MongoDB is running and try again.`);
        }
    };

    const progress = step === 1 ? 0 : ((currentQuestion + 1) / QUESTIONS[selectedType].length) * 100;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-light)', padding: '40px 20px' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                {/* Progress Bar */}
                {step === 2 && (
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{
                            height: '8px',
                            background: '#e5e7eb',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                background: 'var(--gradient)',
                                width: `${progress}%`,
                                transition: 'width 0.3s ease'
                            }}></div>
                        </div>
                        <p style={{ textAlign: 'center', marginTop: '10px', color: 'var(--text-light)' }}>
                            Question {currentQuestion + 1} of {QUESTIONS[selectedType].length}
                        </p>
                    </div>
                )}

                {/* Step 1: User Type Selection */}
                {step === 1 && (
                    <div>
                        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Tell us about yourself</h1>
                        <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '40px' }}>
                            This helps us personalize your experience
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '20px'
                        }}>
                            {USER_TYPES.map(type => (
                                <div
                                    key={type.id}
                                    onClick={() => handleTypeSelect(type.id)}
                                    style={{
                                        background: 'white',
                                        padding: '30px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        border: '2px solid transparent',
                                        boxShadow: 'var(--shadow)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.borderColor = 'var(--primary-color)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }}
                                >
                                    <h3 style={{ marginBottom: '10px', fontSize: '1.3rem' }}>{type.title}</h3>
                                    <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>{type.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Questions */}
                {step === 2 && (
                    <div style={{
                        background: 'white',
                        padding: '60px 40px',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow)',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ marginBottom: '40px', fontSize: '1.8rem' }}>
                            {QUESTIONS[selectedType][currentQuestion].q}
                        </h2>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px',
                            maxWidth: '400px',
                            margin: '0 auto'
                        }}>
                            {QUESTIONS[selectedType][currentQuestion].options.map(option => (
                                <button
                                    key={option}
                                    onClick={() => handleAnswer(option)}
                                    className="btn btn-secondary"
                                    style={{ width: '100%', padding: '16px' }}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        {currentQuestion > 0 && (
                            <button
                                onClick={() => {
                                    setCurrentQuestion(currentQuestion - 1);
                                    setAnswers(answers.slice(0, -1));
                                }}
                                style={{
                                    marginTop: '30px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-light)',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem'
                                }}
                            >
                                ← Back
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OnboardingFlow;
