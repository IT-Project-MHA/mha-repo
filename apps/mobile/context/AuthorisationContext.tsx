/**
 * this file will contain the context logic for user type, to be accessed throughout the app
 * before user type is declared the onboading sequence occurs
 * 
 * User type data will be fetched from backend, currently set up to retreive and pass on the information
 * 
 */
import { UserType, UserType as UserTypeValues } from "../constants/userType";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
//import AsyncStorage from '@react-native-async-storage/async-storage';
//import { useFilterScreenChildren } from "expo-router/build/layouts/withLayoutContext";

type UserType = typeof UserTypeValues[keyof typeof UserTypeValues];

// define auth (user) types
interface UserContextType{
    userType: UserType;
    setUserType: (type: UserType) => void;
    logout: () => void;
}

// context provider
const UserContext = createContext<UserContextType | undefined>(undefined);
    

export const UserProvider = ({children} : {children:React.ReactNode}) => {
    const [userType, setUserType] =useState<UserType>(UserTypeValues.undefined);

    const logout = () => {
        setUserType(UserType.undefined);
    }
    
    return (
        <UserContext.Provider value ={{userType, setUserType, logout}}>
            {children}
        </UserContext.Provider>
    )
}

// hook to retrieve the context
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context){
        throw new Error ("error useUser")
    }
    return context;
}

