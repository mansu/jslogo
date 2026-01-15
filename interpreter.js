class Interpreter {
    constructor(turtle) {
        this.turtle = turtle;
        this.variables = {};
        this.functions = {};
        this.commands = ['FD', 'BK', 'RT', 'LT', 'PU', 'PD', 'CS', 'SETCOLOR', 'REPEAT', 'VAR', 'DEF', 'END', 'FORWARD', 'BACK', 'RIGHT', 'LEFT', 'PENUP', 'PENDOWN', 'CLEARSCREEN'];
    }

    async run(code) {
        const tokens = this.tokenize(code);
        this.validate(tokens);
        await this.execute(tokens);
    }

    tokenize(code) {
        const tokens = [];
        const lines = code.split('\n');

        lines.forEach((lineText, lineIdx) => {
            const regex = /\[|\]|\d+(\.\d+)?|[a-zA-Z_]\w*|"[a-zA-Z_]\w*|:[a-zA-Z_]\w*/g;
            let match;
            while ((match = regex.exec(lineText)) !== null) {
                tokens.push({
                    value: match[0],
                    line: lineIdx + 1
                });
            }
        });
        return tokens;
    }

    validate(tokens) {
        let depth = 0;
        tokens.forEach(t => {
            if (t.value === '[') depth++;
            if (t.value === ']') depth--;
            if (depth < 0) throw new Error(`Line ${t.line}: Found extra ']' without '['`);
        });
        if (depth > 0) throw new Error(`Missing ']' for a REPEAT loop! Check your brackets.`);
    }

    async execute(tokens, scopeVars = {}) {
        let i = 0;
        while (i < tokens.length) {
            let t = tokens[i];
            let cmd = t.value.toUpperCase();

            try {
                if (cmd === 'VAR') {
                    const nameToken = tokens[++i];
                    if (!nameToken) throw new Error(`Line ${t.line}: Missing name for VAR`);
                    const valToken = tokens[++i];
                    if (!valToken) throw new Error(`Line ${t.line}: Missing value for VAR ${nameToken.value}`);
                    const value = parseFloat(this.evaluate(valToken, scopeVars));
                    this.variables[nameToken.value] = value;
                }
                else if (cmd === 'DEF') {
                    const nameToken = tokens[++i];
                    if (!nameToken) throw new Error(`Line ${t.line}: Missing name for DEF`);
                    const name = nameToken.value.toUpperCase();
                    const body = [];
                    i++;
                    let depth = 1;
                    while (i < tokens.length && depth > 0) {
                        if (tokens[i].value.toUpperCase() === 'DEF') depth++;
                        if (tokens[i].value.toUpperCase() === 'END') depth--;
                        if (depth > 0) body.push(tokens[i]);
                        i++;
                    }
                    if (depth > 0) throw new Error(`Line ${t.line}: Function ${name} is missing 'END'`);
                    this.functions[name] = body;
                    i--;
                }
                else if (cmd === 'REPEAT') {
                    const countToken = tokens[++i];
                    if (!countToken) throw new Error(`Line ${t.line}: Missing count for REPEAT`);
                    const count = parseInt(this.evaluate(countToken, scopeVars));
                    if (isNaN(count)) throw new Error(`Line ${countToken.line}: REPEAT needs a number, but got "${countToken.value}"`);

                    const body = this.getBracketedContent(tokens, ++i);
                    i += body.length + 1; // Move past brackets
                    for (let r = 0; r < count; r++) {
                        await this.execute(body, scopeVars);
                    }
                }
                else if (cmd === 'FD' || cmd === 'FORWARD') {
                    const valToken = tokens[++i];
                    if (!valToken) throw new Error(`Line ${t.line}: Missing distance for FD`);
                    const val = parseFloat(this.evaluate(valToken, scopeVars));
                    if (isNaN(val)) throw new Error(`Line ${valToken.line}: FD needs a number, but got "${valToken.value}"`);
                    this.turtle.forward(val);
                }
                else if (cmd === 'BK' || cmd === 'BACK') {
                    const valToken = tokens[++i];
                    const val = parseFloat(this.evaluate(valToken, scopeVars));
                    this.turtle.forward(-val);
                }
                else if (cmd === 'RT' || cmd === 'RIGHT') {
                    const valToken = tokens[++i];
                    const val = parseFloat(this.evaluate(valToken, scopeVars));
                    this.turtle.right(val);
                }
                else if (cmd === 'LT' || cmd === 'LEFT') {
                    const valToken = tokens[++i];
                    const val = parseFloat(this.evaluate(valToken, scopeVars));
                    this.turtle.left(val);
                }
                else if (cmd === 'PU' || cmd === 'PENUP') this.turtle.setPen(false);
                else if (cmd === 'PD' || cmd === 'PENDOWN') this.turtle.setPen(true);
                else if (cmd === 'CS' || cmd === 'CLEARSCREEN') this.turtle.reset();
                else if (cmd === 'SETCOLOR') {
                    const colorToken = tokens[++i];
                    this.turtle.setColor(colorToken.value);
                }
                else if (this.functions[cmd]) {
                    await this.execute(this.functions[cmd], scopeVars);
                }
                else if (cmd !== 'END' && cmd !== '[' && cmd !== ']') {
                    throw new Error(`Line ${t.line}: I don't know the command "${t.value}"`);
                }
            } catch (err) {
                // Re-throw with line info if not already there
                if (!err.message.includes('Line')) {
                    throw new Error(`Line ${t.line}: ${err.message}`);
                }
                throw err;
            }

            i++;
            await new Promise(resolve => setTimeout(resolve, 5));
        }
    }

    evaluate(token, scopeVars) {
        if (!token) return 0;
        const val = token.value;
        if (val.startsWith(':')) {
            const name = val.substring(1);
            if (this.variables[name] === undefined) {
                throw new Error(`Line ${token.line}: Variable ":${name}" hasn't been created yet!`);
            }
            return this.variables[name];
        }
        if (this.variables[val] !== undefined) return this.variables[val];
        return val;
    }

    getBracketedContent(tokens, start) {
        const body = [];
        let depth = 0;
        let i = start;
        if (!tokens[i] || tokens[i].value !== '[') return [];

        i++;
        depth = 1;
        while (i < tokens.length && depth > 0) {
            if (tokens[i].value === '[') depth++;
            else if (tokens[i].value === ']') depth--;

            if (depth > 0) body.push(tokens[i]);
            i++;
        }
        return body;
    }
}

window.Interpreter = Interpreter;
