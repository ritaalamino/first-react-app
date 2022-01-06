import firebase from "firebase";
import { createContext, ReactNode, useEffect, useState } from "react";
import { auth } from "../services/firebase";

type AuthContextType = {
    user: User | undefined;
    signInWithGoogle: () => Promise<void>;
}

type User = {
    id: string;
    displayName: string;
    avatarUrl: string;
}

export const AuthContext = createContext({} as AuthContextType);

type AuthContextProvider = {
    children: ReactNode;
}

export function AuthContextProvider(props: AuthContextProvider) {

    const [user, setUser] = useState<User>();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async user => {
            if (user) {
                const { displayName, photoURL, uid } = user;

                if (!displayName || !photoURL) {
                    throw new Error('Missing information from Google');
                }
                setUser({
                    id: uid,
                    displayName: displayName,
                    avatarUrl: photoURL
                });
            }
        })

        return () => {
            unsubscribe();
        }
    }, []);

    async function signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();

        const result = await auth.signInWithPopup(provider);

        if (result.user) {
            const { displayName, photoURL, uid } = result.user;

            if (!displayName || !photoURL) {
                throw new Error('Missing information from Google');
            }
            setUser({
                id: uid,
                displayName: displayName,
                avatarUrl: photoURL
            });
        }
    }
    return (
        <AuthContext.Provider value={{ user, signInWithGoogle }}>
            {props.children}
        </AuthContext.Provider>
    );
}