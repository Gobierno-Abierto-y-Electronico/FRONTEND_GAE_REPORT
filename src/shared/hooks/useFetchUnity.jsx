import { useState, useEffect } from "react";
import { getUnityById as getUnityByIdRequest } from "../../services/api";
import toast from "react-hot-toast";

export const useFetchUnity = (unityId) => {
  const [assistance, setUnity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUnity = async () => {
    setIsLoading(true);

    const response = await getUnityByIdRequest(unityId);

    setIsLoading(false);
    if (response.error) {
      setError(response.e);
      toast.error(
        response.e?.response?.data || 'Error al cargar la unidad'
      );
    } else {
      setUnity(response.data);
    }
  };

  useEffect(() => {
    if (unityId) {
      fetchUnity();
    }
  }, [unityId]);

  return {
    assistance,
    isLoading,
    error
  };
};
