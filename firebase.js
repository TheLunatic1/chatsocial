import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBGiqsgErZ9SGEXeazQsCg4-ECp5ErTwp8",
  authDomain: "chatsocial-43130.firebaseapp.com",
  projectId: "chatsocial-43130",
  storageBucket: "chatsocial-43130.firebasestorage.app",
  messagingSenderId: "841371996135",
  appId: "1:841371996135:web:24512dcb1e400ef91bf742",
  measurementId: "G-4355R0JKWX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };