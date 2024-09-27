// hooks/useUserInfo.ts
import { useEffect, useState } from "react";
import {
  useSetUsername,
  useSetEmail,
  useSetProfileImage,
  useSetCountry,
  useSetProduct,
} from "../services/store";

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
      const response = await fetch("http://localhost:8000/user_info", {
        credentials: "include",
      });

      if (response.ok) {
        const userInfo = await response.json();
        setUsername(userInfo.display_name);
        setEmail(userInfo.email);
        if (userInfo.images && userInfo.images.length > 0) {
          setProfileImage(userInfo.images[0].url); // Set profile image from the first available image
        } else {
          setProfileImage(null);
        }
        setCountry(userInfo.country);
        setProduct(userInfo.product);
        setIsLoggedIn(true);
      } else {
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
