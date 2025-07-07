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
    // Mode switching
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    const simpleBuilder = document.getElementById('simpleBuilder');
    const complexBuilder = document.getElementById('complexBuilder');
    
    modeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'simple') {
                simpleBuilder.classList.remove('hidden');
                complexBuilder.classList.add('hidden');
            } else {
                simpleBuilder.classList.add('hidden');
                complexBuilder.classList.remove('hidden');
            }
            updateExpression();
        });
    });
    
    // Simple mode elements
    const prop1Select = document.getElementById('prop1');
    const prop2Select = document.getElementById('prop2');
    const operatorSelect = document.getElementById('operator');
    const negate1Checkbox = document.getElementById('negate1');
    const negate2Checkbox = document.getElementById('negate2');
    const generateButton = document.getElementById('generateTable');
    const expressionDisplay = document.getElementById('expressionDisplay');
    
    // Preset expression buttons
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const expression = this.dataset.expression;
            document.getElementById('customExpression').value = expression;
            updateExpression();
        });
    });
    
    // Update expression display
    function updateExpression() {
        const mode = document.querySelector('input[name="mode"]:checked').value;
        let expression = '';
        
        if (mode === 'simple') {
            const prop1 = prop1Select.value;
            const prop2 = prop2Select.value;
            const operator = getOperatorSymbol(operatorSelect.value);
            const neg1 = negate1Checkbox.checked ? '¬' : '';
            const neg2 = negate2Checkbox.checked ? '¬' : '';
            
            expression = `${neg1}${prop1} ${operator} ${neg2}${prop2}`;
        } else {
            expression = document.getElementById('customExpression').value.trim() || '(P ∧ Q) ∨ R';
        }
        
        expressionDisplay.textContent = expression;
    }
    
    // Get operator symbol
    function getOperatorSymbol(operator) {
        const symbols = {
            'and': '∧',
            'or': '∨',
            'xor': '⊕',
            'implies': '→',
            'iff': '↔'
        };
        return symbols[operator] || '∧';
    }
    
    // Generate truth table
    function generateTruthTable() {
        const mode = document.querySelector('input[name="mode"]:checked').value;
        
        if (mode === 'simple') {
            generateSimpleTruthTable();
        } else {
            generateComplexTruthTable();
        }
    }
    
    // Generate simple truth table
    function generateSimpleTruthTable() {
        const prop1 = prop1Select.value;
        const prop2 = prop2Select.value;
        const operator = operatorSelect.value;
        const negate1 = negate1Checkbox.checked;
        const negate2 = negate2Checkbox.checked;
        
        const props = [prop1, prop2];
        const uniqueProps = [...new Set(props)];
        
        // Generate all combinations
        const combinations = [];
        const numProps = uniqueProps.length;
        const numRows = Math.pow(2, numProps);
        
        for (let i = 0; i < numRows; i++) {
            const combination = {};
            for (let j = 0; j < numProps; j++) {
                combination[uniqueProps[j]] = (i >> (numProps - 1 - j)) & 1 ? true : false;
            }
            combinations.push(combination);
        }
        
        // Create table HTML
        let tableHTML = '<table class="truth-table"><thead><tr>';
        
        // Headers
        uniqueProps.forEach(prop => {
            tableHTML += `<th>${prop}</th>`;
        });
        
        if (negate1) {
            tableHTML += `<th>¬${prop1}</th>`;
        }
        if (negate2 && prop2 !== prop1) {
            tableHTML += `<th>¬${prop2}</th>`;
        }
        
        const expressionText = `${negate1 ? '¬' : ''}${prop1} ${getOperatorSymbol(operator)} ${negate2 ? '¬' : ''}${prop2}`;
        tableHTML += `<th>${expressionText}</th>`;
        tableHTML += '</tr></thead><tbody>';
        
        // Rows
        combinations.forEach(combo => {
            tableHTML += '<tr>';
            
            // Base propositions
            uniqueProps.forEach(prop => {
                const value = combo[prop];
                tableHTML += `<td class="${value ? 'true' : 'false'}">${value ? 'T' : 'F'}</td>`;
            });
            
            // Negated propositions
            if (negate1) {
                const value = !combo[prop1];
                tableHTML += `<td class="${value ? 'true' : 'false'}">${value ? 'T' : 'F'}</td>`;
            }
            if (negate2 && prop2 !== prop1) {
                const value = !combo[prop2];
                tableHTML += `<td class="${value ? 'true' : 'false'}">${value ? 'T' : 'F'}</td>`;
            }
            
            // Result
            const val1 = negate1 ? !combo[prop1] : combo[prop1];
            const val2 = negate2 ? !combo[prop2] : combo[prop2];
            const result = evaluateOperation(val1, val2, operator);
            tableHTML += `<td class="${result ? 'true' : 'false'}">${result ? 'T' : 'F'}</td>`;
            
            tableHTML += '</tr>';
        });
        
        tableHTML += '</tbody></table>';
        document.getElementById('generatedTable').innerHTML = tableHTML;
    }
    
    // Generate complex truth table
    function generateComplexTruthTable() {
        const expression = document.getElementById('customExpression').value.trim();
        
        if (!expression) {
            document.getElementById('generatedTable').innerHTML = '<p>Please enter an expression</p>';
            return;
        }
        
        try {
            // Extract unique propositions from expression
            const props = [...new Set(expression.match(/[PQR]/g) || [])].sort();
            
            if (props.length === 0) {
                document.getElementById('generatedTable').innerHTML = '<p>No valid propositions found. Use P, Q, or R.</p>';
                return;
            }
            
            const numRows = Math.pow(2, props.length);
            let tableHTML = '<table class="truth-table"><thead><tr>';
            
            // Headers for propositions
            props.forEach(prop => {
                tableHTML += `<th>${prop}</th>`;
            });
            tableHTML += `<th>${expression}</th>`;
            tableHTML += '</tr></thead><tbody>';
            
            // Generate rows
            for (let i = 0; i < numRows; i++) {
                tableHTML += '<tr>';
                
                // Create combination
                const combination = {};
                for (let j = 0; j < props.length; j++) {
                    const value = (i >> (props.length - 1 - j)) & 1 ? true : false;
                    combination[props[j]] = value;
                    tableHTML += `<td class="${value ? 'true' : 'false'}">${value ? 'T' : 'F'}</td>`;
                }
                
                // Evaluate expression
                const result = evaluateComplexExpression(expression, combination);
                tableHTML += `<td class="${result ? 'true' : 'false'}">${result ? 'T' : 'F'}</td>`;
                
                tableHTML += '</tr>';
            }
            
            tableHTML += '</tbody></table>';
            document.getElementById('generatedTable').innerHTML = tableHTML;
        } catch (error) {
            document.getElementById('generatedTable').innerHTML = '<p>Error parsing expression. Please check syntax.</p>';
        }
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
    
    // Evaluate complex expression
    function evaluateComplexExpression(expression, values) {
        // Simple parser for basic expressions
        let expr = expression;
        
        // Replace propositions with their values
        for (const [prop, value] of Object.entries(values)) {
            const regex = new RegExp(prop, 'g');
            expr = expr.replace(regex, value ? 'true' : 'false');
        }
        
        // Replace logical operators
        expr = expr.replace(/¬/g, '!')
                  .replace(/∧/g, '&&')
                  .replace(/∨/g, '||')
                  .replace(/⊕/g, '!==')
                  .replace(/→/g, '||!')
                  .replace(/↔/g, '===');
        
        // Handle implication properly: A → B becomes !A || B
        expr = expr.replace(/(\w+)\s*\|\|\!\s*(\w+)/g, '!$1 || $2');
        
        try {
            return eval(expr);
        } catch (e) {
            return false;
        }
    }
    
    // Event listeners
    if (prop1Select && prop2Select && operatorSelect && negate1Checkbox && negate2Checkbox) {
        [prop1Select, prop2Select, operatorSelect, negate1Checkbox, negate2Checkbox].forEach(element => {
            element.addEventListener('change', updateExpression);
        });
    }
    
    if (generateButton) {
        generateButton.addEventListener('click', generateTruthTable);
    }
    
    const customExpressionInput = document.getElementById('customExpression');
    if (customExpressionInput) {
        customExpressionInput.addEventListener('input', updateExpression);
    }
    
    // Initialize
    updateExpression();
    generateTruthTable();
}

// Practice Problems Functionality
function initializePracticeProblems() {
    // Initialize all problems
    for (let i = 1; i <= 11; i++) {
        initializeProblem(i);
    }
    
    // Show solution buttons
    document.querySelectorAll('.show-solution').forEach(button => {
        button.addEventListener('click', function() {
            const problemId = this.dataset.problem;
            const solution = document.getElementById(`solution-${problemId}`);
            if (solution) {
                solution.classList.toggle('hidden');
                this.textContent = solution.classList.contains('hidden') ? 'Show Solution' : 'Hide Solution';
            }
        });
    });
}

function initializeProblem(problemId) {
    const checkButton = document.querySelector(`[data-problem="${problemId}"].check-answer`);
    const feedback = document.getElementById(`feedback-${problemId}`);
    
    if (!checkButton || !feedback) return;
    
    checkButton.addEventListener('click', function() {
        switch (problemId) {
            case 1:
                checkProblem1();
                break;
            case 2:
                checkProblem2();
                break;
            case 3:
                checkProblem3();
                break;
            case 4:
                checkProblem4();
                break;
            case 5:
                checkProblem5();
                break;
            case 6:
                checkProblem6();
                break;
            case 7:
                checkProblem7();
                break;
            case 8:
                checkProblem8();
                break;
            case 9:
                checkProblem9();
                break;
            case 10:
                checkProblem10();
                break;
            case 11:
                checkProblem11();
                break;
        }
    });
}

function checkProblem1() {
    const selects = document.querySelectorAll('[data-problem="1"] .answer-select');
    const feedback = document.getElementById('feedback-1');
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
}

function checkProblem2() {
    const selectedOption = document.querySelector('input[name="q2"]:checked');
    const feedback = document.getElementById('feedback-2');
    
    if (!selectedOption) {
        showFeedback(feedback, 'Please select an answer before checking.', 'error');
        return;
    }
    
    const labels = document.querySelectorAll('[data-problem="2"] .choice-label');
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
}

function checkProblem3() {
    const stepAnswers = document.querySelectorAll('[data-problem="3"] .step-answer');
    const feedback = document.getElementById('feedback-3');
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
}

function checkProblem4() {
    const selects = document.querySelectorAll('[data-problem="4"] .answer-select');
    const feedback = document.getElementById('feedback-4');
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
        showFeedback(feedback, 'Excellent! You\'ve successfully verified De Morgan\'s Law. Both expressions are equivalent!', 'success');
    } else {
        showFeedback(feedback, 'Some answers are incorrect. Remember De Morgan\'s Law: ¬(P ∧ Q) ≡ (¬P ∨ ¬Q)', 'error');
    }
}

function checkProblem5() {
    const selectedOption = document.querySelector('input[name="q5"]:checked');
    const feedback = document.getElementById('feedback-5');
    
    if (!selectedOption) {
        showFeedback(feedback, 'Please select an answer before checking.', 'error');
        return;
    }
    
    const labels = document.querySelectorAll('[data-problem="5"] .choice-label');
    labels.forEach(label => {
        label.classList.remove('correct', 'incorrect');
        const input = label.querySelector('input');
        if (input.checked) {
            if (input.dataset.correct) {
                label.classList.add('correct');
                showFeedback(feedback, 'Correct! Implication is false only when the antecedent is true and the consequent is false.', 'success');
            } else {
                label.classList.add('incorrect');
                showFeedback(feedback, 'Incorrect. Review the truth table for implication (→).', 'error');
            }
        }
    });
}

function checkProblem6() {
    const stepAnswers = document.querySelectorAll('[data-problem="6"] .step-answer');
    const feedback = document.getElementById('feedback-6');
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
        showFeedback(feedback, 'Perfect! You correctly evaluated the three-variable expression.', 'success');
    } else {
        showFeedback(feedback, 'Some steps are incorrect. Work through each operation carefully.', 'error');
    }
}

function checkProblem7() {
    const selectedOption = document.querySelector('input[name="q7"]:checked');
    const feedback = document.getElementById('feedback-7');
    
    if (!selectedOption) {
        showFeedback(feedback, 'Please select an answer before checking.', 'error');
        return;
    }
    
    const labels = document.querySelectorAll('[data-problem="7"] .choice-label');
    labels.forEach(label => {
        label.classList.remove('correct', 'incorrect');
        const input = label.querySelector('input');
        if (input.checked) {
            if (input.dataset.correct) {
                label.classList.add('correct');
                showFeedback(feedback, 'Correct! ¬(P → Q) ≡ P ∧ ¬Q', 'success');
            } else {
                label.classList.add('incorrect');
                showFeedback(feedback, 'Incorrect. Think about when P → Q is false, then negate that.', 'error');
            }
        }
    });
}

function checkProblem8() {
    const selects = document.querySelectorAll('[data-problem="8"] .answer-select');
    const feedback = document.getElementById('feedback-8');
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
        showFeedback(feedback, 'Excellent! You\'ve demonstrated the exportation law - this is a tautology!', 'success');
    } else {
        showFeedback(feedback, 'Some answers are incorrect. This should be a tautology (all T\'s).', 'error');
    }
}

function checkProblem9() {
    const selects = document.querySelectorAll('[data-problem="9"] .answer-select');
    const feedback = document.getElementById('feedback-9');
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
        showFeedback(feedback, 'Perfect! You\'ve proven the distributive law - conjunction distributes over disjunction!', 'success');
    } else {
        showFeedback(feedback, 'Some answers are incorrect. The distributive law should always hold (all T\'s in equivalence column).', 'error');
    }
}

function checkProblem10() {
    const selects = document.querySelectorAll('[data-problem="10"] .answer-select');
    const feedback = document.getElementById('feedback-10');
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
        showFeedback(feedback, 'Excellent! You\'ve proven the contrapositive law - an implication is equivalent to its contrapositive!', 'success');
    } else {
        showFeedback(feedback, 'Some answers are incorrect. The contrapositive should always be equivalent to the original implication.', 'error');
    }
}

function checkProblem11() {
    const selects = document.querySelectorAll('[data-problem="11"] .answer-select');
    const feedback = document.getElementById('feedback-11');
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
        showFeedback(feedback, 'Outstanding! You\'ve mastered the absorption laws - fundamental to Boolean algebra and circuit simplification!', 'success');
    } else {
        showFeedback(feedback, 'Some answers are incorrect. Both absorption laws should always hold (all T\'s in both equivalence columns).', 'error');
    }
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

// Add interactive hover effects
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

// Progress tracking for practice problems
let problemProgress = {
    1: false, 2: false, 3: false, 4: false,
    5: false, 6: false, 7: false, 8: false,
    9: false, 10: false, 11: false
};

function updateProgress(problemId, solved) {
    problemProgress[problemId] = solved;
    
    const totalProblems = Object.keys(problemProgress).length;
    const solvedProblems = Object.values(problemProgress).filter(Boolean).length;
    
    if (solvedProblems === totalProblems) {
        setTimeout(() => {
            alert('🎉 Congratulations! You\'ve completed all practice problems. You now have a solid understanding of predicate logic basics!');
        }, 1000);
    }
}

// Update progress when problems are solved correctly
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('check-answer')) {
        const problemId = parseInt(e.target.dataset.problem);
        setTimeout(() => {
            const feedback = document.getElementById(`feedback-${problemId}`);
            if (feedback && feedback.classList.contains('success')) {
                updateProgress(problemId, true);
            }
        }, 100);
    }
});
