class Interpreter {
    constructor(turtle) {
        this.turtle = turtle;
        this.variables = {};
        this.functions = {};
    }

    async run(code) {
        // Simple tokenizer
        const tokens = this.tokenize(code);
        await this.execute(tokens);
    }

    tokenize(code) {
        // Match numbers, words, or brackets
        const regex = /\[|\]|\d+(\.\d+)?|[a-zA-Z_]\w*|"[a-zA-Z_]\w*|:[a-zA-Z_]\w*/g;
        return code.match(regex) || [];
    }

    async execute(tokens) {
        let i = 0;
        while (i < tokens.length) {
            let token = tokens[i].toUpperCase();

            // Handle Variables (VAR NAME VALUE)
            if (token === 'VAR') {
                const name = tokens[++i];
                const value = parseFloat(this.evaluate(tokens[++i]));
                this.variables[name] = value;
            }
            // Handle Functions (DEF NAME ... END)
            else if (token === 'DEF') {
                const name = tokens[++i].toUpperCase();
                const body = [];
                i++;
                let depth = 1;
                while (i < tokens.length && depth > 0) {
                    if (tokens[i].toUpperCase() === 'DEF') depth++;
                    if (tokens[i].toUpperCase() === 'END') depth--;
                    if (depth > 0) body.push(tokens[i]);
                    i++;
                }
                this.functions[name] = body;
                // Move i back one because the loop increments it
                i--;
            }
            // Handle REPEAT
            else if (token === 'REPEAT') {
                const count = parseInt(this.evaluate(tokens[++i]));
                const body = this.getBracketedContent(tokens, ++i);
                i += body.length + 2; // Move past brackets
                for (let r = 0; r < count; r++) {
                    await this.execute(body);
                }
                continue; // Skip the default i++
            }
            // Basic Commands
            else if (token === 'FD' || token === 'FORWARD') {
                const val = parseFloat(this.evaluate(tokens[++i]));
                this.turtle.forward(val);
            }
            else if (token === 'BK' || token === 'BACK') {
                const val = parseFloat(this.evaluate(tokens[++i]));
                this.turtle.forward(-val);
            }
            else if (token === 'RT' || token === 'RIGHT') {
                const val = parseFloat(this.evaluate(tokens[++i]));
                this.turtle.right(val);
            }
            else if (token === 'LT' || token === 'LEFT') {
                const val = parseFloat(this.evaluate(tokens[++i]));
                this.turtle.left(val);
            }
            else if (token === 'PU' || token === 'PENUP') {
                this.turtle.setPen(false);
            }
            else if (token === 'PD' || token === 'PENDOWN') {
                this.turtle.setPen(true);
            }
            else if (token === 'CS' || token === 'CLEARSCREEN') {
                this.turtle.reset();
            }
            else if (token === 'SETCOLOR') {
                this.turtle.setColor(tokens[++i]);
            }
            // Execute Custom Functions
            else if (this.functions[token]) {
                await this.execute(this.functions[token]);
            }

            i++;
            // Optional: Add a small delay for animation effect
            await new Promise(resolve => setTimeout(resolve, 5));
        }
    }

    evaluate(token) {
        if (!token) return 0;
        // If it's a variable reference (e.g. :X)
        if (token.startsWith(':')) {
            const name = token.substring(1);
            return this.variables[name] || 0;
        }
        // If it's just a variable name used directly (optional dialect)
        if (this.variables[token] !== undefined) {
            return this.variables[token];
        }
        return token;
    }

    getBracketedContent(tokens, start) {
        const body = [];
        let depth = 0;
        let i = start;
        if (tokens[i] !== '[') return [];

        i++; // skip [
        depth = 1;
        while (i < tokens.length && depth > 0) {
            if (tokens[i] === '[') depth++;
            else if (tokens[i] === ']') depth--;

            if (depth > 0) body.push(tokens[i]);
            i++;
        }
        return body;
    }
}

window.Interpreter = Interpreter;
