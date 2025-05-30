import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
    getFirestore,
    collection,
    addDoc,
    getDocs,    
    query,
    where,
    doc,
    getDoc,
    updateDoc,
    setDoc,
    deleteDoc,
 } from "firebase/firestore";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_APIKEY,
  authDomain: import.meta.env.VITE_APP_AUTHDOMAIN,
  projectId: import.meta.env.VITE_APP_PROJECTID,
  storageBucket: import.meta.env.VITE_APP_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_APP_MESSAGINGSENDERID,
  appId: import.meta.env.REACT_APP_APPID
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


export async function userExist(uid) {
    const userRef = doc(db, "users", uid);
    const res = await getDoc(userRef);
    console.log(res);
    return res.exists();
}

export async function existUserName(username) {
    const users = [];
    const docsRef = collection(db, "users");
    const q = query(docsRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        users.push(doc.data());
    });
    return users.length > 0? users.uid : null;
}