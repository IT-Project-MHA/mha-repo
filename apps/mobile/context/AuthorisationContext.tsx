/**
 * Creates a context object which holds the users role and shares it across 
 * the app.
 * 
 * Until a role is defined, user type is 'UserType.undefined' and the onboading sequence occurs.
 * 
 * Screens should read the derived booleans (isPatient, isSupport, etc.) as it allows them
 * to import only this file, and keeps logic in one place.
 * 
 */
import { UserType } from "../constants/userType";
import { createContext, useContext, useState, useMemo, useCallback, useEffect } from "react";
import { apiMyRole } from "@/api/settings_api_helpers";


/**
 * Defines the structure returned when useUser() is called. 
 */
interface UserContextType{
    userType: UserType;
    setUserType: (type: UserType) => void;
    refreshUserType: () => Promise<void>; // re-reads the role from the server
    isLoading: boolean; // true until the first server check finishes
    logout: () => void;
    isPatient: boolean;
    isSupport: boolean;
    isAdmin: boolean;
    isUndefined: boolean;
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
    const [isLoading, setIsLoading] = useState(true);

    const refreshUserType = useCallback(async () => {
        try {
            const { hasProfile, isSupporter, onboarded } = await apiMyRole();
            if (hasProfile && isSupporter) setUserType(UserType.both);
            else if (hasProfile) setUserType(UserType.patient);
            else if (isSupporter || onboarded) setUserType(UserType.supportPerson);
            else if (onboarded) setUserType(UserType.noRole); // bare account, can accept invites
            else setUserType(UserType.undefined); // new user, onboarding
        } catch {
            // offline or server error: keep the current role rather than kicking the user out
        } finally {
            setIsLoading(false);
        }
    }, []);

    // checks user type on app start
    useEffect(() => { refreshUserType(); }, [refreshUserType]);

    // useMemo rebuilds value when user type changes, to avoid unnecesary re-renders
    const value = useMemo<UserContextType>(
        () => ({
            userType,
            setUserType,
            refreshUserType,
            isLoading,
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

