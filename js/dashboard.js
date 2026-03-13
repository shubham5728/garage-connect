document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.sidebar .nav li');
    const contentSections = document.querySelectorAll('.main-content .content-section');

    navItems.forEach(item => {
        // Exclude logout from tab switching
        if (!item.classList.contains('logout')) {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                // Remove active class from all nav items and sections
                navItems.forEach(nav => nav.classList.remove('active'));
                contentSections.forEach(section => section.classList.remove('active'));

                // Add active class to the clicked item and corresponding section
                item.classList.add('active');
                const targetId = item.getAttribute('data-target');
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        }
    });

    // Handle Logout separately — bind on both the <li> and the <a> inside it
    const logoutItem = document.querySelector('.sidebar .nav li.logout');
    if (logoutItem) {
        const logoutLink = logoutItem.querySelector('a');

        const doLogout = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Are you sure you want to logout?')) {
                window.gcApi.logout();
            }
        };

        logoutItem.addEventListener('click', doLogout);
        if (logoutLink) {
            logoutLink.addEventListener('click', doLogout);
        }
    }
});