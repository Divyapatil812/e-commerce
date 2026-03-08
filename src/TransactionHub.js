import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import './Transaction.css';

const TransactionHub = ({ userName, location }) => {
    const [orderStatus, setOrderStatus] = useState('PAYMENT_PENDING'); 
    const [deliveryProgress, setDeliveryProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [telemetryLog, setTelemetryLog] = useState([]);
    const [droneCoords, setDroneCoords] = useState({ lat: 12.9716, lng: 77.5946 });

    useEffect(() => {
        if (orderStatus === 'SUCCESS') {
            const logs = [
                "INITIALIZING NODE SYNC...",
                "UPLINK ESTABLISHED.",
                "PACKAGE SECURED AT ORIGIN.",
                "ROUTING ALGORITHM ACTIVE.",
                "AERIAL DRONE DISPATCHED.",
                "CALCULATING OPTIMAL TRAJECTORY...",
                "APPROACHING DESTINATION SECTOR.",
                "LANDING SEQUENCE INITIATED.",
                "DELIVERY CONFIRMED."
            ];

            let progress = 0;
            let logIndex = 0;

            const trackingInterval = setInterval(() => {
                progress += 1;
                if (progress > 100) progress = 100;
                setDeliveryProgress(progress);

                if (progress % 12 === 0 && logIndex < logs.length) {
                    setTelemetryLog(prev => [...prev, logs[logIndex]]);
                    logIndex++;
                }

                setDroneCoords(prev => ({
                    lat: prev.lat + (Math.random() - 0.5) * 0.005,
                    lng: prev.lng + (Math.random() - 0.5) * 0.005
                }));

                if (progress >= 100) {
                    clearInterval(trackingInterval);
                    setTimeout(() => {
                        window.location.href = '/feedback.html';
                    }, 1500);
                }
            }, 100);

            return () => clearInterval(trackingInterval);
        }
    }, [orderStatus]);

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
            const response = await fetch('/.netlify/functions/api/finalize-transaction', {
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
                    <p className="visit-again-note">"Neural handshake confirmed; your high-value asset has been locked into the delivery grid."</p>
                </div>
            )}
            <div className="myntra-layout elite-shadow">
                <div className="payment-left">
                    <h2 className="payment-header-title">{orderStatus === 'PAYMENT_PENDING' ? "AUTHORIZE PAYLOAD" : "LIVE TELEMETRY"}</h2>
                    {orderStatus === 'PAYMENT_PENDING' ? (
                        <div className="payment-selection-container">
                            <div className="payment-methods">
                                <button className={`method-btn ${paymentMethod === 'UPI' ? 'active' : ''}`} onClick={() => setPaymentMethod('UPI')}>UPI / QR</button>
                                <button className={`method-btn ${paymentMethod === 'COD' ? 'active' : ''}`} onClick={() => setPaymentMethod('COD')}>Cash on Delivery</button>
                            </div>
                            
                            {paymentMethod === 'UPI' ? (
                                <div className="upi-section">
                                    <h3 className="upi-pay-title">PHONEPE PAYMENT</h3>
                                    <img src="/phonepe_qr.jpeg" alt="PhonePe QR" className="qr-code-img" />
                                    <button className="pink-pay-btn" onClick={handlePayment}>
                                        {isProcessing ? "ENCRYPTING..." : `AUTHORIZE ₹${finalAmount}`}
                                    </button>
                                </div>
                            ) : (
                                <div className="cod-section">
                                    <h3 className="upi-pay-title">CASH ON DELIVERY</h3>
                                    <p className="cod-desc">Pay with cash when your premium order arrives at your destination. No online transaction required today.</p>
                                    <button className="pink-pay-btn" onClick={handlePayment}>
                                        {isProcessing ? "PROCESSING..." : `CONFIRM ORDER ₹${finalAmount}`}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="live-telemetry-container">
                            <div className="telemetry-hud">
                                <div className="hud-header">
                                    <span className="blink-text"><i className="fas fa-satellite-dish"></i> LIVE LINK</span>
                                    <span>DRONE_ID: N-77X</span>
                                </div>
                                <div className="map-view">
                                    <div className="drone-marker" style={{ left: `${deliveryProgress}%` }}>
                                        <i className="fas fa-fighter-jet"></i>
                                    </div>
                                    <div className="map-grid"></div>
                                </div>
                                <div className="coords-display">
                                    <span>LAT: {droneCoords.lat.toFixed(5)}</span>
                                    <span>LNG: {droneCoords.lng.toFixed(5)}</span>
                                    <span>ALT: {Math.max(0, 150 - (deliveryProgress * 1.5)).toFixed(1)}m</span>
                                </div>
                            </div>
                            
                            <div className="telemetry-logs">
                                {telemetryLog.map((log, idx) => (
                                    <div key={idx} className="log-line">{`> ${log}`}</div>
                                ))}
                                {deliveryProgress < 100 && <div className="log-line blink-cursor">_</div>}
                            </div>

                            <div className="telemetry-progress-bar">
                                <div className="telemetry-fill" style={{ width: `${deliveryProgress}%` }}></div>
                            </div>

                            <div className="vertical-timeline horizontal">
                                {["Verified", "Processing", "Dispatch", "Arrival"].map((step, i) => (
                                    <div key={i} className={`timeline-item ${deliveryProgress >= (i * 33) ? 'active' : ''}`}>
                                        <div className="marker-dot"></div><h4>{step}</h4>
                                    </div>
                                ))}
                            </div>
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