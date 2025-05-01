class Calculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.isInRadians = true;

        // Initialize display elements
        this.previousOperandElement = document.querySelector('.previous-operand');
        this.currentOperandElement = document.querySelector('.current-operand');

        // Initialize tab elements
        this.tabs = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');

        // Initialize theme toggle
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = this.themeToggle.querySelector('i');

        // Initialize conversion elements
        this.conversionType = document.getElementById('conversionType');
        this.fromValue = document.getElementById('fromValue');
        this.toValue = document.getElementById('toValue');
        this.fromUnit = document.getElementById('fromUnit');
        this.toUnit = document.getElementById('toUnit');
        this.swapBtn = document.querySelector('.swap-btn');

        this.setupEventListeners();
        this.setupConversionUnits();
    }

    setupEventListeners() {
        // Number buttons
        document.querySelectorAll('.number').forEach(button => {
            button.addEventListener('click', () => this.appendNumber(button.innerText));
        });

        // Operator buttons
        document.querySelectorAll('.operator').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.getAttribute('data-action');
                this.handleOperation(action);
            });
        });

        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Conversion events
        this.conversionType.addEventListener('change', () => this.setupConversionUnits());
        this.fromValue.addEventListener('input', () => this.convert());
        this.fromUnit.addEventListener('change', () => this.convert());
        this.toUnit.addEventListener('change', () => this.convert());
        this.swapBtn.addEventListener('click', () => this.swapUnits());
    }

    switchTab(selectedTab) {
        const targetId = selectedTab.getAttribute('data-tab');
        const targetContent = document.getElementById(targetId);
        const currentContent = document.querySelector('.tab-content.active');

        if (currentContent === targetContent) return;

        // Remove active class from all tabs
        this.tabs.forEach(tab => tab.classList.remove('active'));
        selectedTab.classList.add('active');

        // Determine slide direction
        const currentIndex = Array.from(this.tabContents).indexOf(currentContent);
        const targetIndex = Array.from(this.tabContents).indexOf(targetContent);
        const slideDirection = currentIndex < targetIndex ? 'right' : 'left';

        // Set initial positions
        currentContent.classList.add(`slide-${slideDirection === 'right' ? 'left' : 'right'}`);
        targetContent.classList.add(`slide-${slideDirection}`);

        // Trigger reflow
        void targetContent.offsetWidth;

        // Start transition
        targetContent.classList.add('active');
        currentContent.classList.remove('active');

        // Clean up after transition
        const onTransitionEnd = () => {
            this.tabContents.forEach(content => {
                content.classList.remove('slide-left', 'slide-right');
            });
            targetContent.removeEventListener('transitionend', onTransitionEnd);
        };

        targetContent.addEventListener('transitionend', onTransitionEnd);
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        this.themeIcon.classList.toggle('fa-moon');
        this.themeIcon.classList.toggle('fa-sun');
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
        this.updateDisplay();
    }

    handleOperation(action) {
        try {
            switch (action) {
                case 'clear':
                    this.clear();
                    break;
                case 'delete':
                    this.delete();
                    break;
                case 'calculate':
                    this.calculate();
                    break;
                case 'percent':
                    this.percent();
                    break;
                case 'sin':
                case 'cos':
                case 'tan':
                    this.trigonometry(action);
                    break;
                case 'log':
                case 'ln':
                    this.logarithm(action);
                    break;
                case 'sqrt':
                    this.sqrt();
                    break;
                case 'power':
                    this.power();
                    break;
                case 'factorial':
                    this.factorial();
                    break;
                case 'pi':
                    this.appendConstant(Math.PI);
                    break;
                case 'e':
                    this.appendConstant(Math.E);
                    break;
                case 'rad':
                case 'deg':
                    this.toggleAngleUnit(action);
                    break;
                default:
                    this.setOperation(action);
            }
        } catch (error) {
            this.handleError(error.message);
        }
    }

    handleError(message) {
        this.currentOperand = message;
        this.updateDisplay();
        setTimeout(() => this.clear(), 2000);
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    delete() {
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        this.updateDisplay();
    }

    setOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.calculate();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.updateDisplay();
    }

    calculate() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) {
            throw new Error('Invalid input');
        }

        switch (this.operation) {
            case 'add':
                computation = prev + current;
                break;
            case 'subtract':
                computation = prev - current;
                break;
            case 'multiply':
                computation = prev * current;
                break;
            case 'divide':
                if (current === 0) throw new Error('Cannot divide by zero');
                computation = prev / current;
                break;
            default:
                return;
        }

        if (!isFinite(computation)) {
            throw new Error('Result is too large');
        }

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.updateDisplay();
    }

    percent() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) {
            throw new Error('Invalid input');
        }
        this.currentOperand = (current / 100).toString();
        this.updateDisplay();
    }

    trigonometry(action) {
        const number = parseFloat(this.currentOperand);
        if (isNaN(number)) {
            throw new Error('Invalid input');
        }

        const angle = this.isInRadians ? number : (number * Math.PI / 180);
        let result;

        switch (action) {
            case 'sin':
                result = Math.sin(angle);
                break;
            case 'cos':
                result = Math.cos(angle);
                break;
            case 'tan':
                if (Math.abs(Math.cos(angle)) < 1e-10) {
                    throw new Error('Undefined');
                }
                result = Math.tan(angle);
                break;
        }

        this.currentOperand = result.toString();
        this.updateDisplay();
    }

    logarithm(action) {
        const number = parseFloat(this.currentOperand);
        if (isNaN(number) || number <= 0) {
            throw new Error('Invalid input');
        }

        this.currentOperand = (action === 'log' ? Math.log10(number) : Math.log(number)).toString();
        this.updateDisplay();
    }

    sqrt() {
        const number = parseFloat(this.currentOperand);
        if (isNaN(number) || number < 0) {
            throw new Error('Invalid input');
        }

        this.currentOperand = Math.sqrt(number).toString();
        this.updateDisplay();
    }

    power() {
        if (this.currentOperand === '') {
            throw new Error('Invalid input');
        }
        this.setOperation('power');
    }

    factorial() {
        const number = parseInt(this.currentOperand);
        if (isNaN(number) || number < 0 || number > 170) {
            throw new Error('Invalid input');
        }

        let result = 1;
        for (let i = 2; i <= number; i++) result *= i;
        this.currentOperand = result.toString();
        this.updateDisplay();
    }

    appendConstant(constant) {
        this.currentOperand = constant.toString();
        this.updateDisplay();
    }

    toggleAngleUnit(unit) {
        this.isInRadians = unit === 'rad';
    }

    updateDisplay() {
        this.currentOperandElement.innerText = this.currentOperand;
        if (this.operation != null) {
            const operationSymbols = {
                'add': '+',
                'subtract': '-',
                'multiply': '×',
                'divide': '÷',
                'power': '^'
            };
            this.previousOperandElement.innerText =
                `${this.previousOperand} ${operationSymbols[this.operation]}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }

    setupConversionUnits() {
        const units = {
            length: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
            weight: ['mg', 'g', 'kg', 'oz', 'lb', 't'],
            temperature: ['°C', '°F', 'K']
        };

        const selectedType = this.conversionType.value;
        this.fromUnit.innerHTML = '';
        this.toUnit.innerHTML = '';

        units[selectedType].forEach(unit => {
            this.fromUnit.add(new Option(unit, unit));
            this.toUnit.add(new Option(unit, unit));
        });

        this.convert();
    }

    convert() {
        try {
            const value = parseFloat(this.fromValue.value);
            if (isNaN(value)) {
                this.toValue.value = '';
                return;
            }

            const fromUnit = this.fromUnit.value;
            const toUnit = this.toUnit.value;
            const type = this.conversionType.value;

            let result;

            if (type === 'temperature') {
                result = this.convertTemperature(value, fromUnit, toUnit);
            } else {
                const baseValue = this.convertToBase(value, fromUnit, type);
                result = this.convertFromBase(baseValue, toUnit, type);
            }

            this.toValue.value = result.toFixed(4);
        } catch (error) {
            this.toValue.value = 'Error';
        }
    }

    convertTemperature(value, fromUnit, toUnit) {
        let celsius;

        // Convert to Celsius first
        switch (fromUnit) {
            case '°C': celsius = value; break;
            case '°F': celsius = (value - 32) * 5 / 9; break;
            case 'K': celsius = value - 273.15; break;
            default: throw new Error('Invalid unit');
        }

        // Convert from Celsius to target unit
        switch (toUnit) {
            case '°C': return celsius;
            case '°F': return celsius * 9 / 5 + 32;
            case 'K': return celsius + 273.15;
            default: throw new Error('Invalid unit');
        }
    }

    convertToBase(value, unit, type) {
        const conversions = {
            length: {
                mm: 0.001,
                cm: 0.01,
                m: 1,
                km: 1000,
                in: 0.0254,
                ft: 0.3048,
                yd: 0.9144,
                mi: 1609.344
            },
            weight: {
                mg: 0.000001,
                g: 0.001,
                kg: 1,
                oz: 0.028349523125,
                lb: 0.45359237,
                t: 1000
            }
        };

        if (!conversions[type] || !conversions[type][unit]) {
            throw new Error('Invalid unit');
        }

        return value * conversions[type][unit];
    }

    convertFromBase(value, unit, type) {
        const conversions = {
            length: {
                mm: 1000,
                cm: 100,
                m: 1,
                km: 0.001,
                in: 39.3701,
                ft: 3.28084,
                yd: 1.09361,
                mi: 0.000621371
            },
            weight: {
                mg: 1000000,
                g: 1000,
                kg: 1,
                oz: 35.274,
                lb: 2.20462,
                t: 0.001
            }
        };

        if (!conversions[type] || !conversions[type][unit]) {
            throw new Error('Invalid unit');
        }

        return value * conversions[type][unit];
    }

    swapUnits() {
        const tempUnit = this.fromUnit.value;
        this.fromUnit.value = this.toUnit.value;
        this.toUnit.value = tempUnit;

        const tempValue = this.fromValue.value;
        this.fromValue.value = this.toValue.value;
        this.toValue.value = tempValue;

        this.convert();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});