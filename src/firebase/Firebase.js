
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
  apiKey: process.env.REACT_APP_APIKEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  projectId: process.env.REACT_APP_PROJECTID,
  storageBucket: process.env.REACT_APP_STORAGEBUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
  appId: process.env.REACT_APP_APPID
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
const db = getFirestore(app);


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