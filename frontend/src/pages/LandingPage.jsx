import React, { useState } from 'react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../firebase';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const [showModal, setShowModal] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setError('');
            await signInWithGoogle();
            navigate('/onboarding');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            if (isSignUp) {
                await signUpWithEmail(email, password);
            } else {
                await signInWithEmail(email, password);
            }

            navigate('/onboarding');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>Your Financial Journey Starts Here</h1>
                        <p>Take control of your money, build your future, achieve your dreams</p>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            Start Your Journey
                        </button>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">The Struggle is Real</h2>
                    <p className="section-subtitle">
                        Every day, millions of gig workers and freelancers face the same challenges
                    </p>

                    <div className="problem-grid">
                        <div className="problem-card">
                            <div className="problem-icon">😰</div>
                            <h3>Irregular Income</h3>
                            <p>
                                "I never know how much I'll earn next month. It's impossible to plan ahead."
                            </p>
                        </div>

                        <div className="problem-card">
                            <div className="problem-icon">📊</div>
                            <h3>No Financial Clarity</h3>
                            <p>
                                "My money is scattered across multiple accounts. I have no idea where it goes."
                            </p>
                        </div>

                        <div className="problem-card">
                            <div className="problem-icon">💸</div>
                            <h3>Living Paycheck to Paycheck</h3>
                            <p>
                                "I work hard but still struggle to save. There's got to be a better way."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section className="section solution">
                <div className="container">
                    <h2 className="section-title">Take Control of Your Money</h2>
                    <p className="section-subtitle">
                        We use cutting-edge Account Aggregator technology to give you complete financial visibility
                    </p>

                    <div className="solution-steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Connect Your Accounts</h3>
                            <p>Securely link all your bank accounts in one place</p>
                        </div>

                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Get Instant Insights</h3>
                            <p>See exactly where your money goes with smart categorization</p>
                        </div>

                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Make Better Decisions</h3>
                            <p>Receive personalized recommendations to save and grow</p>
                        </div>

                        <div className="step">
                            <div className="step-number">4</div>
                            <h3>Achieve Your Goals</h3>
                            <p>Build the financial future you deserve</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Real Impact, Real Results</h2>

                    <div className="impact-stats">
                        <div className="stat">
                            <div className="stat-number">10,000+</div>
                            <div className="stat-label">Users Empowered</div>
                        </div>

                        <div className="stat">
                            <div className="stat-number">₹50Cr+</div>
                            <div className="stat-label">Money Managed</div>
                        </div>

                        <div className="stat">
                            <div className="stat-number">35%</div>
                            <div className="stat-label">Average Savings Increase</div>
                        </div>

                        <div className="stat">
                            <div className="stat-number">4.9★</div>
                            <div className="stat-label">User Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section cta">
                <div className="container">
                    <h2>Your Turn to Thrive</h2>
                    <p>Join thousands who've taken control of their financial future</p>
                    <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
                        Get Started Free
                    </button>
                </div>
            </section>

            {/* Auth Modal */}
            <div className={`modal ${showModal ? 'active' : ''}`}>
                <div className="modal-content">
                    <span className="modal-close" onClick={() => setShowModal(false)}>×</span>

                    <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>

                    <button className="google-btn" onClick={handleGoogleSignIn} disabled={loading}>
                        <svg width="20" height="20" viewBox="0 0 20 20">
                            <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" />
                            <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z" />
                            <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z" />
                            <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="divider">OR</div>

                    {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

                    <form onSubmit={handleEmailAuth}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                minLength="6"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '14px' }}>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <span
                            style={{ color: '#6366f1', cursor: 'pointer', fontWeight: '600' }}
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
