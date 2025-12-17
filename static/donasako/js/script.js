// DonAsako Theme JS
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Mobile menu toggle
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarItems = document.getElementById('navbarItems');
    
    if (navbarToggle && navbarItems) {
        navbarToggle.addEventListener('click', function() {
            navbarToggle.classList.toggle('active');
            navbarItems.classList.toggle('active');
            document.body.style.overflow = navbarItems.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking on a link
        navbarItems.querySelectorAll('.navbar-item--link').forEach(link => {
            link.addEventListener('click', function() {
                navbarToggle.classList.remove('active');
                navbarItems.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navbarItems.classList.contains('active')) {
                navbarToggle.classList.remove('active');
                navbarItems.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

