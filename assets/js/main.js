/**
 * Avilo Immigration - Main Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initScrollAnimations();
    initFooterYear();
    initContactForm();
});

/* -------------------------------------------------------------------------- */
/* Mobile Navigation */
/* -------------------------------------------------------------------------- */
function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-link, .btn'); // include CTA buttons in nav

    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', !isExpanded);
        nav.classList.toggle('open');
    });

    // Close menu when a link is clicked
    links.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        });
    });
}

/* -------------------------------------------------------------------------- */
/* Scroll Animations (IntersectionObserver) */
/* -------------------------------------------------------------------------- */
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px"
    });

    reveals.forEach(el => observer.observe(el));
}

/* -------------------------------------------------------------------------- */
/* Footer Year */
/* -------------------------------------------------------------------------- */
function initFooterYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

/* -------------------------------------------------------------------------- */
/* Contact Form Handling */
/* -------------------------------------------------------------------------- */
function initContactForm() {
    const form = document.querySelector('#contact-form');
    if (!form) return;

    const statusObj = document.createElement('div');
    statusObj.className = 'form-status';
    statusObj.style.marginTop = '1rem';
    statusObj.style.padding = '1rem';
    statusObj.style.borderRadius = '12px';
    statusObj.style.display = 'none'; // hidden by default
    form.insertAdjacentElement('beforeend', statusObj); // Append after all fields, before end of form

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Basic Client-Side Validation check (browser mostly handles this with 'required')
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const data = new FormData(event.target);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Message';

        // Honeypot check
        if(data.get('website')) {
            // It's a bot
            console.log('Bot detected');
            return; 
        }

        // UI: Loading
        if(submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin" style="margin-right:8px; animation: spin 1s linear infinite;">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg> Sending...
            `;
        }
        
        // Add minimal spinner css inline if needed or rely on styles
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes spin { 100% { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);

        try {
            const response = await fetch(event.target.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // UI: Success
                form.reset();
                statusObj.style.display = 'block';
                statusObj.style.backgroundColor = '#d1fae5'; // pale green
                statusObj.style.color = '#065f46'; // dark green
                statusObj.innerHTML = `<p><strong>Success!</strong> Your message has been sent. We'll be in touch shortly.</p>`;
                setTimeout(() => {
                    statusObj.style.display = 'none';
                }, 5000);
            } else {
                // UI: Error
                const errorData = await response.json();
                throw new Error(errorData.errors ? errorData.errors.map(e => e.message).join(', ') : 'Unknown error');
            }
        } catch (error) {
            statusObj.style.display = 'block';
            statusObj.style.backgroundColor = '#fee2e2'; // pale red
            statusObj.style.color = '#991b1b'; // dark red
            statusObj.innerHTML = `<p><strong>Error:</strong> Oops! There was a problem submitting your form. Please try again.</p>`;
        } finally {
            if(submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }
    });
}

/* -------------------------------------------------------------------------- */
/* Country List & Phone Code Helper */
/* -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    populateCountriesAndCodes();
});

/* -------------------------------------------------------------------------- */
/* Searchable Select Logic */
/* -------------------------------------------------------------------------- */

function initSearchableSelects(countries) {
    const wrappers = document.querySelectorAll('.searchable-select');
    
    wrappers.forEach(wrapper => {
        const input = wrapper.querySelector('.search-input');
        const list = wrapper.querySelector('.options-list');
        const hiddenInput = wrapper.querySelector('input[type="hidden"]');
        
        if (!input || !list) return;

        // Populate List
        countries.forEach(c => {
            const item = document.createElement('div');
            item.className = 'option-item';
            item.textContent = `${c.flag} ${c.name}`;
            item.dataset.value = c.name;
            
            item.addEventListener('click', () => {
                input.value = item.textContent;
                hiddenInput.value = c.name;
                list.classList.remove('show');
            });
            
            list.appendChild(item);
        });

        // Toggle List
        input.addEventListener('click', () => {
            list.classList.toggle('show');
            input.focus(); // Keep focus for typing
        });

        // Filter Logic
        input.addEventListener('input', () => {
            const filter = input.value.toLowerCase();
            list.classList.add('show');
            
            const items = list.querySelectorAll('.option-item');
            items.forEach(item => {
                if (item.textContent.toLowerCase().includes(filter)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                list.classList.remove('show');
            }
        });
    });
}

function populateCountriesAndCodes() {
    // Only phone selects are standard selects now
    const phoneSelects = document.querySelectorAll('.phone-code-select');
    
    if (phoneSelects.length === 0) return;

    // Format: [Name, Code, Flag]
    const countries = [
        { name: "Afghanistan", code: "+93", flag: "🇦🇫" },
        { name: "Albania", code: "+355", flag: "🇦🇱" },
        { name: "Algeria", code: "+213", flag: "🇩🇿" },
        { name: "Andorra", code: "+376", flag: "🇦🇩" },
        { name: "Angola", code: "+244", flag: "🇦🇴" },
        { name: "Argentina", code: "+54", flag: "🇦🇷" },
        { name: "Armenia", code: "+374", flag: "🇦🇲" },
        { name: "Australia", code: "+61", flag: "🇦🇺" },
        { name: "Austria", code: "+43", flag: "🇦🇹" },
        { name: "Azerbaijan", code: "+994", flag: "🇦🇿" },
        { name: "Bahrain", code: "+973", flag: "🇧🇭" },
        { name: "Bangladesh", code: "+880", flag: "🇧🇩" },
        { name: "Belarus", code: "+375", flag: "🇧🇾" },
        { name: "Belgium", code: "+32", flag: "🇧🇪" },
        { name: "Belize", code: "+501", flag: "🇧🇿" },
        { name: "Benin", code: "+229", flag: "🇧🇯" },
        { name: "Bhutan", code: "+975", flag: "🇧🇹" },
        { name: "Bolivia", code: "+591", flag: "🇧🇴" },
        { name: "Bosnia and Herzegovina", code: "+387", flag: "🇧🇦" },
        { name: "Botswana", code: "+267", flag: "🇧🇼" },
        { name: "Brazil", code: "+55", flag: "🇧🇷" },
        { name: "Bulgaria", code: "+359", flag: "🇧🇬" },
        { name: "Burkina Faso", code: "+226", flag: "🇧🇫" },
        { name: "Burundi", code: "+257", flag: "🇧🇮" },
        { name: "Cambodia", code: "+855", flag: "🇰🇭" },
        { name: "Cameroon", code: "+237", flag: "🇨🇲" },
        { name: "Canada", code: "+1", flag: "🇨🇦" },
        { name: "Cape Verde", code: "+238", flag: "🇨🇻" },
        { name: "Central African Republic", code: "+236", flag: "🇨🇫" },
        { name: "Chad", code: "+235", flag: "🇹🇩" },
        { name: "Chile", code: "+56", flag: "🇨🇱" },
        { name: "China", code: "+86", flag: "🇨🇳" },
        { name: "Colombia", code: "+57", flag: "🇨🇴" },
        { name: "Comoros", code: "+269", flag: "🇰🇲" },
        { name: "Congo", code: "+242", flag: "🇨🇬" },
        { name: "Costa Rica", code: "+506", flag: "🇨🇷" },
        { name: "Croatia", code: "+385", flag: "🇭🇷" },
        { name: "Cuba", code: "+53", flag: "🇨🇺" },
        { name: "Cyprus", code: "+357", flag: "🇨🇾" },
        { name: "Czech Republic", code: "+420", flag: "🇨🇿" },
        { name: "Denmark", code: "+45", flag: "🇩🇰" },
        { name: "Djibouti", code: "+253", flag: "🇩🇯" },
        { name: "Dominica", code: "+1-767", flag: "🇩🇲" },
        { name: "Dominican Republic", code: "+1", flag: "🇩🇴" },
        { name: "DR Congo", code: "+243", flag: "🇨🇩" },
        { name: "Ecuador", code: "+593", flag: "🇪🇨" },
        { name: "Egypt", code: "+20", flag: "🇪🇬" },
        { name: "El Salvador", code: "+503", flag: "🇸🇻" },
        { name: "Equatorial Guinea", code: "+240", flag: "🇬🇶" },
        { name: "Eritrea", code: "+291", flag: "🇪🇷" },
        { name: "Estonia", code: "+372", flag: "🇪🇪" },
        { name: "Eswatini", code: "+268", flag: "🇸🇿" },
        { name: "Ethiopia", code: "+251", flag: "🇪🇹" },
        { name: "Fiji", code: "+679", flag: "🇫🇯" },
        { name: "Finland", code: "+358", flag: "🇫🇮" },
        { name: "France", code: "+33", flag: "🇫🇷" },
        { name: "Gabon", code: "+241", flag: "🇬🇦" },
        { name: "Gambia", code: "+220", flag: "🇬🇲" },
        { name: "Georgia", code: "+995", flag: "🇬🇪" },
        { name: "Germany", code: "+49", flag: "🇩🇪" },
        { name: "Ghana", code: "+233", flag: "🇬🇭" },
        { name: "Greece", code: "+30", flag: "🇬🇷" },
        { name: "Guatemala", code: "+502", flag: "🇬🇹" },
        { name: "Guinea", code: "+224", flag: "🇬🇳" },
        { name: "Guyana", code: "+592", flag: "🇬🇾" },
        { name: "Haiti", code: "+509", flag: "🇭🇹" },
        { name: "Honduras", code: "+504", flag: "🇭🇳" },
        { name: "Hong Kong", code: "+852", flag: "🇭🇰" },
        { name: "Hungary", code: "+36", flag: "🇭🇺" },
        { name: "Iceland", code: "+354", flag: "🇮🇸" },
        { name: "India", code: "+91", flag: "🇮🇳" },
        { name: "Indonesia", code: "+62", flag: "🇮🇩" },
        { name: "Iran", code: "+98", flag: "🇮🇷" },
        { name: "Iraq", code: "+964", flag: "🇮🇶" },
        { name: "Ireland", code: "+353", flag: "🇮🇪" },
        { name: "Israel", code: "+972", flag: "🇮🇱" },
        { name: "Italy", code: "+39", flag: "🇮🇹" },
        { name: "Jamaica", code: "+1", flag: "🇯🇲" },
        { name: "Japan", code: "+81", flag: "🇯🇵" },
        { name: "Jordan", code: "+962", flag: "🇯🇴" },
        { name: "Kazakhstan", code: "+7", flag: "🇰🇿" },
        { name: "Kenya", code: "+254", flag: "🇰🇪" },
        { name: "Kuwait", code: "+965", flag: "🇰🇼" },
        { name: "Kyrgyzstan", code: "+996", flag: "🇰🇬" },
        { name: "Laos", code: "+856", flag: "🇱🇦" },
        { name: "Latvia", code: "+371", flag: "🇱🇻" },
        { name: "Lebanon", code: "+961", flag: "🇱🇧" },
        { name: "Lesotho", code: "+266", flag: "🇱🇸" },
        { name: "Liberia", code: "+231", flag: "🇱🇷" },
        { name: "Libya", code: "+218", flag: "🇱🇾" },
        { name: "Liechtenstein", code: "+423", flag: "🇱🇮" },
        { name: "Lithuania", code: "+370", flag: "🇱🇹" },
        { name: "Luxembourg", code: "+352", flag: "🇱🇺" },
        { name: "Madagascar", code: "+261", flag: "🇲🇬" },
        { name: "Malawi", code: "+265", flag: "🇲🇼" },
        { name: "Malaysia", code: "+60", flag: "🇲🇾" },
        { name: "Maldives", code: "+960", flag: "🇲🇻" },
        { name: "Mali", code: "+223", flag: "🇲🇱" },
        { name: "Malta", code: "+356", flag: "🇲🇹" },
        { name: "Mauritania", code: "+222", flag: "🇲🇷" },
        { name: "Mauritius", code: "+230", flag: "🇲🇺" },
        { name: "Mexico", code: "+52", flag: "🇲🇽" },
        { name: "Moldova", code: "+373", flag: "🇲🇩" },
        { name: "Mongolia", code: "+976", flag: "🇲🇳" },
        { name: "Montenegro", code: "+382", flag: "🇲🇪" },
        { name: "Morocco", code: "+212", flag: "🇲🇦" },
        { name: "Mozambique", code: "+258", flag: "🇲🇿" },
        { name: "Myanmar", code: "+95", flag: "🇲🇲" },
        { name: "Namibia", code: "+264", flag: "🇳🇦" },
        { name: "Nepal", code: "+977", flag: "🇳🇵" },
        { name: "Netherlands", code: "+31", flag: "🇳🇱" },
        { name: "New Zealand", code: "+64", flag: "🇳🇿" },
        { name: "Nicaragua", code: "+505", flag: "🇳🇮" },
        { name: "Niger", code: "+227", flag: "🇳🇪" },
        { name: "Nigeria", code: "+234", flag: "🇳🇬" },
        { name: "North Korea", code: "+850", flag: "🇰🇵" },
        { name: "North Macedonia", code: "+389", flag: "🇲🇰" },
        { name: "Norway", code: "+47", flag: "🇳🇴" },
        { name: "Oman", code: "+968", flag: "🇴🇲" },
        { name: "Pakistan", code: "+92", flag: "🇵🇰" },
        { name: "Palestine", code: "+970", flag: "🇵🇸" },
        { name: "Panama", code: "+507", flag: "🇵🇦" },
        { name: "Papua New Guinea", code: "+675", flag: "🇵🇬" },
        { name: "Paraguay", code: "+595", flag: "🇵🇾" },
        { name: "Peru", code: "+51", flag: "🇵🇪" },
        { name: "Philippines", code: "+63", flag: "🇵🇭" },
        { name: "Poland", code: "+48", flag: "🇵🇱" },
        { name: "Portugal", code: "+351", flag: "🇵🇹" },
        { name: "Qatar", code: "+974", flag: "🇶🇦" },
        { name: "Romania", code: "+40", flag: "🇷🇴" },
        { name: "Russia", code: "+7", flag: "🇷🇺" },
        { name: "Rwanda", code: "+250", flag: "🇷🇼" },
        { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
        { name: "Senegal", code: "+221", flag: "🇸🇳" },
        { name: "Serbia", code: "+381", flag: "🇷🇸" },
        { name: "Seychelles", code: "+248", flag: "🇸🇨" },
        { name: "Sierra Leone", code: "+232", flag: "🇸🇱" },
        { name: "Singapore", code: "+65", flag: "🇸🇬" },
        { name: "Slovakia", code: "+421", flag: "🇸🇰" },
        { name: "Slovenia", code: "+386", flag: "🇸🇮" },
        { name: "Somalia", code: "+252", flag: "🇸🇴" },
        { name: "South Africa", code: "+27", flag: "🇿🇦" },
        { name: "South Korea", code: "+82", flag: "🇰🇷" },
        { name: "Spain", code: "+34", flag: "🇪🇸" },
        { name: "Sri Lanka", code: "+94", flag: "🇱🇰" },
        { name: "Sudan", code: "+249", flag: "🇸🇩" },
        { name: "Suriname", code: "+597", flag: "🇸🇷" },
        { name: "Sweden", code: "+46", flag: "🇸🇪" },
        { name: "Switzerland", code: "+41", flag: "🇨🇭" },
        { name: "Syria", code: "+963", flag: "🇸🇾" },
        { name: "Taiwan", code: "+886", flag: "🇹🇼" },
        { name: "Tajikistan", code: "+992", flag: "🇹🇯" },
        { name: "Tanzania", code: "+255", flag: "🇹🇿" },
        { name: "Thailand", code: "+66", flag: "🇹🇭" },
        { name: "Togo", code: "+228", flag: "🇹🇬" },
        { name: "Tunisia", code: "+216", flag: "🇹🇳" },
        { name: "Turkey", code: "+90", flag: "🇹🇷" },
        { name: "Turkmenistan", code: "+993", flag: "🇹🇲" },
        { name: "Uganda", code: "+256", flag: "🇺🇬" },
        { name: "Ukraine", code: "+380", flag: "🇺🇦" },
        { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
        { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
        { name: "United States of America", code: "+1", flag: "🇺🇸" },
        { name: "Uruguay", code: "+598", flag: "🇺🇾" },
        { name: "Uzbekistan", code: "+998", flag: "🇺🇿" },
        { name: "Vanuatu", code: "+678", flag: "🇻🇺" },
        { name: "Venezuela", code: "+58", flag: "🇻🇪" },
        { name: "Vietnam", code: "+84", flag: "🇻🇳" },
        { name: "Yemen", code: "+967", flag: "🇾🇪" },
        { name: "Zambia", code: "+260", flag: "🇿🇲" },
        { name: "Zimbabwe", code: "+263", flag: "🇿🇼" }
    ];

    // Initialize the Searchable Selects (Residence / Nationality) - Use name order
    initSearchableSelects(countries);

    // Initialize Phone Code Searchable Select
    initPhoneCodeSelect(countries);
}

function initPhoneCodeSelect(countries) {
    const wrapper = document.querySelector('#phone-code-wrapper');
    if (!wrapper) return;

    const input = wrapper.querySelector('.search-input');
    const list = wrapper.querySelector('.options-list');
    const hiddenInput = wrapper.querySelector('input[type="hidden"]');

    // Sort by code for the list
    const sortedForPhone = [...countries].sort((a, b) => {
        const codeA = parseInt(a.code.replace(/\D/g, '')) || 0;
        const codeB = parseInt(b.code.replace(/\D/g, '')) || 0;
        return codeA - codeB;
    });

    // Populate List
    sortedForPhone.forEach(c => {
        const item = document.createElement('div');
        item.className = 'option-item';
        // Display: 🇧🇪 +32 Belgium (Allows visual confirmation)
        item.textContent = `${c.flag} ${c.code}  ${c.name}`;
        item.dataset.value = c.code;
        // Search by code OR name
        item.dataset.search = `${c.code} ${c.name}`.toLowerCase();

        item.addEventListener('click', () => {
            // Selected view: 🇧🇪 +32
            input.value = `${c.flag} ${c.code}`;
            hiddenInput.value = c.code;
            list.classList.remove('show');
        });

        list.appendChild(item);
    });

    // Toggle List
    input.addEventListener('click', () => {
        list.classList.toggle('show');
        input.value = ''; // Clear for easy typing of new code? Or maybe select all. Let's keep value but focus.
        // Actually for codes, clearing might be better if they want to type "+1" immediately
        // But let's stick to standard behavior: just focus. 
        input.focus();
    });

    // Filter Logic
    input.addEventListener('input', () => {
        const filter = input.value.toLowerCase();
        list.classList.add('show');

        const items = list.querySelectorAll('.option-item');
        items.forEach(item => {
            // Match against the custom search dataset
            if (item.dataset.search.includes(filter)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            list.classList.remove('show');
            // If empty, revert to default or keep empty? 
            // If they clicked out without selecting, verify if valid? 
            // For now, simple behavior.
        }
    });

    // Default Selection (Belgium)
    const defaultCountry = countries.find(c => c.code === '+32');
    if (defaultCountry) {
        input.value = `${defaultCountry.flag} ${defaultCountry.code}`;
        hiddenInput.value = defaultCountry.code;
    }
}

