import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import './Transaction.css';

const TransactionHub = ({ userName, location }) => {
    const [orderStatus, setOrderStatus] = useState('PAYMENT_PENDING'); 
    const [deliveryProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(savedCart);
    }, []);

    const finalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0) + 20;

    const generateReceipt = () => {
        const doc = new jsPDF();
        doc.setFont("courier", "bold");
        doc.text("NEOCOMMERCE // OFFICIAL RECEIPT", 20, 30);
        doc.setFontSize(10);
        doc.text(`OPERATOR: ${userName.toUpperCase()}`, 20, 50);
        doc.text(`TOTAL: Rs. ${finalAmount}`, 20, 60);
        doc.save(`Invoice_${userName}.pdf`);
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            const response = await fetch('https://e-commerce-yet6.onrender.com/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName, amount: finalAmount })
            });

            if (response.ok) {
                generateReceipt();
                setIsProcessing(false);
                setShowSuccessOverlay(true);
                localStorage.removeItem('cart');
                setTimeout(() => {
                    setShowSuccessOverlay(false);
                    setOrderStatus('SUCCESS');
                }, 4000);
            }
        } catch (err) {
            setIsProcessing(false);
            alert("Gateway Timeout");
        }
    };

    return (
        <div className="transaction-wrapper">
            {showSuccessOverlay && (
                <div className="success-overlay">
                    <h1 className="main-thank-you">NODE SYNC COMPLETE</h1>
                    <p className="visit-again-note">"We hope to see you visit our nodes again soon!"</p>
                </div>
            )}
            <div className="myntra-layout elite-shadow">
                <div className="payment-left">
                    <h2 className="payment-header-title">{orderStatus === 'PAYMENT_PENDING' ? "AUTHORIZE PAYLOAD" : "LIVE TELEMETRY"}</h2>
                    {orderStatus === 'PAYMENT_PENDING' ? (
                        <div className="upi-section">
                            <img src="/myqr.jpeg" alt="QR" className="qr-code-img" />
                            <button className="pink-pay-btn" onClick={handlePayment}>
                                {isProcessing ? "ENCRYPTING..." : `AUTHORIZE ₹${finalAmount}`}
                            </button>
                        </div>
                    ) : (
                        <div className="vertical-timeline">
                            {["Verified", "Processing", "Dispatch", "Arrival"].map((step, i) => (
                                <div key={i} className={`timeline-item ${deliveryProgress >= (i * 33) ? 'active' : ''}`}>
                                    <div className="marker-dot"></div><h4>{step}</h4>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="price-right">
                    <h3 className="price-header-gold">SUMMARY</h3>
                    {cartItems.map((item, idx) => (
                        <div key={idx} className="price-row"><span>{item.name}</span><span>₹{item.price * item.qty}</span></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TransactionHub;