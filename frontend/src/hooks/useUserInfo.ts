// hooks/useUserInfo.ts
import { useEffect, useState } from "react";
import {
    useSetUsername,
    useSetEmail,
    useSetProfileImage,
    useSetCountry,
    useSetProduct,
} from "../services/store";
import { api } from '../repositories/apiConfig';

const useUserInfo = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const setUsername = useSetUsername();
    const setEmail = useSetEmail();
    const setProfileImage = useSetProfileImage();
    const setCountry = useSetCountry();
    const setProduct = useSetProduct();

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            try {
                const resp = await api.get('/auth/user_info');
                const userInfo = resp.data;
                setUsername(userInfo.display_name || 'N/A');
                setEmail(userInfo.email || 'N/A');

                if (userInfo.images && userInfo.images.length > 0) {
                    // pick first available image
                    setProfileImage(userInfo.images[0].url || null);
                } else {
                    setProfileImage(null);
                }
                setCountry(userInfo.country || 'N/A');
                setProduct(userInfo.product || 'N/A');
                setIsLoggedIn(true);
            } catch (e) {
                setIsLoggedIn(false);
                resetUserDetails();
            }
        } catch (error) {
            console.error("Error checking login status", error);
            setIsLoggedIn(false);
            resetUserDetails();
        }
    };

    const resetUserDetails = () => {
        setUsername("N/A");
        setEmail("N/A");
        setProfileImage(null);
        setCountry("N/A");
        setProduct("N/A");
    };

    return { isLoggedIn, checkLoginStatus, resetUserDetails };
};

export default useUserInfo;
