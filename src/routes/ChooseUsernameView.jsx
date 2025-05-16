import AuthProvider from "../components/authProvider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { existUserName } from "../firebase/Firebase";

export default function ChooseUsernameView() {
    const navigate = useNavigate();
    const [state, setCurrentState] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [username, setUsername] = useState('');
    function handleUserLoggedIn(user) {
        navigate('/dashboard');
    }
    function handleUserNotLoggedIn(user) {
        navigate('/login');

    }
    function handleUserNotRegistered(user) {
        setCurrentUser(user);
        setCurrentState(3);
    }
    function handleUserName(event) {
        setUsername(event.target.value);
        console.log(event.target.value);
        console.log(currentUser);

    }

    // function handleContinue() {
    //     if (username !== ''){
    //         const exist = await existUserName(username);
    //         if (exist){
    //             setCurrentState(5);
    //         }else{
    //             const tmp = {...currentUser}
    //             tmp.processCompleted = true;
    //         }

    //     }
    // }
    function handleContinue(){}

    if (state === 3) {
        return (
            <div>
                <h1>Bienvenido {currentUser.displayName}</h1>
                <h2>Elige un nombre de usuario</h2>
                <div>
                    <input type="text" onChange={handleUserName} />
                </div>
                <div>
                    <button onClick={handleContinue}>Continuar</button>
                </div>
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

