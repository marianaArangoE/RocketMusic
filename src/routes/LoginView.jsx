import { use, useState } from 'react';
import { auth, userExist } from '../firebase/Firebase';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import AuthProvider from '../components/authProvider';



export default function LogingView() {
    const navigate = useNavigate();
    //const [currentUser, setCurrentUser] = useState(null);
    const [state, setCurrentState] = useState(0);

    async function handleOnclick() {
        const googleProvider = new GoogleAuthProvider();
        await signqWithGoogle(googleProvider);


        async function signqWithGoogle(googleAuthProvider) {
            try {
                const result = await signInWithPopup(auth, googleAuthProvider);
                console.log(result);
                const user = result.user;
                console.log(user);
            } catch (error) {
                console.error(error);

            }
        }

    }

    function handleUserLoggedIn(user) {
        navigate('/dashboard');
    }
    function handleUserNotLoggedIn(user) {
        navigate('/login');
        setCurrentState(4);
    }
    function handleUserNotRegistered(user) {
        navigate('/choose-username');
    }

    if (state === 1) {
        return <div>Loading...</div>;
    }
    if (state === 2) {
        return <div>Login Complete</div>;
    }
    if (state === 3) {
        return <div>Login without registry</div>;
    }
    if (state === 4) {
        return (
            <div >
                <button onClick={handleOnclick}>Login with google</button>
            </div>
        );
    }

    return (
        <AuthProvider
            onUserLoggedIn={handleUserLoggedIn}
            onUserNotLoggedIn={handleUserNotLoggedIn}
            onUserNotRegistered={handleUserNotRegistered}>
            <div>Loading...</div>
        </AuthProvider>
    );
}


