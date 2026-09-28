/**
 * Creates a context object which holds the users role and shares it across 
 * the app.
 * 
 * Until a role is defined, user type is 'UserType.undefined' and the onboading sequence occurs.
 * 
 * Screens should read the derived booleans (isPatient, isSupport, etc.) as it allows them
 * to import only this file, and keeps logic in one place.
 * 
 * Not implemented:
 *  - Storage of context when app is closed- to be done with async storage (installed)
 * 
 */
import { UserType } from "../constants/userType";
import { createContext, useContext, useState, useMemo } from "react";


/**
 * Defines the structure returned when useUser() is called. 
 */
interface UserContextType{
    userType: UserType;
    setUserType: (type: UserType) => void;
    logout: () => void; // resets to undefined, sending user to onboarding.
    isPatient: boolean; // true for 'patients' and 'both'
    isSupport: boolean; // true for 'support' and 'both'
    isAdmin: boolean;
    isUndefined: boolean; // true until a role is chosen
}

/**
 * Creates the context object and prevents use outside of the provider.
 * 
 * Type begins as (javascript) undefined to ensure that the value is within the provider
 * either being (javascript) undefined or within UserContextType.
 */
const UserContext = createContext<UserContextType | undefined>(undefined);
    
/**
 * Holds the users role and shares it with every nested component (children).
 * Wraps the app in _layout.tsx so the whole app can access the context
 * 
 * @param children, which are the parts of the app that will be able to call useUser()
 * @returns the provider element wrapping the children
 */
export const UserProvider = ({children} : {children:React.ReactNode}) => {
    const [userType, setUserType] =useState<UserType>(UserType.undefined);

    // useMemo rebuilds value when user type changes, to avoid unnecesary re-renders
    const value = useMemo<UserContextType>(
        () => ({
            userType,
            setUserType,
            logout: () => setUserType(UserType.undefined),
            isPatient: userType === UserType.patient || userType === UserType.both,
            isSupport: userType === UserType.supportPerson || userType === UserType.both,
            isAdmin: userType === UserType.admin,
            isUndefined: userType === UserType.undefined,
        }),
        [userType]
    );
 
    return (
        // UserContext.Provider> provides values to the nested children
        <UserContext.Provider value ={value}>
            {children}
        </UserContext.Provider>
    )
}

/**
 * Exports a hook to read the users role and role flags.
 * @throws if called outside of <UserProvider>.
 * @returns the context value object built with useMemo.
 */
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context){
        throw new Error ("error useUser")
    }
    return context;
}

