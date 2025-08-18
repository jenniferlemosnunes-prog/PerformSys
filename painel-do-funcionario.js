import { getFirestore, doc, getDoc, collection, query, where, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);
const auth = getAuth(app);

// Esconde o dashboard por padrão até que os dados do usuário sejam carregados
document.querySelector('.dashboard-page').style.display = 'none';

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

// Lógica para abrir/fechar a barra lateral e expandir o conteúdo
const sidebarToggle = document.querySelector('.sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    mainContent.classList.toggle('expanded');
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

        // Chama a função de carregamento de dados para a seção selecionada
        if (sectionId === 'metas') {
            loadMetas();
        } else if (sectionId === 'pendencias') {
            loadPendencias();
        } else if (sectionId === 'contratos') {
            loadContratos();
        }
        // Para a seção "Inicio", não precisa carregar dados específicos do Firestore
        // mas garante que ela está ativa
        if (sectionId === 'inicio') {
            document.getElementById('inicio').classList.add('active');
        }
    });
});

// Listener para o estado de autenticação do Firebase
onAuthStateChanged(auth, (user) => {
    const userType = sessionStorage.getItem('userType');
    const userId = sessionStorage.getItem('userId');

    if (user && userType === 'Funcionario' && userId === user.uid) {
        // Se o usuário está autenticado no Firebase E o sessionStorage corresponde
        // Carrega os dados do funcionário
        const docRef = doc(db, "funcionarios", userId);
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                document.getElementById('nomeFuncionario').textContent = data.nome;
                document.getElementById('fotoFuncionario').src = data.foto;
                document.querySelector('.dashboard-page').style.display = 'flex'; // Agora mostra o dashboard
            } else {
                console.log("Nenhum dado de usuário encontrado no Firestore para o UID:", userId);
                sessionStorage.clear();
                window.location.href = "index.html";
            }
        }).catch(error => {
            console.error("Erro ao carregar dados do usuário do Firestore: ", error);
            sessionStorage.clear();
            window.location.href = "index.html";
        });
    } else {
        // Se não houver usuário autenticado no Firebase ou tipo/ID não corresponderem
        console.log("Usuário não autenticado ou tipo/ID incorreto. Redirecionando para login.");
        sessionStorage.clear();
        window.location.href = "index.html";
    }
});


// FUNÇÃO PARA BUSCAR E EXIBIR METAS
const loadMetas = () => {
    const metasList = document.getElementById('metas-list');
    const metasQuery = query(collection(db, "metas"), where("funcionarioId", "==", auth.currentUser.uid));

    onSnapshot(metasQuery, (querySnapshot) => {
        metasList.innerHTML = '';
        if (querySnapshot.empty) {
            metasList.innerHTML = '<p>Nenhuma meta atribuída a você.</p>';
        } else {
            querySnapshot.forEach((doc) => {
                const meta = doc.data();
                const metaId = doc.id;
                const statusText = meta.status === "concluida" ? "Concluída" : "Pendente";
                
                const metaElement = document.createElement('div');
                metaElement.classList.add('meta-item');
                metaElement.innerHTML = `
                    <p><strong>Descrição:</strong> ${meta.descricao}</p>
                    <p><strong>Status:</strong> <span class="status-${meta.status}">${statusText}</span></p>
                    ${meta.status === "pendente" ? `<button class="complete-meta-button" data-id="${metaId}">Marcar como Concluída</button>` : ''}
                `;
                metasList.appendChild(metaElement);
            });
            document.querySelectorAll('.complete-meta-button').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const metaId = e.target.getAttribute('data-id');
                    const metaRef = doc(db, "metas", metaId);
                    try {
                        await updateDoc(metaRef, { status: "concluida" });
                        alert("Meta marcada como concluída!");
                    } catch (error) {
                        console.error("Erro ao atualizar o status da meta: ", error);
                        alert("Erro ao marcar a meta como concluída.");
                    }
                });
            });
        }
    });
};

// FUNÇÃO PARA BUSCAR E EXIBIR PENDÊNCIAS
const loadPendencias = () => {
    const pendenciasList = document.getElementById('pendencias-list');
    const pendenciasQuery = query(collection(db, "pendencias"), where("funcionarioId", "==", auth.currentUser.uid));

    onSnapshot(pendenciasQuery, (querySnapshot) => {
        pendenciasList.innerHTML = '';
        if (querySnapshot.empty) {
            pendenciasList.innerHTML = '<p>Nenhuma pendência para você.</p>';
        } else {
            querySnapshot.forEach((doc) => {
                const pendencia = doc.data();
                const pendenciaId = doc.id;
                const statusText = pendencia.status === "concluida" ? "Concluída" : "Pendente";
                
                const pendenciaElement = document.createElement('div');
                pendenciaElement.classList.add('pendencia-item');
                pendenciaElement.innerHTML = `
                    <p><strong>Descrição:</strong> ${pendencia.descricao}</p>
                    <p><strong>Status:</strong> <span class="status-${pendencia.status}">${statusText}</span></p>
                    ${pendencia.status === "pendente" ? `<button class="complete-pendencia-button" data-id="${pendenciaId}">Marcar como Concluída</button>` : ''}
                `;
                pendenciasList.appendChild(pendenciaElement);
            });
            document.querySelectorAll('.complete-pendencia-button').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const pendenciaId = e.target.getAttribute('data-id');
                    const pendenciaRef = doc(db, "pendencias", pendenciaId);
                    try {
                        await updateDoc(pendenciaRef, { status: "concluida" });
                        alert("Pendência marcada como concluída!");
                    } catch (error) {
                        console.error("Erro ao atualizar o status da pendência: ", error);
                        alert("Erro ao marcar a pendência como concluída.");
                    }
                });
            });
        }
    });
};

// FUNÇÃO PARA BUSCAR E EXIBIR CONTRATOS
const loadContratos = () => {
    const meusContratosList = document.getElementById('meus-contratos-list');
    const contratosQuery = query(collection(db, "contratos"), where("funcionarioId", "==", auth.currentUser.uid));

    onSnapshot(contratosQuery, (querySnapshot) => {
        meusContratosList.innerHTML = '';
        if (querySnapshot.empty) {
            meusContratosList.innerHTML = '<p>Nenhum contrato encontrado para você.</p>';
            return;
        }
        querySnapshot.forEach((doc) => {
            const contrato = doc.data();
            const contratoElement = document.createElement('div');
            contratoElement.classList.add('contrato-item');
            contratoElement.innerHTML = `
                <p><strong>Nome do Funcionário:</strong> ${contrato.nomeFuncionario}</p>
                <p><strong>Tipo de Contrato:</strong> ${contrato.tipoContrato}</p>
                <p><strong>Data de Início:</strong> ${contrato.dataInicio}</p>
                <p><strong>Contrato:</strong> <a href="${contrato.url}" target="_blank">Ver Contrato</a></p>
            `;
            meusContratosList.appendChild(contratoElement);
        });
    });
};