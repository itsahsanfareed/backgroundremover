document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-key-btn');
    const container = document.getElementById('api-key-container');
    const errorToast = document.getElementById('error-message');

    const showError = (message) => {
        errorToast.textContent = message;
        errorToast.classList.add('show');
        setTimeout(() => {
            errorToast.classList.remove('show');
        }, 5000);
    };

    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';

            try {
                const res = await fetch('/api/generate-key', { method: 'POST' });
                const data = await res.json();
                
                let display = document.getElementById('api-key-display');
                if (!display) {
                    display = document.createElement('div');
                    display.id = 'api-key-display';
                    display.className = 'api-key-display';
                    container.appendChild(display);
                }
                display.innerHTML = `<strong>Your API Key:</strong> ${data.api_key}<br><br><small>${data.message}</small>`;
                
            } catch (err) {
                showError('Failed to generate API Key. Ensure the backend is running.');
            } finally {
                generateBtn.disabled = false;
                generateBtn.textContent = 'Generate New API Key';
            }
        });
    }
});
