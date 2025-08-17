import { getFirestore, doc, getDoc, collection, addDoc, onSnapshot, query, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
            const sanitizedFileName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, '');
            pdfPath = `contratos_pdf/${sanitizedFileName}`;
            
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

// --- CÓDIGO PARA EXIBIR A LISTA DE CONTRATOS ---
const contratosListDiv = document.getElementById('contratos-list');

if (contratosListDiv) {
    const q = query(collection(db, "contratos"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        contratosListDiv.innerHTML = ''; // Limpa a lista antes de recriá-la
        querySnapshot.forEach((doc) => {
            const contract = doc.data();

            // Pega o caminho do contrato salvo no Firestore
            const pdfPath = contract.caminhoContrato;

            // Cria o link completo para o arquivo no GitHub Pages
            const githubPagesUrl = `https://jenniferlemosnunes-prog.github.io/PerformSys/${pdfPath}`;
            
            // Cria o HTML para exibir as informações e o botão de exclusão
            const contratoItem = document.createElement('div');
            contratoItem.innerHTML = `
                <p><strong>Nome do Funcionário:</strong> ${contract.nomeFuncionario}</p>
                <p><strong>Tipo de Contrato:</strong> ${contract.tipoContrato}</p>
                <p><strong>Data de Início:</strong> ${contract.dataInicio}</p>
                ${pdfPath ? `<p><strong>Contrato:</strong> <a href="${githubPagesUrl}" target="_blank">Ver Contrato</a></p>` : ''}
                <button class="delete-contract-button" data-id="${doc.id}">Excluir Contrato</button>
                <hr>
            `;
            contratoItem.classList.add('contrato-item');
            contratosListDiv.appendChild(contratoItem);

            // Adiciona o evento de clique para o botão de exclusão
            const deleteButton = contratoItem.querySelector('.delete-contract-button');
            if (deleteButton) {
                deleteButton.addEventListener('click', async () => {
                    const docId = deleteButton.getAttribute('data-id');
                    const confirmDelete = confirm("Tem certeza que deseja excluir este contrato?");
                    if (confirmDelete) {
                        try {
                            await deleteDoc(doc(db, "contratos", docId));
                            alert("Contrato excluído com sucesso!");
                        } catch (error) {
                            console.error("Erro ao excluir o contrato: ", error);
                            alert("Erro ao excluir o contrato. Verifique o console para mais detalhes.");
                        }
                    }
                });
            }
        });
    });
}