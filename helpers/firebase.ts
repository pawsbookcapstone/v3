import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  //   apiKey: "AIzaSyClDXWMCEVWQuamBLVKnQdXG1n4PlpiJFs",
  //   authDomain: "service-link-d7b4e.firebaseapp.com",
  //   projectId: "service-link-d7b4e",
  //   storageBucket: "service-link-d7b4e.firebasestorage.app",
  //   messagingSenderId: "849305888050",
  //   appId: "1:849305888050:web:f9e38748c2c47e22aaa32b",
  //   databaseURL: "https://service-link-d7b4e-default-rtdb.firebaseio.com", // Add this if you have Realtime Database

  // apiKey: "AIzaSyANDkgsi4Et3C0XnED9DUaNzEoMC2_ncgU",
  // authDomain: "pawsbook-c2547.firebaseapp.com",
  // projectId: "pawsbook-c2547",
  // storageBucket: "pawsbook-c2547.firebasestorage.app",
  // messagingSenderId: "603172832396",
  // appId: "1:603172832396:web:e9307248112a3fcac827a9",
  // databaseURL: "https://pawsbook-c2547-default-rtdb.firebaseio.com", 


//Adrian's DB
  // apiKey: "AIzaSyAJveK2TG1IyflZcU6RSGAALytu4F2sNLc",
  // authDomain: "pawsbook-381c5.firebaseapp.com",
  // projectId: "pawsbook-381c5",
  // storageBucket: "pawsbook-381c5.firebasestorage.app",
  // messagingSenderId: "1096411527587",
  // appId: "1:1096411527587:web:10f0db8d23378b79bec216",
  // measurementId: "G-M560MX0D98"


  //official db
   apiKey: "AIzaSyAVJYhymEz8HjG9NCMH1--Q3cK4kDyT4Pc",
  authDomain: "pawsbook-56ab9.firebaseapp.com",
  projectId: "pawsbook-56ab9",
  storageBucket: "pawsbook-56ab9.firebasestorage.app",
  messagingSenderId: "409035285876",
  appId: "1:409035285876:web:447c08cc880a83c2a2f821",
  measurementId: "G-0116N56Q6Q",
  databaseURL: "https://pawsbook-56ab9-default-rtdb.firebaseio.com", 
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db: Firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

