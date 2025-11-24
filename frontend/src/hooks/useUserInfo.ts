// hooks/useUserInfo.ts
import { useEffect, useState, useCallback } from "react";
import {
    useSetUsername,
    useSetEmail,
    useSetProfileImage,
    useSetCountry,
    useSetProduct,
    useSetUserId,
    useSetIsLoggedIn,
    useSetAuthChecked,
} from "../services/store";
import { api } from '../repositories/apiConfig';

const useUserInfo = () => {
    const [isLoggedIn, setIsLoggedInLocal] = useState<boolean>(false);
    const setUsername = useSetUsername();
    const setEmail = useSetEmail();
    const setProfileImage = useSetProfileImage();
    const setCountry = useSetCountry();
    const setProduct = useSetProduct();
    const setUserId = useSetUserId();
    const setIsLoggedIn = useSetIsLoggedIn();
    const setAuthChecked = useSetAuthChecked();

    const resetUserDetails = useCallback(() => {
        setUsername("N/A");
        setEmail("N/A");
        setProfileImage(null);
        setCountry("N/A");
        setProduct("N/A");
        setUserId("N/A");
    }, [setUsername, setEmail, setProfileImage, setCountry, setProduct, setUserId]);

    const checkLoginStatus = useCallback(async () => {
        try {
            const resp = await api.get('/auth/user_info');
            const userInfo = resp.data;
            
            setUserId(userInfo.id || 'N/A');
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
            setIsLoggedInLocal(true);
            setIsLoggedIn(true);
        } catch (error) {
            // Check if this was a redirect from OAuth with authenticated=true
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('authenticated') === 'true') {
                // Clear the URL parameter and retry
                window.history.replaceState({}, '', window.location.pathname);
                // Retry fetching user info after a short delay
                setTimeout(() => checkLoginStatus(), 500);
                return;
            }
            
            console.error("Error checking login status", error);
            setIsLoggedInLocal(false);
            setIsLoggedIn(false);
            resetUserDetails();
        } finally {
            setAuthChecked(true);
        }
    }, [
        setUserId, setUsername, setEmail, setProfileImage, 
        setCountry, setProduct, setIsLoggedIn, setAuthChecked, resetUserDetails
    ]);

    useEffect(() => {
        checkLoginStatus();
    }, [checkLoginStatus]);

    return { isLoggedIn, checkLoginStatus, resetUserDetails };
};

export default useUserInfo;
