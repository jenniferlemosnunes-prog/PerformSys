import { getFirestore, doc, getDoc, collection, addDoc, onSnapshot, query } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);
const auth = getAuth(app);

const userType = sessionStorage.getItem('userType');
const userId = sessionStorage.getItem('userId');

if (!userType || !userId) {
    window.location.href = "index.html";
} else {
    const collectionName = userType === 'Gerente' ? "gerentes" : "funcionarios";
    const docRef = doc(db, collectionName, userId);
    
    getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Atualiza as informações do usuário na barra lateral
            document.getElementById('nomeFuncionario').textContent = data.nome;
            document.getElementById('fotoFuncionario').src = data.foto || 'caminho/para/uma/imagem/padrao.png'; 
            
            // Atualiza as informações pessoais na seção 'Início'
            document.getElementById('nomeFuncionarioPrincipal').textContent = data.nome || 'N/A';
            document.getElementById('cpfFuncionario').textContent = data.cpf || 'N/A';
            document.getElementById('nrFuncionario').textContent = data.nr || 'N/A';
            document.getElementById('diFuncionario').textContent = data.di || 'N/A';
            document.getElementById('fotoFuncionarioLarge').src = data.foto || 'caminho/para/uma/imagem/padrao.png';

            document.querySelector('.dashboard-page').style.display = 'flex';
        } else {
            console.log("Nenhum dado de usuário encontrado!");
            sessionStorage.clear();
            window.location.href = "index.html";
        }
    }).catch(error => {
        console.error("Erro ao carregar dados do usuário: ", error);
        sessionStorage.clear();
        window.location.href = "index.html";
    });
}

// Lógica para abrir/fechar a barra lateral
const sidebarToggle = document.querySelector('.sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');

if (sidebarToggle && sidebar && mainContent) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        mainContent.classList.toggle('expanded');
    });
}

// Lógica de Logout
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
            sessionStorage.clear();
            window.location.href = "index.html";
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
            alert("Erro ao sair. Tente novamente.");
        }
    });
}

// Lógica para exibir seções do menu
const navLinks = document.querySelectorAll('.main-menu li');
const contentSections = document.querySelectorAll('.content-section');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const sectionId = link.getAttribute('data-section');
        contentSections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        link.classList.add('active');
    });
});