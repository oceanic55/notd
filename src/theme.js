// Theme functionality - light theme only
(function() {
    const html = document.documentElement;
    
    // Always use light theme
    html.setAttribute('data-theme', 'light');
    
    // Clear any saved dark theme preference
    localStorage.removeItem('theme');
})();
