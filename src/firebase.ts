import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAyOLG0qX0CYRlHpvZWy4vRfL-LQwU9dTM",
  authDomain: "controle-rotas-607ea.firebaseapp.com",
  projectId: "controle-rotas-607ea",
  storageBucket: "controle-rotas-607ea.firebasestorage.app",
  messagingSenderId: "168922950375",
  appId: "1:168922950375:web:a04b2d096b0ab5bba31042"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)