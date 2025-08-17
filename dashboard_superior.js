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
            document.getElementById('nomeGerente').textContent = data.nome;
            document.getElementById('fotoGerente').src = data.foto || 'caminho/para/uma/imagem/padrao.png'; 
            
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

// Lógica de Logout aprimorada
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

const addContractButton = document.getElementById('add-contract-button');
const modal = document.getElementById('add-contract-modal');
const closeButton = document.querySelector('.close-button');
const form = document.getElementById('add-contract-form');

if (addContractButton) {
    addContractButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });
}

if (closeButton) {
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

if (form) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const employeeName = document.getElementById('employee-name').value;
        const contractType = document.getElementById('contract-type').value;
        const startDate = document.getElementById('start-date').value;
        const contractPdfInput = document.getElementById('contract-pdf');
        const pdfFile = contractPdfInput.files[0];

        let pdfPath = null;

        if (pdfFile) {
            // Gera um nome para o arquivo e o caminho no seu repositório
            const sanitizedFileName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '');
            pdfPath = `contratos_pdf/${sanitizedFileName}`;
            
            // Avisa o usuário que ele precisa fazer a parte manual
            alert(`Contrato salvo com o nome: "${sanitizedFileName}".\n\nPor favor, salve o arquivo no seu computador e adicione-o na pasta "contratos_pdf" do seu projeto e depois suba para o GitHub.`);
        }

        const contractsCollection = collection(db, "contratos");

        try {
            await addDoc(contractsCollection, {
                nomeFuncionario: employeeName,
                tipoContrato: contractType,
                dataInicio: startDate,
                caminhoContrato: pdfPath
            });

            alert("Contrato adicionado com sucesso!");
            form.reset();
            modal.style.display = 'none';
        } catch (error) {
            console.error("Erro ao adicionar contrato: ", error);
            alert("Erro ao adicionar contrato. Verifique o console para mais detalhes.");
        }
    });
}