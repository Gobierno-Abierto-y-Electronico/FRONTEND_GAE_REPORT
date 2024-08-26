// hooks/useStoreReporte.js
import { useState } from 'react';
import { storeReporteData as storeReporteDataRequest } from '../../services/api';

export const useStoreReporte = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const storeReporteData = async (listado) => {
        setIsLoading(true);
        setError(null);

        const response = await storeReporteDataRequest({ listado });

        setIsLoading(false);
        if (response.error) {
            setError(response.e);
        } else {
            setData(response.data);
        }
    };

    return {
        storeReporteData,
        isLoading,
        error,
        data
    };
};
