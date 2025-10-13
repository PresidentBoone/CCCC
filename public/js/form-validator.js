/**
 * Form Validator - Week 4 Quality Enhancement
 * Provides comprehensive client-side form validation
 * with real-time feedback and accessibility support
 * 
 * Usage:
 * const validator = new FormValidator('#myForm', {
 *     fields: {
 *         email: { rules: ['required', 'email'], message: 'Valid email required' },
 *         password: { rules: ['required', 'min:8'], message: 'Min 8 characters' }
 *     }
 * });
 * 
 * if (validator.validate()) {
 *     // Form is valid
 * }
 */

class FormValidator {
    constructor(form, options = {}) {
        this.form = typeof form === 'string' ? document.querySelector(form) : form;
        this.options = {
            fields: options.fields || {},
            realTime: options.realTime !== false,
            scrollToError: options.scrollToError !== false,
            showSuccessState: options.showSuccessState !== false,
            ...options
        };
        
        this.errors = new Map();
        this.touched = new Set();
        this.isValidating = false;
        
        if (this.form) {
            this.init();
        }
    }

    /**
     * Initialize form validation
     */
    init() {
        // Add novalidate to prevent browser default validation
        this.form.setAttribute('novalidate', '');
        
        // Setup field listeners
        Object.keys(this.options.fields).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
            if (field) {
                this.setupFieldListeners(field, fieldName);
            }
        });
        
        // Setup form submit
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(e);
        });
        
        // Add validation styles
        this.injectStyles();
    }

    /**
     * Setup event listeners for a field
     */
    setupFieldListeners(field, fieldName) {
        if (this.options.realTime) {
            // Validate on blur
            field.addEventListener('blur', () => {
                this.touched.add(fieldName);
                this.validateField(fieldName);
            });
            
            // Validate on input if field was touched
            field.addEventListener('input', () => {
                if (this.touched.has(fieldName)) {
                    this.validateField(fieldName);
                }
            });
        }
        
        // Add ARIA attributes
        field.setAttribute('aria-required', 'true');
        field.setAttribute('aria-invalid', 'false');
    }

    /**
     * Validate a single field
     */
    validateField(fieldName) {
        const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
        if (!field) return true;
        
        const config = this.options.fields[fieldName];
        if (!config) return true;
        
        const value = field.value.trim();
        const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
        
        // Clear previous error
        this.clearFieldError(field, fieldName);
        
        // Check each rule
        for (const rule of rules) {
            const error = this.checkRule(value, rule, field);
            if (error) {
                this.setFieldError(field, fieldName, error, config);
                return false;
            }
        }
        
        // Field is valid
        if (this.options.showSuccessState && this.touched.has(fieldName)) {
            this.setFieldSuccess(field);
        }
        
        return true;
    }

    /**
     * Check a validation rule
     */
    checkRule(value, rule, field) {
        if (typeof rule === 'function') {
            return rule(value, field);
        }
        
        const [ruleName, ruleValue] = rule.split(':');
        
        switch (ruleName) {
            case 'required':
                if (!value) return 'This field is required';
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    return 'Please enter a valid email address';
                }
                break;
                
            case 'min':
                if (value.length < parseInt(ruleValue)) {
                    return `Minimum ${ruleValue} characters required`;
                }
                break;
                
            case 'max':
                if (value.length > parseInt(ruleValue)) {
                    return `Maximum ${ruleValue} characters allowed`;
                }
                break;
                
            case 'minLength':
                if (value.length < parseInt(ruleValue)) {
                    return `Must be at least ${ruleValue} characters`;
                }
                break;
                
            case 'maxLength':
                if (value.length > parseInt(ruleValue)) {
                    return `Must be no more than ${ruleValue} characters`;
                }
                break;
                
            case 'pattern':
                const regex = new RegExp(ruleValue);
                if (value && !regex.test(value)) {
                    return 'Invalid format';
                }
                break;
                
            case 'match':
                const matchField = this.form.querySelector(`[name="${ruleValue}"], #${ruleValue}`);
                if (matchField && value !== matchField.value) {
                    return 'Fields do not match';
                }
                break;
                
            case 'number':
                if (value && isNaN(value)) {
                    return 'Please enter a valid number';
                }
                break;
                
            case 'integer':
                if (value && (!Number.isInteger(parseFloat(value)))) {
                    return 'Please enter a whole number';
                }
                break;
                
            case 'url':
                try {
                    new URL(value);
                } catch {
                    if (value) return 'Please enter a valid URL';
                }
                break;
                
            case 'phone':
                const phoneRegex = /^[\d\s\-\(\)\+]+$/;
                if (value && (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10)) {
                    return 'Please enter a valid phone number';
                }
                break;
                
            case 'date':
                if (value && isNaN(Date.parse(value))) {
                    return 'Please enter a valid date';
                }
                break;
                
            case 'minValue':
                if (parseFloat(value) < parseFloat(ruleValue)) {
                    return `Value must be at least ${ruleValue}`;
                }
                break;
                
            case 'maxValue':
                if (parseFloat(value) > parseFloat(ruleValue)) {
                    return `Value must be no more than ${ruleValue}`;
                }
                break;
                
            case 'alpha':
                if (value && !/^[a-zA-Z]+$/.test(value)) {
                    return 'Only letters allowed';
                }
                break;
                
            case 'alphanumeric':
                if (value && !/^[a-zA-Z0-9]+$/.test(value)) {
                    return 'Only letters and numbers allowed';
                }
                break;
                
            case 'noSpecialChars':
                if (value && /[^a-zA-Z0-9\s]/.test(value)) {
                    return 'Special characters not allowed';
                }
                break;
        }
        
        return null;
    }

    /**
     * Set field error state
     */
    setFieldError(field, fieldName, error, config) {
        this.errors.set(fieldName, error);
        
        // Add error class
        field.classList.add('field-error');
        field.classList.remove('field-success');
        
        // Set ARIA
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', `${fieldName}-error`);
        
        // Create or update error message
        let errorDiv = document.getElementById(`${fieldName}-error`);
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = `${fieldName}-error`;
            errorDiv.className = 'field-error-message';
            errorDiv.setAttribute('role', 'alert');
            
            // Insert after field or its wrapper
            const wrapper = field.closest('.form-group') || field.parentElement;
            wrapper.appendChild(errorDiv);
        }
        
        errorDiv.textContent = config.message || error;
        errorDiv.style.display = 'block';
    }

    /**
     * Clear field error
     */
    clearFieldError(field, fieldName) {
        this.errors.delete(fieldName);
        
        field.classList.remove('field-error');
        field.setAttribute('aria-invalid', 'false');
        field.removeAttribute('aria-describedby');
        
        const errorDiv = document.getElementById(`${fieldName}-error`);
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    /**
     * Set field success state
     */
    setFieldSuccess(field) {
        field.classList.add('field-success');
        field.classList.remove('field-error');
    }

    /**
     * Validate entire form
     */
    validate() {
        this.isValidating = true;
        let isValid = true;
        let firstErrorField = null;
        
        Object.keys(this.options.fields).forEach(fieldName => {
            this.touched.add(fieldName);
            const fieldValid = this.validateField(fieldName);
            
            if (!fieldValid && isValid) {
                isValid = false;
                const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
                if (field) firstErrorField = field;
            }
        });
        
        // Scroll to first error
        if (!isValid && firstErrorField && this.options.scrollToError) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.focus();
        }
        
        this.isValidating = false;
        return isValid;
    }

    /**
     * Handle form submission
     */
    async handleSubmit(event) {
        if (!this.validate()) {
            return;
        }
        
        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // Call custom submit handler if provided
        if (this.options.onSubmit) {
            try {
                await this.options.onSubmit(data, event);
            } catch (error) {
                console.error('Form submission error:', error);
                if (window.ErrorHandler) {
                    window.ErrorHandler.handleError(error, 'form_submission');
                }
            }
        }
    }

    /**
     * Get all errors
     */
    getErrors() {
        return Object.fromEntries(this.errors);
    }

    /**
     * Reset form validation
     */
    reset() {
        this.errors.clear();
        this.touched.clear();
        
        Object.keys(this.options.fields).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
            if (field) {
                this.clearFieldError(field, fieldName);
                field.classList.remove('field-success');
            }
        });
        
        this.form.reset();
    }

    /**
     * Inject validation styles
     */
    injectStyles() {
        if (document.getElementById('form-validator-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'form-validator-styles';
        style.textContent = `
            .field-error {
                border-color: var(--danger-color, #ef4444) !important;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
            }
            
            .field-success {
                border-color: var(--success-color, #10b981) !important;
                box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
            }
            
            .field-error-message {
                color: var(--danger-color, #ef4444);
                font-size: 0.875rem;
                margin-top: 0.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                animation: slideDown 0.2s ease;
            }
            
            .field-error-message::before {
                content: "⚠️";
                font-size: 1rem;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Accessible focus states */
            .field-error:focus,
            .field-success:focus {
                outline: 3px solid var(--accent-color, #a07bcc);
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }
}

// Export
window.FormValidator = FormValidator;
export default FormValidator;
