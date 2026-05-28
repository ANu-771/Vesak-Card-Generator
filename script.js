document.addEventListener('DOMContentLoaded', () => {
    // 1. Grab all required DOM elements
    const toInput = document.getElementById('to-input');
    const fromInput = document.getElementById('from-input');
    
    const previewTo = document.getElementById('preview-to');
    const previewFrom = document.getElementById('preview-from');
    
    const templateBtns = document.querySelectorAll('.template-btn');
    const cardBgImg = document.getElementById('card-bg-img');
    const downloadBtn = document.getElementById('download-btn');
    const cardPreview = document.getElementById('card-preview');

    const quoteSelect = document.getElementById('quote-select');
    const customQuoteGroup = document.getElementById('custom-quote-group');
    const customQuoteInput = document.getElementById('custom-quote-input');
    const previewQuote = document.getElementById('preview-quote');

    // 2. Real-Time Text Updating logic
    toInput.addEventListener('input', (e) => {
        previewTo.textContent = e.target.value || '...';
    });

    fromInput.addEventListener('input', (e) => {
        previewFrom.textContent = e.target.value || '...';
    });

    // Quote Selection Logic
    quoteSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customQuoteGroup.style.display = 'flex';
            previewQuote.textContent = customQuoteInput.value || '...';
        } else {
            customQuoteGroup.style.display = 'none';
            previewQuote.textContent = e.target.value;
        }
    });

    customQuoteInput.addEventListener('input', (e) => {
        if (quoteSelect.value === 'custom') {
            previewQuote.textContent = e.target.value || '...';
        }
    });

    // 3. Template Selection logic
    templateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove 'active' class from all buttons
            templateBtns.forEach(b => b.classList.remove('active'));
            // Add 'active' class to the clicked button
            btn.classList.add('active');
            
            // Extract the background URL from the data attribute and apply it to the preview
            const bgImgUrl = btn.getAttribute('data-bg');
            cardBgImg.src = bgImgUrl;
        });
    });

    // 4. Download Functionality using html2canvas
    downloadBtn.addEventListener('click', () => {
        // Change button state to indicate processing
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'Generating Image...';
        downloadBtn.disabled = true;

        // html2canvas configuration settings
        const config = {
            scale: 2, // 2x scale for higher resolution download quality
            useCORS: true, // Crucial for loading images across different domains
            allowTaint: false,
            backgroundColor: null, // Transparent background to preserve rounded corners
            logging: false
        };

        // Capture the 'card-preview' div
        html2canvas(cardPreview, config).then(canvas => {
            // Convert the canvas data to a high-quality PNG image Data URL
            const imgData = canvas.toDataURL('image/png', 1.0);
            
            // Create a temporary hidden link element to trigger the download
            const link = document.createElement('a');
            link.download = 'vesak-greeting-card.png';
            link.href = imgData;
            
            // Append link, trigger click, and remove it immediately
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Reset button to its original state
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }).catch(err => {
            console.error('Error generating image with html2canvas:', err);
            // Show alert and provide context regarding local files
            alert('There was an error generating your card.\n\nNote: If you are using local images and opening this file directly (file://), your browser might block the download for security reasons. Please try using a local web server (like VS Code Live Server).');
            
            // Reset button
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        });
    });
});
