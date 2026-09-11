import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface Toast {
    id: number;
    message: string;
    severity: AlertColor;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, severity?: AlertColor, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({
    showToast: () => { },
});

export const useToast = () => useContext(ToastContext);

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, severity: AlertColor = 'info', duration: number = 4000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, severity, duration }]);
    };

    const handleClose = (id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toasts.map((toast, index) => (
                <Snackbar
                    key={toast.id}
                    open={true}
                    autoHideDuration={toast.duration ?? 4000}
                    onClose={() => handleClose(toast.id)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    sx={{ bottom: { xs: 16 + index * 70, sm: 24 + index * 70 } }}
                >
                    <Alert
                        onClose={() => handleClose(toast.id)}
                        severity={toast.severity}
                        variant="filled"
                        sx={{ width: '100%', boxShadow: 3 }}
                    >
                        {toast.message}
                    </Alert>
                </Snackbar>
            ))}
        </ToastContext.Provider>
    );
};
