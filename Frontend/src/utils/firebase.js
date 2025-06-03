// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDwBgNsJu8Dux3egue0KaCu_1Hu0pZnwQc",
  authDomain: "sskvehicles.firebaseapp.com",
  projectId: "sskvehicles",
  storageBucket: "sskvehicles.firebasestorage.app",
  messagingSenderId: "463570233768",
  appId: "1:463570233768:web:11ecd1c4530ef5c5cb159d",
  measurementId: "G-GDQ4FRGJ5V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Firebase authentication functions
export const loginWithFirebase = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { 
      success: true, 
      user: userCredential.user 
    };
  } catch (error) {
    console.error("Firebase login error:", error);
    let errorMessage = "Authentication failed";
    
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = "Invalid email or password";
        break;
      case 'auth/too-many-requests':
        errorMessage = "Too many failed login attempts. Please try again later";
        break;
      case 'auth/user-disabled':
        errorMessage = "This account has been disabled";
        break;
      default:
        errorMessage = error.message || "Authentication failed";
    }
    
    throw errorMessage;
  }
};

export const signupWithFirebase = async (email, password, fullName) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(userCredential.user, {
      displayName: fullName
    });
    
    return { 
      success: true, 
      user: userCredential.user 
    };
  } catch (error) {
    console.error("Firebase signup error:", error);
    let errorMessage = "Registration failed";
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = "Email is already in use";
        break;
      case 'auth/invalid-email':
        errorMessage = "Invalid email address";
        break;
      case 'auth/weak-password':
        errorMessage = "Password is too weak";
        break;
      default:
        errorMessage = error.message || "Registration failed";
    }
    
    throw errorMessage;
  }
};

export const logoutFromFirebase = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Firebase logout error:", error);
    throw error.message || "Logout failed";
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export default auth;
