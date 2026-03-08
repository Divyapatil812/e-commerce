import React, { useState, useRef, useEffect } from 'react';
import './Signup.css';

const Signup = () => {
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [formData, setFormData] = useState({ name: "", email: "", mobile: "" });
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [isVerifying, setIsVerifying] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const inputRefs = useRef([]);
    // --- YOUR ADDED REDIRECTION LOGIC ---
    const onSignupSuccess = (userName, locationData) => {
        // 1. Save the name so home.html can display "Welcome [Name]"
        localStorage.setItem('neo_user', userName);
        localStorage.setItem('neo_loc', JSON.stringify(locationData));

        // 2. Redirect to the Product Mall
        window.location.href = "/home.html"; 
    };
    // ------------------------------------
// Inside your Signup component
const [location, setLocation] = useState({ city: "DETECTING...", lat: null, lon: null });

useEffect(() => {
    // 1. Check if the browser supports Geolocation
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // 2. Capture coordinates
                const { latitude, longitude } = position.coords;
                setLocation(prev => ({ ...prev, lat: latitude, lon: longitude }));
                
                // Optional: You can send these to a Backend API here
                console.log(`Node established at: ${latitude}, ${longitude}`);
            },
            (error) => {
                console.error("Location access denied:", error.message);
                setLocation(prev => ({ ...prev, city: "ACCESS DENIED" }));
            },
            { enableHighAccuracy: true } // Uses GPS hardware for "Elite" precision
        );
    }
}, []);
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

  const handleNext = async (e) => {
    e.preventDefault();
    if (formData.mobile.length === 10) {
        try {
            const res = await fetch('/.netlify/functions/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: formData.mobile })
            });
            
            if (res.ok) {
                setStep(2);
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.log("Server Response Error:", res.status, errorData);
                alert(`Failed to send Security Key. Reason: ${errorData.error || 'Server Error'}`);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            alert("Backend Node Offline or Network Error.");
        }
    }
};

    // API Call: Verify OTP
    const finalSubmit = async () => {
        setIsVerifying(true);
      try {
            const res = await fetch('/.netlify/functions/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    mobile: formData.mobile, 
                    otp: otp.join(""), // Combine 6 input boxes
                    name: formData.name, // Sending name to save in MongoDB
                    location: location   // Sending GPS data to save in MongoDB
                })
            });
            const data = await res.json();
            
if (data.valid) {
    setShowSuccess(true);
    setTimeout(() => {
        onSignupSuccess(formData.name, location);
    }, 2500);
} else {
    alert("INVALID SECURITY KEY.");
    setIsVerifying(false);
}
        } catch (err) {
            setIsVerifying(false);
        }
    };

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return;
        let newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);
        if (element.value !== "" && index < 5) inputRefs.current[index + 1].focus();
    };


    return (
        <div className="signup-wrapper">
{/* INSERT THE NAV HERE */}
        <nav className="neo-nav">
            <div className="logo-section">
                <h1 className="logo">NEOCOMMERCE</h1>
            </div>
            <div className="nav-info">
                <span className="node-id">
                    NODE: {location.lat ? `${location.lat.toFixed(2)}N / ${location.lon.toFixed(2)}E` : "LOCATING..."}
                </span>
                <span className="mode-status animate-pulse"> MODE: SYSTEM_ACCESS</span>
            </div>
        </nav>
            {/* INTERACTIVE GLOW: Moves with your mouse */}
            <div 
                className="mouse-glow" 
                style={{ 
                    left: `${mousePos.x}px`, 
                    top: `${mousePos.y}px` 
                }}
            ></div>
            <div className="grid-bg"></div> {/* Teammate's Grid */}
            
            {showSuccess && (
                <div className="success-modal">
                    <div className="success-content">
                        <div className="success-icon">✓</div>
                        <h2>Account Created!</h2>
                        <p>Welcome <span className="highlight">{formData.name}</span></p>
                        <p className="success-message">Your account is now active and ready to use</p>
                    </div>
                </div>
            )}
            
            <div className="signup-card animate-reveal">
                {step === 1 ? (
                    <form onSubmit={handleNext} className="signup-form">
                        <h1 className="gradient-text">Create Account</h1>
                        <p className="subtitle">Enter your credentials to join the elite tier</p>
                        
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" required placeholder="Divya" 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>

                        <div className="input-group">
                            <label>Email Address</label>
                            <input type="email" 
                            required placeholder="divya@example.com" 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>

                        <div className="input-group">
                            <label>Mobile Number</label>
                            <input type="text" required placeholder="98765 43210" 
                                onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
                        </div>

                        <button type="submit" className="btn-elite main-btn">Request Access Key</button>
                    </form>
                ) : (
                    <div className="otp-view">
                        <h1 className="gradient-text">Security Check</h1>
                        <p>We've sent a 6-digit key to +91 {formData.mobile}</p>
                        
                        <div className="otp-inputs">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    ref={el => inputRefs.current[index] = el}
                                    onChange={e => handleOtpChange(e.target, index)}
                                />
                            ))}
                        </div>

                        <button className="btn-elite main-btn" onClick={finalSubmit} disabled={isVerifying}>
                            {isVerifying ? "Verifying..." : "Confirm & Create"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Signup;