document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('logo-editor');
    const highlight = document.getElementById('editor-highlight');

    const keywords = ['FD', 'BK', 'RT', 'LT', 'REPEAT', 'DEF', 'END', 'VAR', 'PU', 'PD', 'CS', 'SETCOLOR', 'FORWARD', 'BACK', 'RIGHT', 'LEFT', 'PENUP', 'PENDOWN', 'CLEARSCREEN'];

    function updateHighlight() {
        let text = editor.value;

        // Escape HTML
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Highlight Keywords (with word boundaries)
        keywords.forEach(kw => {
            const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
            html = html.replace(regex, '<span class="hl-kw">$1</span>');
        });

        // Highlight Numbers (using a lookahead to avoid breaking tags)
        // We match digits that are not inside a < ... > tag
        html = html.replace(/\b(\d+(\.\d+)?)\b(?![^<>]*>)/g, '<span class="hl-num">$1</span>');

        // Highlight Variables
        html = html.replace(/:([a-zA-Z_]\w*)/g, '<span class="hl-var">:$1</span>');

        // Highlight Brackets
        html = html.replace(/\[/g, '<span class="hl-bracket">[</span>');
        html = html.replace(/\]/g, '<span class="hl-bracket">]</span>');

        highlight.innerHTML = html + '\n';
    }

    editor.addEventListener('input', updateHighlight);
    editor.addEventListener('scroll', () => {
        highlight.scrollTop = editor.scrollTop;
        highlight.scrollLeft = editor.scrollLeft;
    });

    updateHighlight();
});
