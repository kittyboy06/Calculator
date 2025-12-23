/* --- Tab Management --- */
class TabManager {
    constructor() {
        this.tabs = document.querySelectorAll('.nav-links li');
        this.contents = document.querySelectorAll('.tab-content');
        this.title = document.title;

        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                this.switchTab(target);
            });
        });
    }

    switchTab(tabId) {
        // Update nav
        this.tabs.forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Update content
        this.contents.forEach(c => c.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
    }
}

/* --- Standard & Scientific Calculator --- */
class Calculator {
    constructor() {
        this.currentDisplay = document.getElementById('calc-display');
        this.historyDisplay = document.getElementById('calc-history');
        this.expression = '';
        this.shouldResetScreen = false;

        this.initializeEvents();
    }

    initializeEvents() {
        document.querySelectorAll('#calculator .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const value = btn.dataset.value;

                if (value !== undefined) this.appendNumber(value);
                else if (action) this.handleAction(action);
            });
        });

        // Keyboard Support
        document.addEventListener('keydown', (e) => {
            if (!document.getElementById('calculator').classList.contains('active')) return;

            const key = e.key;
            if (/\d/.test(key) || key === '.') this.appendNumber(key);
            if (key === 'Enter') this.calculate();
            if (key === 'Backspace') this.delete();
            if (key === 'Escape') this.clear();
            if (['+', '-', '*', '/', '%'].includes(key)) this.appendOperator(key);
        });
    }

    appendNumber(number) {
        if (this.currentDisplay.textContent === '0' || this.shouldResetScreen) {
            this.currentDisplay.textContent = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentDisplay.textContent.includes('.')) return;

        this.currentDisplay.textContent += number;
    }

    appendOperator(op) {
        this.expression = this.currentDisplay.textContent + ' ' + op + ' ';
        this.historyDisplay.textContent = this.expression;
        this.shouldResetScreen = true;
    }

    handleAction(action) {
        if (['+', '-', '*', '/', '%'].includes(action)) {
            this.appendOperator(action);
            return;
        }

        switch (action) {
            case 'clear': this.clear(); break;
            case 'delete': this.delete(); break;
            case '=': this.calculate(); break;
            case 'pi': this.appendNumber(Math.PI.toFixed(8)); this.shouldResetScreen = true; break;
            case 'e': this.appendNumber(Math.E.toFixed(8)); this.shouldResetScreen = true; break;
            default: this.handleScientific(action);
        }
    }

    handleScientific(func) {
        let val = parseFloat(this.currentDisplay.textContent);
        let result;

        switch (func) {
            case 'sin': result = Math.sin(val * Math.PI / 180); break; // Degrees
            case 'cos': result = Math.cos(val * Math.PI / 180); break;
            case 'tan': result = Math.tan(val * Math.PI / 180); break;
            case 'log': result = Math.log10(val); break;
            case 'ln': result = Math.log(val); break;
            case 'sqrt': result = Math.sqrt(val); break;
            case 'pow':
                this.expression = val + ' ^ ';
                this.historyDisplay.textContent = this.expression;
                this.shouldResetScreen = true;
                return;
            default: return;
        }
        this.currentDisplay.textContent = parseFloat(result.toFixed(8));
        this.shouldResetScreen = true;
    }

    calculate() {
        // Handle Power special case
        if (this.historyDisplay.textContent.includes('^')) {
            const parts = this.historyDisplay.textContent.split(' ^ ');
            const base = parseFloat(parts[0]);
            const exponent = parseFloat(this.currentDisplay.textContent);
            const res = Math.pow(base, exponent);
            this.historyDisplay.textContent += exponent + ' =';
            this.currentDisplay.textContent = res;
            this.expression = '';
            this.shouldResetScreen = true;
            return;
        }

        try {
            // Very basic EVAL safety - in a real app write a parser
            // Append current number to expression
            let fullExp = this.expression || '';
            if (!this.shouldResetScreen) fullExp += this.currentDisplay.textContent;

            // Allow user to just press = to repeat op (not implemented simply here)

            // Replace visual operators
            let evalExp = fullExp.replace(/×/g, '*').replace(/÷/g, '/');

            const result = eval(evalExp); // Simple implementation
            this.historyDisplay.textContent = fullExp + ' =';
            this.currentDisplay.textContent = parseFloat(result.toFixed(8));
            this.expression = '';
            this.shouldResetScreen = true;
        } catch (e) {
            this.currentDisplay.textContent = "Error";
            this.shouldResetScreen = true;
        }
    }

    clear() {
        this.currentDisplay.textContent = '0';
        this.historyDisplay.textContent = '';
        this.expression = '';
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.shouldResetScreen) return;
        if (this.currentDisplay.textContent.length === 1) {
            this.currentDisplay.textContent = '0';
        } else {
            this.currentDisplay.textContent = this.currentDisplay.textContent.slice(0, -1);
        }
    }
}

/* --- Programmer Calculator --- */
class ProgrammerCalculator {
    constructor() {
        this.display = {
            hex: document.getElementById('hex-val'),
            dec: document.getElementById('dec-val'),
            oct: document.getElementById('oct-val'),
            bin: document.getElementById('bin-val'),
            mainBit: document.getElementById('prog-bin-display')
        };

        this.currentBase = 16;
        this.currentValue = BigInt(0); // Use BigInt for 64-bit support if needed, keeping simple for now

        this.init();
    }

    init() {
        // Base switching
        document.querySelectorAll('.base-row').forEach(row => {
            row.addEventListener('click', () => {
                document.querySelectorAll('.base-row').forEach(r => r.classList.remove('active'));
                row.classList.add('active');
                this.currentBase = parseInt(row.dataset.base);
                this.updateKeypadState();
            });
        });

        // Keypad Inputs
        document.querySelectorAll('.programmer-grid .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.dataset.value;
                const action = btn.dataset.action;

                if (val && !btn.classList.contains('disabled')) this.append(val);
                if (action) this.handleAction(action);
            });
        });
    }

    updateKeypadState() {
        const hexKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
        const decKeys = ['2', '3', '4', '5', '6', '7', '8', '9'];
        const octKeys = ['8', '9'];

        // Reset all
        document.querySelectorAll('.programmer-grid .btn').forEach(b => b.classList.remove('disabled'));

        // Disable based on mode
        if (this.currentBase === 10) {
            hexKeys.forEach(k => this.disableKey(k));
        } else if (this.currentBase === 8) {
            hexKeys.forEach(k => this.disableKey(k));
            octKeys.forEach(k => this.disableKey(k));
        } else if (this.currentBase === 2) {
            hexKeys.forEach(k => this.disableKey(k));
            decKeys.forEach(k => this.disableKey(k));
        }
    }

    disableKey(char) {
        // Finding buttons by text content is tricky with data attributes not strictly matching text
        // Assuming data-value matches
        const btn = document.querySelector(`.programmer-grid .btn[data-value="${char}"]`);
        if (btn) btn.classList.add('disabled');
    }

    append(char) {
        let valString = this.currentValue.toString(this.currentBase).toUpperCase();
        if (valString === '0') valString = '';

        valString += char;

        try {
            // Parse back to BigInt/Number
            this.currentValue = parseInt(valString, this.currentBase);
            if (isNaN(this.currentValue)) this.currentValue = 0;
            this.updateDisplay();
        } catch (e) { /* Overflow or error */ }
    }

    handleAction(action) {
        switch (action) {
            case 'clear':
                this.currentValue = 0;
                this.updateDisplay();
                break;
            case 'delete':
                let str = this.currentValue.toString(this.currentBase);
                str = str.slice(0, -1);
                this.currentValue = str.length === 0 ? 0 : parseInt(str, this.currentBase);
                this.updateDisplay();
                break;
            case 'NOT':
                this.currentValue = ~this.currentValue;
                this.updateDisplay();
                break;
            // Logic ops usually require two operands, simplifying here to immediate effect or TODO
            // For a full programmer calc, we need an expression stack like standard calc but with bitwise ops.
        }
    }

    updateDisplay() {
        const val = this.currentValue;
        this.display.hex.textContent = val.toString(16).toUpperCase();
        this.display.dec.textContent = val.toString(10);
        this.display.oct.textContent = val.toString(8);
        this.display.bin.textContent = val.toString(2);

        // Format binary groups of 4
        let binStr = val.toString(2).padStart(32, '0');
        this.display.mainBit.textContent = binStr.replace(/(.{4})/g, '$1 ').trim();
    }
}

/* --- Unit Converter --- */
const conversionRates = {
    length: {
        base: 'm',
        units: {
            'm': 1, 'cm': 0.01, 'mm': 0.001, 'km': 1000,
            'in': 0.0254, 'ft': 0.3048, 'yd': 0.9144, 'mi': 1609.34
        }
    },
    mass: {
        base: 'kg',
        units: {
            'kg': 1, 'g': 0.001, 'mg': 0.000001,
            'lb': 0.453592, 'oz': 0.0283495
        }
    },
    data: {
        base: 'MB',
        units: {
            'B': 0.000001, 'KB': 0.001, 'MB': 1, 'GB': 1024, 'TB': 1048576
        }
    },
    time: {
        base: 's',
        units: {
            's': 1, 'min': 60, 'h': 3600, 'd': 86400, 'ms': 0.001
        }
    },
    temperature: {
        // Special logic needed
        units: ['C', 'F', 'K']
    }
};

class UnitConverter {
    constructor() {
        this.categorySelect = document.getElementById('unit-category');
        this.fromValue = document.getElementById('convert-from-val');
        this.fromUnit = document.getElementById('convert-from-unit');
        this.toValue = document.getElementById('convert-to-val');
        this.toUnit = document.getElementById('convert-to-unit');

        this.init();
    }

    init() {
        this.categorySelect.addEventListener('change', () => this.loadUnits());
        this.fromValue.addEventListener('input', () => this.convert());
        this.fromUnit.addEventListener('change', () => this.convert());
        this.toUnit.addEventListener('change', () => this.convert());

        this.loadUnits(); // Initial load
    }

    loadUnits() {
        const cat = this.categorySelect.value;
        const data = conversionRates[cat];

        this.fromUnit.innerHTML = '';
        this.toUnit.innerHTML = '';

        let units = [];
        if (cat === 'temperature') units = data.units;
        else units = Object.keys(data.units);

        units.forEach(u => {
            const opt1 = document.createElement('option');
            opt1.value = u;
            opt1.textContent = u.toUpperCase();
            this.fromUnit.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = u;
            opt2.textContent = u.toUpperCase();
            this.toUnit.appendChild(opt2);
        });

        // Default selection
        if (units.length > 1) this.toUnit.selectedIndex = 1;
        this.convert();
    }

    convert() {
        const cat = this.categorySelect.value;
        const val = parseFloat(this.fromValue.value);
        const from = this.fromUnit.value;
        const to = this.toUnit.value;

        if (isNaN(val)) {
            this.toValue.value = '';
            return;
        }

        let result;

        if (cat === 'temperature') {
            result = this.convertTemp(val, from, to);
        } else {
            const rates = conversionRates[cat].units;
            // Convert to base then to target
            const baseVal = val * rates[from];
            result = baseVal / rates[to];
        }

        this.toValue.value = parseFloat(result.toFixed(6));
    }

    convertTemp(val, from, to) {
        let celsius;
        // To Celsius
        if (from === 'C') celsius = val;
        if (from === 'F') celsius = (val - 32) * 5 / 9;
        if (from === 'K') celsius = val - 273.15;

        // From Celsius
        if (to === 'C') return celsius;
        if (to === 'F') return (celsius * 9 / 5) + 32;
        if (to === 'K') return celsius + 273.15;
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    new TabManager();
    new Calculator();
    new ProgrammerCalculator();
    new UnitConverter();
    new LogicBoard();
});

/* --- Logic Board System --- */
class LogicBoard {
    constructor() {
        this.container = document.getElementById('logic-board-container');
        this.canvas = document.getElementById('logic-canvas');
        this.wireLayer = document.getElementById('wire-layer');
        this.gates = [];
        this.wires = [];
        this.draggedType = null;
        this.tempWire = null;
        this.wiringStartNode = null;
        this.isWiring = false;

        this.initUI();
        this.initDragDrop();
        this.initTouchSupport();
    }

    initUI() {
        // Toggle Board
        document.getElementById('open-board-btn').addEventListener('click', () => {
            this.container.classList.remove('hidden');
        });
        document.getElementById('close-board').addEventListener('click', () => {
            this.container.classList.add('hidden');
        });
        document.getElementById('clear-board').addEventListener('click', () => {
            this.clearBoard();
        });

        // Wiring cancellation on escape or click background
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.cancelWiring();
        });
        this.canvas.addEventListener('click', (e) => {
            if (e.target === this.canvas) this.cancelWiring();
        });
    }

    initDragDrop() {
        // Palette Draggables
        document.querySelectorAll('.palette-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                this.draggedType = item.dataset.type;
                e.dataTransfer.effectAllowed = "copy";
            });
        });

        // Canvas Drop Zone
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        });

        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedType) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.addGate(this.draggedType, x, y);
                this.draggedType = null;
            }
        });
    }

    addGate(type, x, y) {
        const id = Date.now() + Math.random().toString(36).substr(2, 5);
        const gate = new LogicGate(id, type, x, y, this);
        this.gates.push(gate);
        this.canvas.appendChild(gate.element);

        // Make draggable on board
        this.makeElementDraggable(gate);
    }

    makeElementDraggable(gate) {
        let isDragging = false;
        let startX, startY;

        // Mouse Drag
        gate.element.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('io-node') || this.isWiring) return;
            isDragging = true;
            startX = e.offsetX;
            startY = e.offsetY;
            gate.element.style.zIndex = 100;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const rect = this.canvas.getBoundingClientRect();
            let newX = e.clientX - rect.left - 40;
            let newY = e.clientY - rect.top - 30;

            gate.updatePosition(newX, newY);
            this.updateWiresForGate(gate);
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                gate.element.style.zIndex = '';
            }
        });

        // Touch Drag
        gate.element.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('io-node') || this.isWiring) return;
            e.preventDefault();
            isDragging = true;
            const touch = e.touches[0];
            const rect = gate.element.getBoundingClientRect();
            startX = touch.clientX - rect.left;
            startY = touch.clientY - rect.top;
            gate.element.style.zIndex = 100;
        });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            const canvasRect = this.canvas.getBoundingClientRect();
            let newX = touch.clientX - canvasRect.left - startX;
            let newY = touch.clientY - canvasRect.top - startY;

            gate.updatePosition(newX, newY);
            this.updateWiresForGate(gate);
        });

        window.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                gate.element.style.zIndex = '';
            }
        });
    }

    /* --- Wiring System --- */
    startWiring(node, gateId, type) {
        if (this.isWiring) {
            if (this.wiringStartNode !== node && this.wiringStartNode.dataset.type !== type) {
                this.completeWiring(node, gateId, type);
            } else {
                this.cancelWiring();
            }
            return;
        }

        this.isWiring = true;
        this.wiringStartNode = node;
        this.wiringStartGateId = gateId;
        this.wiringStartType = type;

        this.tempWire = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.tempWire.setAttribute('class', 'wire dragging');
        this.wireLayer.appendChild(this.tempWire);

        this.mouseMoveHandler = (e) => this.updateTempWire(e);
        this.touchMoveHandler = (e) => this.updateTempWireTouch(e);

        window.addEventListener('mousemove', this.mouseMoveHandler);
        window.addEventListener('touchmove', this.touchMoveHandler, { passive: false });

        this.touchEndHandler = (e) => this.completeWiringTouch(e);
        window.addEventListener('touchend', this.touchEndHandler);
    }

    updateTempWire(e) {
        if (!this.tempWire) return;
        const rect = this.canvas.getBoundingClientRect();
        const startRect = this.wiringStartNode.getBoundingClientRect();

        const x1 = startRect.left + startRect.width / 2 - rect.left;
        const y1 = startRect.top + startRect.height / 2 - rect.top;
        const x2 = e.clientX - rect.left;
        const y2 = e.clientY - rect.top;

        const path = `M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`;
        this.tempWire.setAttribute('d', path);
    }

    updateTempWireTouch(e) {
        e.preventDefault();
        if (!this.tempWire) return;
        const rect = this.canvas.getBoundingClientRect();
        const startRect = this.wiringStartNode.getBoundingClientRect();
        const touch = e.touches[0];

        const x1 = startRect.left + startRect.width / 2 - rect.left;
        const y1 = startRect.top + startRect.height / 2 - rect.top;
        const x2 = touch.clientX - rect.left;
        const y2 = touch.clientY - rect.top;

        const path = `M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`;
        this.tempWire.setAttribute('d', path);
    }

    completeWiringTouch(e) {
        if (!this.isWiring) return;
        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);

        if (target && target.classList.contains('io-node')) {
            const gateObj = this.gates.find(g => g.element.contains(target));
            if (gateObj) {
                let type = 'output';
                if (target.classList.contains('input-1')) type = 'input-1';
                else if (target.classList.contains('input-2')) type = 'input-2';
                else if (target.classList.contains('input')) type = 'input';
                else if (target.classList.contains('output')) type = 'output';

                this.completeWiring(target, gateObj.id, type);
                return;
            }
        }
        this.cancelWiring();
    }

    completeWiring(endNode, endGateId, endType) {
        let outNode, inNode, outGateId, inGateId;
        let inputIndex = 0;

        if (this.wiringStartType === 'output' && endType.includes('input')) {
            outNode = this.wiringStartNode;
            outGateId = this.wiringStartGateId;
            inNode = endNode;
            inGateId = endGateId;
            inputIndex = endType === 'input-1' ? 0 : (endType === 'input-2' ? 1 : 0);
        } else if (this.wiringStartType.includes('input') && endType === 'output') {
            inNode = this.wiringStartNode;
            inGateId = this.wiringStartGateId;
            outNode = endNode;
            outGateId = endGateId;
            inputIndex = this.wiringStartType === 'input-1' ? 0 : (this.wiringStartType === 'input-2' ? 1 : 0);
        } else {
            this.cancelWiring();
            return;
        }

        const wire = {
            id: Date.now(),
            fromGate: outGateId,
            toGate: inGateId,
            toInputIndex: inputIndex,
            element: this.tempWire
        };

        this.tempWire.classList.remove('dragging');
        this.tempWire.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.removeWire(wire.id);
        });

        this.wires.push(wire);

        const sourceGate = this.gates.find(g => g.id === outGateId);
        const targetGate = this.gates.find(g => g.id === inGateId);

        if (targetGate) targetGate.inputs[inputIndex] = sourceGate;

        this.updateWireVisual(wire);
        this.cleanupWiringEvents();
        this.runSimulation();
    }

    removeWire(wireId) {
        const index = this.wires.findIndex(w => w.id === wireId);
        if (index === -1) return;

        const wire = this.wires[index];
        const targetGate = this.gates.find(g => g.id === wire.toGate);

        if (targetGate) {
            targetGate.inputs[wire.toInputIndex] = null;
        }

        if (wire.element) wire.element.remove();
        this.wires.splice(index, 1);
        this.runSimulation();
    }

    removeGate(gateId) {
        const index = this.gates.findIndex(g => g.id === gateId);
        if (index === -1) return;

        const gate = this.gates[index];
        const wiresToRemove = this.wires.filter(w => w.fromGate === gateId || w.toGate === gateId);
        wiresToRemove.forEach(w => this.removeWire(w.id));

        if (gate.element) gate.element.remove();
        this.gates.splice(index, 1);
        this.runSimulation();
    }

    generateTotalExpression() {
        const light = this.gates.find(g => g.type === 'LIGHT');
        if (!light) return 'No Output';
        const finalWire = this.wires.find(w => w.toGate === light.id);
        if (!finalWire) return 'Light OFF';
        const sourceGate = this.gates.find(g => g.id === finalWire.fromGate);
        if (!sourceGate) return 'Light OFF';
        return sourceGate.getExpression();
    }

    updateExpressionDisplay() {
        const display = document.getElementById('expression-display');
        if (!display) return;
        const lights = this.gates.filter(g => g.type === 'LIGHT');
        if (lights.length === 0) {
            display.innerText = 'Expression: No Output';
            return;
        }
        const exprs = lights.map((light, i) => {
            const finalWire = this.wires.find(w => w.toGate === light.id);
            if (!finalWire) return `L${i + 1}: OFF`;
            const sourceGate = this.gates.find(g => g.id === finalWire.fromGate);
            if (!sourceGate) return `L${i + 1}: OFF`;
            return `L${i + 1} = ${sourceGate.getExpression()}`;
        });
        display.innerText = exprs.join(' | ');
    }

    runSimulation() {
        let changed = true;
        let limit = 0;
        while (changed && limit < 50) {
            changed = false;
            this.gates.forEach(gate => {
                const oldState = gate.outputState;
                gate.evaluate();
                if (gate.outputState !== oldState) changed = true;
            });
            limit++;
        }
        this.wires.forEach(w => this.updateWireVisual(w));
        this.updateExpressionDisplay();
    }

    cancelWiring() {
        if (this.tempWire) this.tempWire.remove();
        this.cleanupWiringEvents();
    }

    cleanupWiringEvents() {
        this.isWiring = false;
        this.tempWire = null;
        this.wiringStartNode = null;
        window.removeEventListener('mousemove', this.mouseMoveHandler);
        if (this.touchMoveHandler) window.removeEventListener('touchmove', this.touchMoveHandler);
        if (this.touchEndHandler) window.removeEventListener('touchend', this.touchEndHandler);
    }

    updateWireVisual(wire) {
        if (!wire.element) return;
        const sourceGate = this.gates.find(g => g.id === wire.fromGate);
        const targetGate = this.gates.find(g => g.id === wire.toGate);

        if (!sourceGate || !targetGate) {
            wire.element.remove();
            return;
        }

        const outPos = sourceGate.getOutputPos();
        const inPos = targetGate.getInputPos(wire.toInputIndex);

        const x1 = outPos.x;
        const y1 = outPos.y;
        const x2 = inPos.x;
        const y2 = inPos.y;

        const path = `M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`;
        wire.element.setAttribute('d', path);

        if (sourceGate.outputState) wire.element.classList.add('active');
        else wire.element.classList.remove('active');
    }

    updateWiresForGate(gate) {
        const connectedWires = this.wires.filter(w => w.fromGate === gate.id || w.toGate === gate.id);
        connectedWires.forEach(w => this.updateWireVisual(w));
    }

    clearBoard() {
        this.gates = [];
        this.wires = [];
        this.canvas.innerHTML = '<svg id="wire-layer"></svg>';
        this.wireLayer = document.getElementById('wire-layer');
    }
}

class LogicGate {
    constructor(id, type, x, y, board) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.board = board;
        this.element = null;

        this.inputs = [null, null]; // Connected gates or null (0 = falsy)
        this.outputState = false;

        this.render();
    }

    render() {
        const el = document.createElement('div');
        el.className = `gate-component ${this.type.toLowerCase()}`;
        el.style.left = `${this.x}px`;
        el.style.top = `${this.y}px`;
        // text/symbol
        el.innerHTML = `<span>${this.getSymbol()}</span>`;

        // Create IO Nodes
        this.createNodes(el);

        this.element = el;

        if (this.type === 'SWITCH') {
            el.addEventListener('click', (e) => {
                if (e.target.classList.contains('io-node')) return;
                this.outputState = !this.outputState;
                el.classList.toggle('on', this.outputState);
                this.board.runSimulation();
            });
        }

        // Right-click to remove gate
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.board.removeGate(this.id);
        });
    }

    getSymbol() {
        switch (this.type) {
            case 'AND': return '&';
            case 'OR': return '≥1';
            case 'NOT': return '1';
            case 'XOR': return '=1';
            case 'SWITCH': return '⏻';
            case 'LIGHT': return '☀';
            default: return '?';
        }
    }

    createNodes(parent) {
        // Inputs
        if (this.type !== 'SWITCH') {
            if (this.type === 'NOT') {
                this.addNode(parent, 'input-center input');
            } else if (this.type === 'LIGHT') {
                this.addNode(parent, 'input-center input');
            } else {
                this.addNode(parent, 'input-1 input');
                this.addNode(parent, 'input-2 input');
            }
        }

        // Outputs
        if (this.type !== 'LIGHT') {
            this.addNode(parent, 'output');
        }
    }

    addNode(parent, className) {
        const node = document.createElement('div');
        node.className = `io-node ${className}`;
        node.dataset.type = className;
        const type = className.split(' ')[0];

        node.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.board.startWiring(node, this.id, type);
        });

        node.addEventListener('mouseup', (e) => {
            e.stopPropagation();
            if (this.board.isWiring && this.board.wiringStartNode !== node) {
                this.board.startWiring(node, this.id, type);
            }
        });

        parent.appendChild(node);
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    getOutputPos() {
        const rect = this.element.getBoundingClientRect();
        const canvasRect = this.board.canvas.getBoundingClientRect();
        return {
            x: (rect.left - canvasRect.left) + rect.width, // Right edge
            y: (rect.top - canvasRect.top) + (rect.height / 2)
        };
    }

    getInputPos(index) { // 0 or 1
        const rect = this.element.getBoundingClientRect();
        const canvasRect = this.board.canvas.getBoundingClientRect();

        if (this.type === 'NOT' || this.type === 'LIGHT') {
            return {
                x: (rect.left - canvasRect.left),
                y: (rect.top - canvasRect.top) + (rect.height / 2)
            };
        }

        const yOffset = index === 0 ? 15 + 6 : (rect.height - 15 - 6);
        return {
            x: (rect.left - canvasRect.left),
            y: (rect.top - canvasRect.top) + yOffset
        };
    }

    evaluate() {
        if (this.type === 'SWITCH') return;

        const v1 = this.inputs[0] ? this.inputs[0].outputState : false;
        const v2 = this.inputs[1] ? this.inputs[1].outputState : false;

        let res = false;
        switch (this.type) {
            case 'AND': res = v1 && v2; break;
            case 'OR': res = v1 || v2; break;
            case 'NOT': res = !v1; break;
            case 'XOR': res = (v1 ? !v2 : v2); break;
            case 'LIGHT': res = v1; break;
        }

        this.outputState = res;

        if (this.type === 'LIGHT') {
            this.element.classList.toggle('on', this.outputState);
        }
    }

    getExpression(visited = []) {
        if (visited.includes(this.id)) return '...'; // Cycle detected

        if (this.type === 'SWITCH') return `SW${this.id.substr(-2)}`; // Short ID

        const newVisited = [...visited, this.id];

        const i1 = this.inputs[0] ? this.inputs[0].getExpression(newVisited) : '0';
        const i2 = this.inputs[1] ? this.inputs[1].getExpression(newVisited) : '0';

        switch (this.type) {
            case 'AND': return `(${i1} & ${i2})`;
            case 'OR': return `(${i1} | ${i2})`;
            case 'NOT': return `!(${i1})`;
            case 'XOR': return `(${i1} ^ ${i2})`;
            case 'LIGHT': return i1;
            default: return '?';
        }
    }
}
