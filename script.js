document.addEventListener('DOMContentLoaded', function() {
    const sourceText = document.getElementById('source-text');
    const targetText = document.getElementById('target-text');
    const sourceLanguage = document.getElementById('source-language');
    const targetLanguage = document.getElementById('target-language');

    sourceText.addEventListener('input', debounce(translateText, 500));
    sourceLanguage.addEventListener('change', translateText);
    targetLanguage.addEventListener('change', translateText);

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
