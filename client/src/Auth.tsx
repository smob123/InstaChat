/**
 * @author Sultan
 * 
 * shows a loading indicator until it can verify whether  the user is logged in or not
 */

import React, { useState, useEffect, createContext } from 'react';
import { IonSpinner } from '@ionic/react';
import * as app from 'firebase/app';
import 'firebase/auth';

export const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC = ({ children }) => {
    const [currentUser, setUser] = useState<app.User | null>(null);
    const [isLoading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // observe the user's auth state
        app.auth().onAuthStateChanged(user => {
            setUser(user);
            setLoading(false);
        });
    }, []);

    // display a loading indicator until firebase returns the current auth state
    if (isLoading) {
        return (
            <div className='full-screen flex-align-items-center flex-justify-content-center'>
                <IonSpinner name='dots' />
            </div>);
    }

    // display the component's children once the auth state is retrieved
    return (
        <AuthContext.Provider value={{ currentUser }}>
            {children}
        </AuthContext.Provider>
    )
}