document.addEventListener('DOMContentLoaded', () => {
    // 1. Grab all required DOM elements
    const toInput = document.getElementById('to-input');
    const fromInput = document.getElementById('from-input');
    
    const previewTo = document.getElementById('preview-to');
    const previewFrom = document.getElementById('preview-from');
    
    const templateBtns = document.querySelectorAll('.template-btn');
    const cardBgImg = document.getElementById('card-bg-img');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');
    const cardPreview = document.getElementById('card-preview');

    const quoteSelect = document.getElementById('quote-select');
    const customQuoteGroup = document.getElementById('custom-quote-group');
    const customQuoteInput = document.getElementById('custom-quote-input');
    const previewQuote = document.getElementById('preview-quote');
    const orientationSelect = document.getElementById('orientation-select');

    const colorSwatches = document.querySelectorAll('.color-swatch');
    const fontSelect = document.getElementById('font-select');

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
            cardBgImg.style.backgroundImage = `url('${bgImgUrl}')`;
        });
    });

    // 4. Orientation Selection logic
    orientationSelect.addEventListener('change', (e) => {
        if (e.target.value === 'landscape') {
            cardPreview.classList.add('landscape');
        } else {
            cardPreview.classList.remove('landscape');
        }
    });

    // Font Style & Color Logic
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            // Remove active class from all
            colorSwatches.forEach(s => s.classList.remove('active'));
            // Add to clicked
            swatch.classList.add('active');
            // Update CSS variable
            cardPreview.style.setProperty('--preview-text-color', swatch.getAttribute('data-color'));
        });
    });

    fontSelect.addEventListener('change', (e) => {
        cardPreview.style.setProperty('--preview-font-family', e.target.value);
    });

    // 5. Download Functionality using html2canvas
    downloadBtn.addEventListener('click', () => {
        // Change button state to indicate processing
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'Generating Image...';
        downloadBtn.disabled = true;

        // Temporarily remove border-radius to prevent white corner artifacts on export
        const originalBorderRadius = cardPreview.style.borderRadius;
        cardPreview.style.borderRadius = '0';

        // html2canvas configuration settings
        const config = {
            scale: 3, // 3x scale for much higher resolution download quality
            useCORS: true, // Crucial for loading images across different domains
            allowTaint: false,
            backgroundColor: null, 
            logging: false,
            onclone: (clonedDoc) => {
                const clonedCard = clonedDoc.getElementById('card-preview');
                // Force a consistent, high-res base dimension off-screen!
                // Container queries (cqw) will automatically scale up all fonts seamlessly.
                if (clonedCard.classList.contains('landscape')) {
                    clonedCard.style.width = '800px';
                    clonedCard.style.maxWidth = '800px';
                    clonedCard.style.height = '600px';
                } else {
                    clonedCard.style.width = '600px';
                    clonedCard.style.maxWidth = '600px';
                    clonedCard.style.height = '800px';
                }
            }
        };

        // Capture the 'card-preview' div
        html2canvas(cardPreview, config).then(canvas => {
            cardPreview.style.borderRadius = originalBorderRadius; // Restore border-radius
            
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
            cardPreview.style.borderRadius = originalBorderRadius; // Restore border-radius
            console.error('Error generating image with html2canvas:', err);
            // Show alert and provide context regarding local files
            alert('There was an error generating your card.\n\nNote: If you are using local images and opening this file directly (file://), your browser might block the download for security reasons. Please try using a local web server (like VS Code Live Server).');
            
            // Reset button
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        });
    });

    // 5. WhatsApp Share Functionality
    shareBtn.addEventListener('click', () => {
        const originalText = shareBtn.innerHTML;
        shareBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
        shareBtn.disabled = true;

        const originalBorderRadius = cardPreview.style.borderRadius;
        cardPreview.style.borderRadius = '0';

        const config = {
            scale: 3, // 3x scale for higher quality sharing
            useCORS: true,
            allowTaint: false,
            backgroundColor: null,
            logging: false,
            onclone: (clonedDoc) => {
                const clonedCard = clonedDoc.getElementById('card-preview');
                // Force a consistent, high-res base dimension off-screen
                if (clonedCard.classList.contains('landscape')) {
                    clonedCard.style.width = '800px';
                    clonedCard.style.maxWidth = '800px';
                    clonedCard.style.height = '600px';
                } else {
                    clonedCard.style.width = '600px';
                    clonedCard.style.maxWidth = '600px';
                    clonedCard.style.height = '800px';
                }
            }
        };

        html2canvas(cardPreview, config).then(canvas => {
            cardPreview.style.borderRadius = originalBorderRadius; // Restore border-radius
            canvas.toBlob((blob) => {
                if (!blob) {
                    throw new Error('Canvas to Blob conversion failed.');
                }
                const file = new File([blob], 'vesak-card.png', { type: 'image/png' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    navigator.share({
                        title: 'Happy Vesak!',
                        text: '',
                        files: [file]
                    }).then(() => {
                        console.log('Successfully shared');
                        resetShareBtn(shareBtn, originalText);
                    }).catch((error) => {
                        console.error('Error sharing', error);
                        resetShareBtn(shareBtn, originalText);
                    });
                } else {
                    fallbackShare(blob);
                    resetShareBtn(shareBtn, originalText);
                }
            }, 'image/png', 1.0);
        }).catch(err => {
            cardPreview.style.borderRadius = originalBorderRadius; // Restore border-radius
            console.error('Error generating image for share:', err);
            fallbackShare();
            resetShareBtn(shareBtn, originalText);
        });
    });

    function fallbackShare(blob = null) {
        if (blob) {
            // Automatically download the file for the user since sharing failed
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'vesak-card.png';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            
            alert('Your browser does not support direct image sharing. We have automatically downloaded the card to your device!\n\nYou can now attach it manually in WhatsApp.');
        } else {
            alert('Direct sharing is not supported on this browser. Please download the card and share it manually via WhatsApp Web.');
        }
        
        window.open('https://api.whatsapp.com/send', '_blank');
    }

    function resetShareBtn(btn, originalText) {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});
