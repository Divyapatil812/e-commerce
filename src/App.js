import React, { useState, useEffect } from 'react';
import Signup from './Signup';
import TransactionHub from './TransactionHub';

function App() {
    const [view, setView] = useState("LOADING");
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const savedUser = localStorage.getItem('neo_user');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // 1. If explicitly in Signup mode (e.g., user clicked Signup on home.html)
        if (urlParams.get('mode') === 'signup') {
            setView("SIGNUP");
            return;
        }

        // 2. If user has items to pay for, let them stay in React to finish the order
        if (savedUser && cart.length > 0) {
            setUserName(savedUser);
            setView("PAYMENT");
            return;
        }

        // 3. REFRESH RULE: In any other case (empty cart, home visit, or hard refresh),
        // force the browser to load the teammate's Welcome Page.
        window.location.href = "/welcome.html";
    }, []);

    // Show nothing while the "Gatekeeper" logic decides where to send the user
    if (view === "LOADING") return null;

    return (
        <div className="App">
            {view === "SIGNUP" ? (
                <Signup onAuthSuccess={(name) => {
                    localStorage.setItem('neo_user', name);
                    window.location.href = "/welcome.html"; // Redirect to Mall after Signup
                }} />
            ) : (
                <TransactionHub userName={userName} />
            )}
        </div>
    );
}

export default App;