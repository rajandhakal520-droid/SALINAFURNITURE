import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCyHrAVemPqaPChh4VHau4g0_6zcLva-qI",
  authDomain: "app-devlopment-5f090.firebaseapp.com",
  projectId: "app-devlopment-5f090",
  storageBucket: "app-devlopment-5f090.firebasestorage.app",
  messagingSenderId: "8503691865",
  appId: "1:8503691865:web:94dc98aaca0099fe147f48",
  measurementId: "G-3E8CRWYPL9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 🔒 Ek choti login garepaxi logout nagaruñjel login session save garirakhne
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error: ", error);
});

export const googleProvider = new GoogleAuthProvider();