import { use, useState } from 'react';
import { auth, userExist } from '../firebase/Firebase';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth';



export default function AuthProvider({ children, onUserLoggedIn, onUserNotLoggedIn, onUserNotRegistered }) {
        const navigate = useNavigate(); 
        const [currentUser, setCurrentUser] = useState(null);
        const [state, setCurrentState] = useState(0);
    
    useEffect(() => {
        setCurrentState(1);
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const isRegistered = await userExist(user.uid);
                if (isRegistered) {
                    onUserLoggedIn(user);
                }
                else {
                    onUserNotRegistered(user);
                }
            }
            else {
                onUserNotLoggedIn();
                console.log('No user is signed in');
            }
        }
        );
    }, [navigate,onUserLoggedIn, onUserNotLoggedIn, onUserNotRegistered ]);
    return <div>{children}</div>
}
