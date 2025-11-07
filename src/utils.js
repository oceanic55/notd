/**
 * Shared utility functions for NOTD*
 * Consolidates common functionality used across multiple modules
 * @version 4.7.0
 */

const Utils = {
    /**
     * Auto-expand textarea to fit content
     * @param {HTMLTextAreaElement} textarea - The textarea element to expand
     * @param {number} defaultMinHeight - Default minimum height if not set in CSS (optional)
     */
    autoExpandTextarea(textarea, defaultMinHeight = 60) {
        if (!textarea) return;
        
        // Get the computed style first
        const computedStyle = window.getComputedStyle(textarea);
        const minHeight = parseInt(computedStyle.minHeight) || defaultMinHeight;
        const maxHeight = parseInt(computedStyle.maxHeight);
        
        // Temporarily set to min height to get accurate scrollHeight
        textarea.style.height = minHeight + 'px';
        textarea.style.overflowY = 'hidden';
        
        // Calculate the content height
        const scrollHeight = textarea.scrollHeight;
        const newHeight = Math.max(scrollHeight, minHeight);
        
        if (maxHeight && newHeight >= maxHeight) {
            // At max height, enable scrolling
            textarea.style.height = maxHeight + 'px';
            textarea.style.overflowY = 'auto';
        } else {
            // Below max height, expand without scrolling
            textarea.style.height = newHeight + 'px';
            textarea.style.overflowY = 'hidden';
        }
    },

    /**
     * Validate and sanitize text input
     * @param {string} input - The input string to validate
     * @param {Object} options - Validation options
     * @returns {Object} - {isValid: boolean, sanitized: string, error: string}
     */
    validateInput(input, options = {}) {
        const {
            required = false,
            minLength = 0,
            maxLength = Infinity,
            allowEmpty = !required
        } = options;

        const sanitized = input ? input.trim() : '';

        // Check if empty when required
        if (required && !sanitized) {
            return {
                isValid: false,
                sanitized: '',
                error: 'This field is required'
            };
        }

        // Allow empty if not required
        if (!sanitized && allowEmpty) {
            return {
                isValid: true,
                sanitized: '',
                error: null
            };
        }

        // Check length constraints
        if (sanitized.length < minLength) {
            return {
                isValid: false,
                sanitized,
                error: `Minimum length is ${minLength} characters`
            };
        }

        if (sanitized.length > maxLength) {
            return {
                isValid: false,
                sanitized,
                error: `Maximum length is ${maxLength} characters`
            };
        }

        return {
            isValid: true,
            sanitized,
            error: null
        };
    },

    /**
     * Validate API key format
     * @param {string} apiKey - The API key to validate
     * @returns {Object} - {isValid: boolean, error: string}
     */
    validateAPIKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            return {
                isValid: false,
                error: 'API key is required'
            };
        }

        const trimmed = apiKey.trim();

        if (trimmed.length < 10) {
            return {
                isValid: false,
                error: 'API key appears to be too short'
            };
        }

        // Basic format check (alphanumeric and common special chars)
        if (!/^[a-zA-Z0-9_\-\.]+$/.test(trimmed)) {
            return {
                isValid: false,
                error: 'API key contains invalid characters'
            };
        }

        return {
            isValid: true,
            error: null
        };
    }
};

// Export for use in other modules
window.Utils = Utils;
if (window.NOTD_MODULES) window.NOTD_MODULES.Utils = Utils;
