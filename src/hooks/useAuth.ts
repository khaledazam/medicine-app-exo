import { useAuth as useAuthOriginal } from '../context/AuthContext';

export const useAuth = () => {
    return useAuthOriginal();
};
