import { useState } from "react";
import { Admin } from "../model/adminModel";
import { jwtDecode } from 'jwt-decode';


export const useLocalStorage = () => {
    const keyName = 'token';
    const defaultValue = null;
    const [storedValue, setStoredValue] = useState<Admin | null>(() => {
        try {
            const value = localStorage.getItem(keyName);
            if (value) {

                const user = jwtDecode(value);
                return user as Admin;
            } else {
                //localStorage.setItem(keyName, JSON.stringify(defaultValue));
                return null;
            }
        } catch (err) {
            return defaultValue;
        }
    });

    const setValue = (newValue: string | null) => {
        try {
            if (newValue) {
                localStorage.setItem("token", newValue);
                const user = jwtDecode(newValue);
                console.log("user", user)
                setStoredValue(user as Admin);
            } else {
                localStorage.removeItem("token")
            }

        } catch (err) { }
    };
    return { storedValue, setValue };
}