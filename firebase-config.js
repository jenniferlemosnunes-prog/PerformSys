import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyDHu2rMh5KxpvGxw6bg-K4X1Py5GvpipNg",
    authDomain: "performsys-novo.firebaseapp.com",
    projectId: "performsys-novo",
    storageBucket: "performsys-novo.firebasestorage.app",
    messagingSenderId: "1009354682850",
    appId: "1:1009354682850:web:55dd44c97e74ab588909bb",
    measurementId: "G-YBWVCQ0ZW0"
};

// Inicializa o Firebase App e o exporta para que outros arquivos possam usá-lo
export const app = initializeApp(firebaseConfig);