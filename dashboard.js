document.addEventListener('DOMContentLoaded', () => {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const dashboardPage = document.querySelector('.dashboard-page');
    const menuItems = document.querySelectorAll('.main-menu li');

    // Funcionalidade para abrir/fechar a barra lateral
    if (sidebarToggle && sidebar && dashboardPage) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            dashboardPage.classList.toggle('sidebar-open');
        });
    }

    // Funcionalidade para alternar entre as seções
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove a classe 'active' de todos os itens do menu
            menuItems.forEach(i => i.classList.remove('active'));
            // Adiciona a classe 'active' ao item clicado
            item.classList.add('active');

            // Pega o ID da seção do atributo 'data-section'
            const sectionId = item.getAttribute('data-section');
            const sections = document.querySelectorAll('.content-section');

            // Esconde todas as seções
            sections.forEach(section => {
                section.classList.remove('active');
            });

            // Mostra a seção correspondente
            const activeSection = document.getElementById(sectionId);
            if (activeSection) {
                activeSection.classList.add('active');
            }
        });
    });

});