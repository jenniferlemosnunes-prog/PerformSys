import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    // Adicionamos a referência para a tela de carregamento
    const loadingScreen = document.getElementById('loading-screen'); 

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            // Mostra a tela de carregamento
            loadingScreen.style.display = 'flex'; 

            const userType = document.getElementById('user-type').value;
            const codEmpresa = document.getElementById('cod-empresa').value.trim();
            const userEmail = document.getElementById('user-email').value.trim();
            const userPassword = document.getElementById('user-password').value.trim();

            let collectionName = '';

            if (userType === 'Gerente') {
                collectionName = 'gerentes';
            } else if (userType === 'Funcionario') {
                collectionName = 'funcionarios';
            } else {
                alert("Tipo de usuário inválido.");
                // Esconde a tela de carregamento em caso de erro
                loadingScreen.style.display = 'none';
                return;
            }
            
            try {
                const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
                const user = userCredential.user;

                const q = query(collection(db, collectionName), where("email", "==", user.email));
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    alert("Dados do usuário não encontrados no banco de dados. Contate o suporte.");
                    // Esconde a tela de carregamento em caso de erro
                    loadingScreen.style.display = 'none';
                    return;
                }

                const userData = querySnapshot.docs[0].data();

                if (userType === 'Gerente' && userData.codEmpresa !== codEmpresa) {
                    alert("O código da empresa não corresponde ao gerente.");
                    auth.signOut();
                    // Esconde a tela de carregamento em caso de erro
                    loadingScreen.style.display = 'none';
                    return; 
                }
                
                sessionStorage.setItem('userType', userType);
                sessionStorage.setItem('userId', querySnapshot.docs[0].id);
                
                // Esconde a tela de carregamento antes de redirecionar
                loadingScreen.style.display = 'none';
                
                if (userType === 'Gerente') {
                    window.location.href = 'dashboard_superior.html';
                } else {
                    window.location.href = 'dashboard.html';
                }

            } catch (error) {
                let errorMessage = "Erro ao fazer login. Verifique as credenciais.";
                console.error("Erro do Firebase:", error.code, error.message);

                if (error.code === 'auth/invalid-email') {
                    errorMessage = 'O e-mail fornecido é inválido.';
                } else if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                    errorMessage = 'E-mail ou senha incorretos.';
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Senha incorreta.';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
                }

                alert(errorMessage);
                // Esconde a tela de carregamento em caso de erro
                loadingScreen.style.display = 'none';
            }
        });
    }
});