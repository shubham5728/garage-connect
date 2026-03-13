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
        } else {
            // Handle Logout
            item.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    window.gcApi.logout();
                }
            });
        }
    });
});