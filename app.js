document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('turtle-canvas');
    const overlayCanvas = document.getElementById('turtle-overlay');
    const runBtn = document.getElementById('run-btn');
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');
    const editor = document.getElementById('logo-editor');
    const programSelect = document.getElementById('program-select');
    const statusDisplay = document.getElementById('status-display');
    const turtleOpts = document.querySelectorAll('.turtle-opt');
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeModal = document.querySelector('.close-modal');
    const sampleCards = document.querySelectorAll('.sample-card');

    // Set canvas size
    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        [canvas, overlayCanvas].forEach(c => {
            c.width = rect.width;
            c.height = rect.height;
        });
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const turtle = new Turtle(canvas, overlayCanvas);
    const interpreter = new Interpreter(turtle);

    // Help Modal Logic
    helpBtn.addEventListener('click', () => {
        helpModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        helpModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });

    // Sample Cards Logic
    sampleCards.forEach(card => {
        card.addEventListener('click', async () => {
            const code = card.getAttribute('data-code').replace(/\\n/g, '\n');

            // 1. Close modal
            helpModal.style.display = 'none';

            // 2. Clear canvas and reset turtle
            turtle.reset();

            // 3. Update editor
            editor.value = code;
            editor.dispatchEvent(new Event('input')); // Update highlighting

            // 4. Auto-run
            statusDisplay.textContent = `Inspiring ${card.querySelector('h4').textContent} is starting!`;
            runBtn.disabled = true;
            try {
                await interpreter.run(code);
                statusDisplay.textContent = `${card.querySelector('h4').textContent} finished!`;
            } catch (err) {
                console.error(err);
                statusDisplay.textContent = 'Oops! Try again.';
            } finally {
                runBtn.disabled = false;
            }
        });
    });

    // Sprite Selection

    // Sprite Selection
    turtleOpts.forEach(opt => {
        opt.addEventListener('click', () => {
            turtleOpts.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            turtle.setSprite(opt);
        });
    });

    // Default sprite
    turtle.setSprite(document.querySelector('.turtle-opt.active'));

    // Initial state
    turtle.reset();

    // Load saved programs from localStorage
    function loadSavedPrograms() {
        const saved = JSON.parse(localStorage.getItem('logo_projects') || '{}');
        programSelect.innerHTML = '<option value="default">New Project</option>';
        for (const name in saved) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            programSelect.appendChild(option);
        }
    }

    runBtn.addEventListener('click', async () => {
        const code = editor.value;
        statusDisplay.textContent = 'Turtle is running...';
        runBtn.disabled = true;

        try {
            await interpreter.run(code);
            statusDisplay.textContent = 'Turtle is finished!';
        } catch (err) {
            console.error(err);
            statusDisplay.textContent = 'Oops! Something went wrong.';
        } finally {
            runBtn.disabled = false;
        }
    });

    saveBtn.addEventListener('click', () => {
        const name = prompt('What shall we call this project?', 'My Masterpiece');
        if (name) {
            const saved = JSON.parse(localStorage.getItem('logo_projects') || '{}');
            saved[name] = editor.value;
            localStorage.setItem('logo_projects', JSON.stringify(saved));
            loadSavedPrograms();
            programSelect.value = name;
            statusDisplay.textContent = `Saved "${name}"!`;
        }
    });

    resetBtn.addEventListener('click', () => {
        turtle.reset();
        statusDisplay.textContent = 'Canvas cleared!';
    });

    programSelect.addEventListener('change', () => {
        const name = programSelect.value;
        if (name === 'default') {
            editor.value = '';
        } else {
            const saved = JSON.parse(localStorage.getItem('logo_projects') || '{}');
            editor.value = saved[name] || '';
        }
        // Force highlight update
        editor.dispatchEvent(new Event('input'));
    });

    // Initialize
    loadSavedPrograms();

    // Default example
    if (editor.value === '') {
        editor.value = `DEF SQUARE
  REPEAT 4 [ FD 100 RT 90 ]
END

SQUARE`;
        editor.dispatchEvent(new Event('input'));
    }
});
