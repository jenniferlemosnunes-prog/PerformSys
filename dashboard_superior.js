import { getFirestore, doc, getDoc, collection, addDoc, onSnapshot, query, where, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);
const auth = getAuth(app);

const userType = sessionStorage.getItem('userType');
const userId = sessionStorage.getItem('userId');

if (!userType || !userId) {
    window.location.href = "index.html";
} else {
    const docRef = doc(db, userType === 'Gerente' ? "gerentes" : "funcionarios", userId);
    getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('nomeGerente').textContent = data.nome;
            document.getElementById('fotoGerente').src = data.foto;
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
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    mainContent.classList.toggle('expanded');
});

// Lógica de Logout
const logoutButton = document.getElementById('logout-button');
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

// Lógica para Contratos
const contratosList = document.getElementById('contratos-list');
const q = query(collection(db, "contratos"));
onSnapshot(q, (querySnapshot) => {
    contratosList.innerHTML = '';
    if (querySnapshot.empty) {
        contratosList.innerHTML = '<p>Nenhum contrato cadastrado.</p>';
        return;
    }
    querySnapshot.forEach((doc) => {
        const contrato = doc.data();
        const contratoId = doc.id;
        const contratoElement = document.createElement('div');
        contratoElement.classList.add('contrato-item');
        contratoElement.innerHTML = `
            <p><strong>Nome do Funcionário:</strong> ${contrato.nomeFuncionario}</p>
            <p><strong>Tipo de Contrato:</strong> ${contrato.tipoContrato}</p>
            <p><strong>Data de Início:</strong> ${contrato.dataInicio}</p>
            <p><strong>Contrato:</strong> <a href="${contrato.url}" target="_blank">Ver Contrato</a></p>
            <button class="excluir-contrato-button" data-id="${contratoId}">Excluir Contrato</button>
        `;
        contratosList.appendChild(contratoElement);
    });
    
    // Adiciona evento de clique para os botões de exclusão
    document.querySelectorAll('.excluir-contrato-button').forEach(button => {
        button.addEventListener('click', async (e) => {
            const contratoId = e.target.getAttribute('data-id');
            if (confirm('Tem certeza que deseja excluir este contrato?')) {
                try {
                    await deleteDoc(doc(db, "contratos", contratoId));
                    alert('Contrato excluído com sucesso!');
                } catch (error) {
                    console.error("Erro ao remover o contrato: ", error);
                    alert('Erro ao excluir o contrato. Tente novamente.');
                }
            }
        });
    });
});

// Lógica para o modal de adicionar contrato
const addContractButton = document.getElementById('add-contract-button');
const addContractModal = document.getElementById('add-contract-modal');
const closeButtons = document.querySelectorAll('.modal .close-button');

addContractButton.addEventListener('click', () => {
    addContractModal.style.display = 'flex';
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        addContractModal.style.display = 'none';
        addMetaModal.style.display = 'none';
    });
});

window.addEventListener('click', (event) => {
    if (event.target === addContractModal) {
        addContractModal.style.display = 'none';
    }
    if (event.target === addMetaModal) {
        addMetaModal.style.display = 'none';
    }
});


// Lógica para o modal de adicionar META (COM PREENCHIMENTO DO DROPDOWN)
const addMetaButton = document.getElementById('add-meta-button');
const addMetaModal = document.getElementById('add-meta-modal');
const addMetaForm = document.getElementById('add-meta-form');
const employeeSelect = document.getElementById('employee-id-meta');

// Função para buscar funcionários e preencher o dropdown
const fetchEmployees = async () => {
    const employeesCollection = collection(db, "funcionarios");
    const querySnapshot = await getDocs(employeesCollection);
    
    // Limpa as opções existentes
    employeeSelect.innerHTML = '';

    querySnapshot.forEach((doc) => {
        const employee = doc.data();
        const option = document.createElement('option');
        option.value = doc.id; // O ID do documento é o UID
        option.textContent = employee.nome; // O nome do funcionário
        employeeSelect.appendChild(option);
    });
};

addMetaButton.addEventListener('click', () => {
    fetchEmployees(); // Chama a função para preencher a lista antes de abrir o modal
    addMetaModal.style.display = 'flex';
});

addMetaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const employeeId = employeeSelect.value;
    const metaDescricao = document.getElementById('meta-descricao').value;

    if (!employeeId) {
        alert("Por favor, selecione um funcionário.");
        return;
    }

    try {
        await addDoc(collection(db, "metas"), {
            funcionarioId: employeeId,
            descricao: metaDescricao,
            status: "pendente"
        });
        alert("Meta adicionada com sucesso!");
        addMetaForm.reset();
        addMetaModal.style.display = 'none';
    } catch (e) {
        console.error("Erro ao adicionar a meta: ", e);
        alert("Erro ao adicionar a meta. Verifique o console para mais detalhes.");
    }
});