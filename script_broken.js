// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    // Handle navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // Initialize interactive truth table generator
    initializeInteractiveGenerator();
    
    // Initialize practice problems
    initializePracticeProblems();
});

// Interactive Truth Table Generator
function initializeInteractiveGenerator() {
    const prop1Select = document.getElementById('prop1');
    const prop2Select = document.getElementById('prop2');
    const operatorSelect = document.getElementById('operator');
    const negate1Checkbox = document.getElementById('negate1');
    const negate2Checkbox = document.getElementById('negate2');
    const generateButton = document.getElementById('generateTable');
    const expressionDisplay = document.getElementById('expressionDisplay');
    const generatedTableContainer = document.getElementById('generatedTable');
    
    // Update expression display
    function updateExpression() {
        const prop1 = prop1Select.value;
        const prop2 = prop2Select.value;
        const operator = getOperatorSymbol(operatorSelect.value);
        const neg1 = negate1Checkbox.checked ? '¬' : '';
        const neg2 = negate2Checkbox.checked ? '¬' : '';
        
        expressionDisplay.textContent = `${neg1}${prop1} ${operator} ${neg2}${prop2}`;
    }
    
    // Get operator symbol
    function getOperatorSymbol(operator) {
        const symbols = {
            'and': '∧',
            'or': '∨',
            'xor': '⊕',
            'implies': '→'
        };
        return symbols[operator] || '∧';
    }
    
    // Generate truth table
    function generateTruthTable() {
        const mode = document.querySelector('input[name="mode"]:checked').value;
        let expression = '';
        
        if (mode === 'simple') {
            const prop1 = document.getElementById('prop1').value;
            const operator = document.getElementById('operator').value;
            const prop2 = document.getElementById('prop2').value;
            const negate1 = document.getElementById('negate1').checked;
            const negate2 = document.getElementById('negate2').checked;
            
            const operatorSymbols = {
                'and': '∧',
                'or': '∨',
                'xor': '⊕',
                'implies': '→',
                'iff': '↔'
            };
            
            const leftSide = negate1 ? `¬${prop1}` : prop1;
            const rightSide = negate2 ? `¬${prop2}` : prop2;
            expression = `${leftSide} ${operatorSymbols[operator]} ${rightSide}`;
            
        } else {
            expression = document.getElementById('customExpression').value.trim();
            if (!expression) {
                document.getElementById('generatedTable').innerHTML = '<p>Please enter an expression</p>';
                return;
            }
        }
        
        document.getElementById('expressionDisplay').textContent = expression;
        
        if (mode === 'complex') {
            const tableHtml = generateComplexTruthTable(expression);
            document.getElementById('generatedTable').innerHTML = tableHtml;
        } else {
            // Use existing simple generation logic
            generateSimpleTruthTable(expression);
        }
    }
    
    // Generate simple truth table (for simple expressions)
    function generateSimpleTruthTable(expression) {
        const prop1 = document.getElementById('prop1').value;
        const operator = document.getElementById('operator').value;
        const prop2 = document.getElementById('prop2').value;
        const negate1 = document.getElementById('negate1').checked;
        const negate2 = document.getElementById('negate2').checked;
        
        let html = '<table class="truth-table"><thead><tr>';
        html += `<th>${prop1}</th><th>${prop2}</th><th>${expression}</th></tr></thead><tbody>`;
        
        const values = [
            [true, true],
            [true, false],
            [false, true],
            [false, false]
        ];
        
        values.forEach(([val1, val2]) => {
            const actualVal1 = negate1 ? !val1 : val1;
            const actualVal2 = negate2 ? !val2 : val2;
            const result = evaluateOperation(actualVal1, actualVal2, operator);
            
            html += '<tr>';
            html += `<td class="${val1 ? 'true' : 'false'}">${val1 ? 'T' : 'F'}</td>`;
            html += `<td class="${val2 ? 'true' : 'false'}">${val2 ? 'T' : 'F'}</td>`;
            html += `<td class="${result ? 'true' : 'false'}">${result ? 'T' : 'F'}</td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        document.getElementById('generatedTable').innerHTML = html;
    }
    
    // Evaluate logical operation
    function evaluateOperation(val1, val2, operator) {
        switch (operator) {
            case 'and':
                return val1 && val2;
            case 'or':
                return val1 || val2;
            case 'xor':
                return val1 !== val2;
            case 'implies':
                return !val1 || val2;
            case 'iff':
                return val1 === val2;
            default:
                return val1 && val2;
        }
        }
    }
    
    // Event listeners
    [prop1Select, prop2Select, operatorSelect, negate1Checkbox, negate2Checkbox].forEach(element => {
        element.addEventListener('change', updateExpression);
    });
    
    generateButton.addEventListener('click', generateTruthTable);
    
    // Initialize
    updateExpression();
    generateTruthTable();
}

// Complex expression parser
class ExpressionParser {
    constructor(expression) {
        this.expression = expression.replace(/\s+/g, ''); // Remove spaces
        this.position = 0;
    }

    parse() {
        const result = this.parseExpression();
        if (this.position < this.expression.length) {
            throw new Error('Unexpected character at position ' + this.position);
        }
        return result;
    }

    parseExpression() {
        return this.parseIff();
    }

    parseIff() {
        let left = this.parseImplies();
        
        while (this.match('↔')) {
            const right = this.parseImplies();
            left = {
                type: 'iff',
                left: left,
                right: right
            };
        }
        return left;
    }

    parseImplies() {
        let left = this.parseOr();
        
        while (this.match('→')) {
            const right = this.parseOr();
            left = {
                type: 'implies',
                left: left,
                right: right
            };
        }
        return left;
    }

    parseOr() {
        let left = this.parseXor();
        
        while (this.match('∨')) {
            const right = this.parseXor();
            left = {
                type: 'or',
                left: left,
                right: right
            };
        }
        return left;
    }

    parseXor() {
        let left = this.parseAnd();
        
        while (this.match('⊕')) {
            const right = this.parseAnd();
            left = {
                type: 'xor',
                left: left,
                right: right
            };
        }
        return left;
    }

    parseAnd() {
        let left = this.parseNot();
        
        while (this.match('∧')) {
            const right = this.parseNot();
            left = {
                type: 'and',
                left: left,
                right: right
            };
        }
        return left;
    }

    parseNot() {
        if (this.match('¬')) {
            return {
                type: 'not',
                operand: this.parseNot()
            };
        }
        return this.parsePrimary();
    }

    parsePrimary() {
        if (this.match('(')) {
            const expr = this.parseExpression();
            if (!this.match(')')) {
                throw new Error('Expected closing parenthesis');
            }
            return expr;
        }

        if (/[PQR]/.test(this.peek())) {
            return {
                type: 'variable',
                name: this.advance()
            };
        }

        throw new Error('Unexpected character: ' + this.peek());
    }

    match(expected) {
        if (this.peek() === expected) {
            this.advance();
            return true;
        }
        return false;
    }

    peek() {
        return this.position < this.expression.length ? this.expression[this.position] : '';
    }

    advance() {
        return this.position < this.expression.length ? this.expression[this.position++] : '';
    }
}

// Evaluate parsed expression
function evaluateExpression(ast, values) {
    switch (ast.type) {
        case 'variable':
            return values[ast.name];
        case 'not':
            return !evaluateExpression(ast.operand, values);
        case 'and':
            return evaluateExpression(ast.left, values) && evaluateExpression(ast.right, values);
        case 'or':
            return evaluateExpression(ast.left, values) || evaluateExpression(ast.right, values);
        case 'xor':
            return evaluateExpression(ast.left, values) !== evaluateExpression(ast.right, values);
        case 'implies':
            return !evaluateExpression(ast.left, values) || evaluateExpression(ast.right, values);
        case 'iff':
            return evaluateExpression(ast.left, values) === evaluateExpression(ast.right, values);
        default:
            throw new Error('Unknown AST node type: ' + ast.type);
    }
}

// Get variables from expression
function getVariables(ast) {
    const variables = new Set();
    
    function traverse(node) {
        if (node.type === 'variable') {
            variables.add(node.name);
        } else if (node.left) {
            traverse(node.left);
        }
        if (node.right) {
            traverse(node.right);
        }
        if (node.operand) {
            traverse(node.operand);
        }
    }
    
    traverse(ast);
    return Array.from(variables).sort();
}

// Generate truth table for complex expressions
function generateComplexTruthTable(expression) {
    try {
        const parser = new ExpressionParser(expression);
        const ast = parser.parse();
        const variables = getVariables(ast);
        const numRows = Math.pow(2, variables.length);
        
        let html = '<table class="truth-table"><thead><tr>';
        
        // Headers for variables
        variables.forEach(v => {
            html += `<th>${v}</th>`;
        });
        html += `<th>${expression}</th></tr></thead><tbody>`;
        
        // Generate all possible combinations
        for (let i = 0; i < numRows; i++) {
            html += '<tr>';
            const values = {};
            
            // Set variable values
            for (let j = 0; j < variables.length; j++) {
                const value = Boolean(i & (1 << (variables.length - 1 - j)));
                values[variables[j]] = value;
                const cellClass = value ? 'true' : 'false';
                html += `<td class="${cellClass}">${value ? 'T' : 'F'}</td>`;
            }
            
            // Calculate result
            const result = evaluateExpression(ast, values);
            const resultClass = result ? 'true' : 'false';
            html += `<td class="${resultClass}">${result ? 'T' : 'F'}</td>`;
            html += '</tr>';
        }
        
        html += '</tbody></table>';
        return html;
        
    } catch (error) {
        return `<div class="error">Error parsing expression: ${error.message}</div>`;
    }
}

// Practice Problems Functionality
function initializePracticeProblems() {
    // Problem 1: Truth table completion
    initializeProblem1();
    
    // Problem 2: Multiple choice
    initializeProblem2();
    
    // Problem 3: Step-by-step evaluation
    initializeProblem3();
    
    // Show solution buttons
    document.querySelectorAll('.show-solution').forEach(button => {
        button.addEventListener('click', function() {
            const problemId = this.dataset.problem;
            const solution = document.getElementById(`solution-${problemId}`);
            solution.classList.toggle('hidden');
            this.textContent = solution.classList.contains('hidden') ? 'Show Solution' : 'Hide Solution';
        });
    });
}

function initializeProblem1() {
    const checkButton = document.querySelector('[data-problem="1"].check-answer');
    const feedback = document.getElementById('feedback-1');
    
    checkButton.addEventListener('click', function() {
        const selects = document.querySelectorAll('[data-problem="1"] .answer-select');
        let allCorrect = true;
        let answeredAll = true;
        
        selects.forEach(select => {
            const userAnswer = select.value;
            const correctAnswer = select.dataset.correct;
            
            if (!userAnswer) {
                answeredAll = false;
                select.classList.remove('correct', 'incorrect');
            } else if (userAnswer === correctAnswer) {
                select.classList.add('correct');
                select.classList.remove('incorrect');
            } else {
                select.classList.add('incorrect');
                select.classList.remove('correct');
                allCorrect = false;
            }
        });
        
        if (!answeredAll) {
            showFeedback(feedback, 'Please complete all fields before checking.', 'error');
        } else if (allCorrect) {
            showFeedback(feedback, 'Excellent! All answers are correct. You understand negation and disjunction well!', 'success');
        } else {
            showFeedback(feedback, 'Some answers are incorrect. Remember: ¬P flips the truth value, and ∨ is true when at least one operand is true.', 'error');
        }
    });
}

function initializeProblem2() {
    const checkButton = document.querySelector('[data-problem="2"].check-answer');
    const feedback = document.getElementById('feedback-2');
    
    checkButton.addEventListener('click', function() {
        const selectedOption = document.querySelector('input[name="q2"]:checked');
        
        if (!selectedOption) {
            showFeedback(feedback, 'Please select an answer before checking.', 'error');
            return;
        }
        
        const labels = document.querySelectorAll('.choice-label');
        labels.forEach(label => {
            label.classList.remove('correct', 'incorrect');
            const input = label.querySelector('input');
            if (input.checked) {
                if (input.dataset.correct) {
                    label.classList.add('correct');
                    showFeedback(feedback, 'Correct! XOR (exclusive OR) is true when exactly one operand is true, but not both.', 'success');
                } else {
                    label.classList.add('incorrect');
                    showFeedback(feedback, 'Incorrect. XOR is true only when exactly one operand is true. Review the XOR truth table.', 'error');
                }
            }
        });
    });
}

function initializeProblem3() {
    const checkButton = document.querySelector('[data-problem="3"].check-answer');
    const feedback = document.getElementById('feedback-3');
    
    checkButton.addEventListener('click', function() {
        const stepAnswers = document.querySelectorAll('[data-problem="3"] .step-answer');
        let allCorrect = true;
        let answeredAll = true;
        
        stepAnswers.forEach(select => {
            const userAnswer = select.value;
            const correctAnswer = select.dataset.correct;
            
            if (!userAnswer) {
                answeredAll = false;
                select.classList.remove('correct', 'incorrect');
            } else if (userAnswer === correctAnswer) {
                select.classList.add('correct');
                select.classList.remove('incorrect');
            } else {
                select.classList.add('incorrect');
                select.classList.remove('correct');
                allCorrect = false;
            }
        });
        
        if (!answeredAll) {
            showFeedback(feedback, 'Please complete all steps before checking.', 'error');
        } else if (allCorrect) {
            showFeedback(feedback, 'Perfect! You correctly evaluated the complex logical expression step by step.', 'success');
        } else {
            showFeedback(feedback, 'Some steps are incorrect. Remember to evaluate each part carefully: AND requires both operands to be true, OR requires at least one to be true.', 'error');
        }
    });
}

function showFeedback(feedbackElement, message, type) {
    feedbackElement.textContent = message;
    feedbackElement.className = `feedback ${type}`;
    feedbackElement.style.display = 'block';
    
    // Scroll to feedback
    feedbackElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add some interactive hover effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to truth table cells
    document.querySelectorAll('.truth-table td').forEach(cell => {
        if (cell.classList.contains('true') || cell.classList.contains('false')) {
            cell.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1)';
                this.style.transition = 'transform 0.2s ease';
            });
            
            cell.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        }
    });
    
    // Add click-to-highlight functionality for operation cards
    document.querySelectorAll('.operation-card').forEach(card => {
        card.addEventListener('click', function() {
            // Remove highlight from all cards
            document.querySelectorAll('.operation-card').forEach(c => {
                c.style.borderColor = '#e2e8f0';
                c.style.backgroundColor = '#f8fafc';
            });
            
            // Highlight clicked card
            this.style.borderColor = '#667eea';
            this.style.backgroundColor = '#f0f4ff';
        });
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        // Ensure focused elements are visible
        setTimeout(() => {
            const focused = document.activeElement;
            if (focused && focused.scrollIntoView) {
                focused.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
        }, 100);
    }
});

// Progress tracking for practice problems
let problemProgress = {
    1: false,
    2: false,
    3: false
};

function updateProgress(problemId, solved) {
    problemProgress[problemId] = solved;
    
    const totalProblems = Object.keys(problemProgress).length;
    const solvedProblems = Object.values(problemProgress).filter(Boolean).length;
    
    // You could add a progress bar here
    if (solvedProblems === totalProblems) {
        setTimeout(() => {
            alert('🎉 Congratulations! You\'ve completed all practice problems. You now have a solid understanding of predicate logic basics!');
        }, 1000);
    }
}

// Update progress when problems are solved correctly
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('check-answer')) {
        const problemId = e.target.dataset.problem;
        setTimeout(() => {
            const feedback = document.getElementById(`feedback-${problemId}`);
            if (feedback && feedback.classList.contains('success')) {
                updateProgress(problemId, true);
            }
        }, 100);
    }
});

// Enhanced problem checking for new problems
function checkOriginalProblems(problemNum) {
    const feedback = document.getElementById(`feedback-${problemNum}`);
    let isCorrect = true;
    let message = '';

    switch (problemNum) {
        case 1: // Basic Truth Table
            const answers1 = document.querySelectorAll(`[data-problem="${problemNum}"] .answer-select`);
            const expected1 = ['F', 'T', 'F', 'F', 'T', 'T', 'T', 'T'];
            
            answers1.forEach((select, index) => {
                if (select.value !== expected1[index]) {
                    isCorrect = false;
                }
            });
            
            message = isCorrect ? 
                '🎉 Excellent! You correctly completed the truth table for ¬P ∨ Q!' : 
                '❌ Some answers are incorrect. Check your work step by step.';
            break;

        case 2: // Exclusive OR
            const selected2 = document.querySelector('input[name="q2"]:checked');
            isCorrect = selected2 && selected2.hasAttribute('data-correct');
            message = isCorrect ? 
                '🎉 Correct! XOR is true when exactly one operand is true.' : 
                '❌ Incorrect. Remember that XOR means "one or the other, but not both".';
            break;

        case 3: // Complex Expression
            const steps3 = document.querySelectorAll(`[data-problem="${problemNum}"] .step-answer`);
            const expected3 = ['F', 'T', 'T', 'T'];
            
            steps3.forEach((select, index) => {
                if (select.value !== expected3[index]) {
                    isCorrect = false;
                }
            });
            
            message = isCorrect ? 
                '🎉 Perfect! You correctly evaluated the complex expression step by step!' : 
                '❌ Some steps are incorrect. Review each operation carefully.';
            break;
    }

    feedback.textContent = message;
    feedback.className = isCorrect ? 'feedback success' : 'feedback error';
    
    return isCorrect;
}

// Enhanced problem checking for new problems
function checkProblemAnswer(problemNum) {
    const feedback = document.getElementById(`feedback-${problemNum}`);
    let isCorrect = true;
    let message = '';

    if (problemNum <= 3) {
        // Use existing logic for problems 1-3
        return checkOriginalProblems(problemNum);
    }

    switch (problemNum) {
        case 4: // De Morgan's Law
            const answers4 = document.querySelectorAll(`[data-problem="${problemNum}"] .answer-select`);
            const expected4 = ['F', 'F', 'T', 'T', 'T', 'T', 'T', 'T'];
            
            answers4.forEach((select, index) => {
                if (select.value !== expected4[index]) {
                    isCorrect = false;
                }
            });
            
            message = isCorrect ? 
                '🎉 Excellent! You\'ve successfully verified De Morgan\'s Law!' : 
                '❌ Some answers are incorrect. Remember: ¬(P ∧ Q) should equal ¬P ∨ ¬Q in every row.';
            break;

        case 5: // Implication Analysis
            const selected5 = document.querySelector('input[name="q5"]:checked');
            isCorrect = selected5 && selected5.hasAttribute('data-correct');
            message = isCorrect ? 
                '🎉 Correct! Implication is false only when the antecedent is true and consequent is false.' : 
                '❌ Incorrect. Think about when "If P, then Q" would be false.';
            break;

        case 6: // Three-Variable Expression
            const steps6 = document.querySelectorAll(`[data-problem="${problemNum}"] .step-answer`);
            const expected6 = ['F', 'T', 'F'];
            
            steps6.forEach((select, index) => {
                if (select.value !== expected6[index]) {
                    isCorrect = false;
                }
            });
            
            message = isCorrect ? 
                '🎉 Perfect! You correctly evaluated the three-variable expression step by step!' : 
                '❌ Some steps are incorrect. Check your OR and AND operations carefully.';
            break;

        case 7: // Logical Equivalence
            const selected7 = document.querySelector('input[name="q7"]:checked');
            isCorrect = selected7 && selected7.hasAttribute('data-correct');
            message = isCorrect ? 
                '🎉 Excellent! ¬(P → Q) is indeed equivalent to P ∧ ¬Q.' : 
                '❌ Incorrect. Think about when P → Q is false, then negate that condition.';
            break;

        case 8: // Complex Truth Table Challenge
            const answers8 = document.querySelectorAll(`[data-problem="${problemNum}"] .answer-select`);
            
            answers8.forEach((select) => {
                if (select.value !== 'T') {
                    isCorrect = false;
                }
            });
            
            message = isCorrect ? 
                '🎉 Outstanding! You\'ve proven the exportation law - this is a tautology!' : 
                '❌ Remember: since both sides of the biconditional are equivalent, the result should always be True.';
            break;
    }

    feedback.textContent = message;
    feedback.className = isCorrect ? 'feedback success' : 'feedback error';
    
    // Add visual feedback to answer elements
    if (problemNum === 4 || problemNum === 6 || problemNum === 8) {
        const answerSelects = document.querySelectorAll(`[data-problem="${problemNum}"] .answer-select`);
        answerSelects.forEach(select => {
            const isSelectCorrect = select.value === select.getAttribute('data-correct');
            select.style.borderColor = isSelectCorrect ? '#28a745' : '#dc3545';
            select.style.backgroundColor = isSelectCorrect ? '#d4edda' : '#f8d7da';
        });
    }

    return isCorrect;
}

// Add event listeners for new functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mode switching
    const modeInputs = document.querySelectorAll('input[name="mode"]');
    modeInputs.forEach(input => {
        input.addEventListener('change', function() {
            const simpleBuilder = document.getElementById('simpleBuilder');
            const complexBuilder = document.getElementById('complexBuilder');
            
            if (this.value === 'simple') {
                simpleBuilder.classList.remove('hidden');
                complexBuilder.classList.add('hidden');
            } else {
                simpleBuilder.classList.add('hidden');
                complexBuilder.classList.remove('hidden');
            }
            generateTruthTable();
        });
    });

    // Preset expression buttons
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const expression = this.getAttribute('data-expression');
            document.getElementById('customExpression').value = expression;
            generateTruthTable();
        });
    });

    // Custom expression input
    const customExpressionInput = document.getElementById('customExpression');
    if (customExpressionInput) {
        customExpressionInput.addEventListener('input', function() {
            if (document.querySelector('input[name="mode"]:checked').value === 'complex') {
                generateTruthTable();
            }
        });
    }

    // Enhanced answer checking for all problems
    const checkButtons = document.querySelectorAll('.check-answer');
    checkButtons.forEach(button => {
        button.addEventListener('click', function() {
            const problemNum = parseInt(this.getAttribute('data-problem'));
            checkProblemAnswer(problemNum);
        });
    });

    // Solution showing for all problems
    const solutionButtons = document.querySelectorAll('.show-solution');
    solutionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const problemNum = this.getAttribute('data-problem');
            const solution = document.getElementById(`solution-${problemNum}`);
            solution.classList.toggle('hidden');
            this.textContent = solution.classList.contains('hidden') ? 'Show Solution' : 'Hide Solution';
        });
    });
});
