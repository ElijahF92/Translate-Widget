document.addEventListener('DOMContentLoaded', function() {
    const sourceText = document.getElementById('source-text');
    const targetText = document.getElementById('target-text');
    const sourceLanguage = document.getElementById('source-language');
    const targetLanguage = document.getElementById('target-language');

    sourceText.addEventListener('input', debounce(translateText, 500));
    sourceLanguage.addEventListener('change', translateText);
    targetLanguage.addEventListener('change', translateText);

    // Add character counter functionality
    const charCounter = document.querySelector('.char-counter');
    
    sourceText.addEventListener('input', function() {
        const length = this.value.length;
        charCounter.textContent = `${length}/500 characters`;
    });

    // Add copy button functionality
    const copyButton = document.querySelector('.copy-button');
    
    copyButton.addEventListener('click', async function() {
        const textToCopy = targetText.value;
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            
            // Visual feedback
            this.style.backgroundColor = 'rgba(40, 167, 69, 0.8)';
            setTimeout(() => {
                this.style.backgroundColor = '';
            }, 1000);
        } catch (err) {
            console.error('Failed to copy text:', err);
            
            // Visual feedback for error
            this.style.backgroundColor = 'rgba(220, 53, 69, 0.8)';
            setTimeout(() => {
                this.style.backgroundColor = '';
            }, 1000);
        }
    });

    // Add swap button functionality
    const swapButton = document.querySelector('.swap-button');
    
    swapButton.addEventListener('click', function() {
        // Swap languages
        const sourceVal = sourceLanguage.value;
        const targetVal = targetLanguage.value;
        
        if (sourceVal && targetVal) {
            // Update Select2 values and trigger change event
            $(sourceLanguage).val(targetVal).trigger('change');
            $(targetLanguage).val(sourceVal).trigger('change');
            
            // Swap text content
            const sourceContent = sourceText.value;
            sourceText.value = targetText.value;
            targetText.value = sourceContent;
            
            // Update character counter
            const length = sourceText.value.length;
            charCounter.textContent = `${length}/500 characters`;
        }
    });

    // Debounce function to prevent too many API calls
    function debounce(func, wait) {
        let timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, arguments), wait);
        };
    }

    async function translateText() {
        const text = sourceText.value.trim();
        const source = sourceLanguage.value;
        const target = targetLanguage.value;

        if (!text || !source || !target) {
            return;
        }

        try {
            const encodedText = encodeURIComponent(text);
            const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${source}|${target}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.responseData && data.responseData.translatedText) {
                targetText.value = data.responseData.translatedText;
            } else {
                targetText.value = "Translation error. Please try again.";
            }
        } catch (error) {
            console.error('Translation error:', error);
            targetText.value = "Translation error. Please try again.";
        }
    }
});
