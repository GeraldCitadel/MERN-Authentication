import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios, { axiosPrivate } from '../config/axios';


export const AppContext = createContext()

const AppContextProvider = ({ children }) => {
    const [userData, setUserData] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const getUserData = async () => {
        try {
            const { data } = await axiosPrivate.get("/api/user/data")
            data.success ? setUserData(data.userData) : toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    };


    const getAuthState = async () => {
        try {
            const { data } = await axiosPrivate.get("/api/auth/is-auth")
            if (data.success) {
                setIsLoggedIn(true) 
                getUserData()
            }else {
                toast.error(data.message)
            }
            
        } catch (error) {
            toast.error(error.message)
        }
      };
    
     useEffect(() => {
        getAuthState()
     }, [])


    const value = {
       backendUrl,
       isLoggedIn,
       setIsLoggedIn,
       userData,
       setUserData,
       getUserData,
       getAuthState
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;


export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
      throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
}
