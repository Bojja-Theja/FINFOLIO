import React, { useEffect, useState } from 'react';

interface ClientOnlyProps {
    children: React.ReactNode;
}

const ClientOnly: React.FC<ClientOnlyProps> = ({ children }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div style={{ height: '300px' }} />; // Placeholder to avoid layout shift
    }

    return <>{children}</>;
};

export default ClientOnly;
