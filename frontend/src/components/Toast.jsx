import React, { useEffect, useState } from 'react';

const Toast = () => {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        let timer = null;
        const handleToast = (event) => {
            window.clearTimeout(timer);
            setToast(event.detail);
            timer = window.setTimeout(() => setToast(null), 2400);
        };

        window.addEventListener('surtaal-toast', handleToast);
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener('surtaal-toast', handleToast);
        };
    }, []);

    if (!toast) return null;

    return (
        <div className={`toast-message ${toast.type === 'error' ? 'error' : 'success'}`}>
            {toast.message}
        </div>
    );
};

export default Toast;
