// Theme switcher functionality
(function() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('img');
    const html = document.documentElement;
    
    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    updateToggleIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateToggleIcon(newTheme);
    });
    
    function updateToggleIcon(theme) {
        // In dark mode, show light icon (to switch to light)
        // In light mode, show dark icon (to switch to dark)
        themeIcon.src = theme === 'dark' ? 'svg/light.svg' : 'svg/dark.svg';
    }
})();
