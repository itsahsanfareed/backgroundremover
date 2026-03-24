document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const uploadArea = document.getElementById('upload-area');
    const loadingArea = document.getElementById('loading-area');
    const resultArea = document.getElementById('result-area');
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const originalImage = document.getElementById('original-image');
    const processedImage = document.getElementById('processed-image');
    const resetBtn = document.getElementById('reset-btn');
    const downloadBtn = document.getElementById('download-btn');
    const errorToast = document.getElementById('error-message');

    // UI State Management
    const showView = (viewElement) => {
        [uploadArea, loadingArea, resultArea].forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('active-view');
        });
        viewElement.classList.remove('hidden');
        // Small timeout to allow display:block to apply before animating opacity
        setTimeout(() => viewElement.classList.add('active-view'), 10);
    };

    const showError = (message) => {
        errorToast.textContent = message;
        errorToast.classList.add('show');
        setTimeout(() => {
            errorToast.classList.remove('show');
        }, 5000);
    };

    // File Handling
    const handleFile = async (file) => {
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showError('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
            return;
        }

        // Validate file size (e.g. max 10MB)
        if (file.size > 10 * 1024 * 1024) {
             showError('File is too large. Maximum size is 10MB.');
             return;
        }

        // Show original image preview
        const objectUrl = URL.createObjectURL(file);
        originalImage.src = objectUrl;

        // Transition to Loading State
        showView(loadingArea);

        // Process File
        await processImage(file);
    };

    const processImage = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const bgColor = document.getElementById('bg-color').value;
        if (bgColor && bgColor !== '#000000') {
            formData.append('bg_color', bgColor);
        }

        try {
            const response = await fetch('/api/remove-bg', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to process image');
            }

            // Get the resulting image as a blob
            const blob = await response.blob();
            const resultObjectUrl = URL.createObjectURL(blob);

            // Display result
            processedImage.src = resultObjectUrl;
            
            // Set up download button
            const originalName = file.name.split('.')[0];
            downloadBtn.href = resultObjectUrl;
            downloadBtn.download = `${originalName}_nobg.png`;

            showView(resultArea);

        } catch (error) {
            console.error('API Error:', error);
            showError(error.message || 'An error occurred during processing.');
            showView(uploadArea);
            fileInput.value = ''; // Reset input
        }
    };

    // Event Listeners: Click to Upload
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Event Listeners: Drag and Drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Event Listeners: Reset
    resetBtn.addEventListener('click', () => {
        fileInput.value = '';
        originalImage.src = '';
        processedImage.src = '';
    });

    // Developer API Key
    const devBtn = document.getElementById('dev-btn');
    if (devBtn) {
        devBtn.addEventListener('click', async () => {
            try {
                const res = await fetch('/api/generate-key', { method: 'POST' });
                const data = await res.json();
                
                let display = document.getElementById('api-key-display');
                if (!display) {
                    display = document.createElement('div');
                    display.id = 'api-key-display';
                    display.className = 'api-key-display';
                    document.getElementById('api-key-container').appendChild(display);
                }
                display.innerHTML = `<strong>Your API Key:</strong> ${data.api_key}<br><br><small>${data.message}</small>`;
            } catch (err) {
                showError('Failed to generate API Key.');
            }
        });
    }
});
