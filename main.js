
document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const numbersContainer = document.querySelector('.numbers-container');

    generateBtn.addEventListener('click', () => {
        generateAndDisplayNumbers();
    });

    function generateAndDisplayNumbers() {
        numbersContainer.innerHTML = ''; // Clear previous numbers
        const numbers = generateUniqueNumbers(6, 1, 45);

        numbers.forEach((number, index) => {
            const ball = document.createElement('div');
            ball.classList.add('number-ball');
            ball.classList.add(`color-${(index % 6) + 1}`);
            ball.textContent = number;
            numbersContainer.appendChild(ball);
        });
    }

    function generateUniqueNumbers(count, min, max) {
        const numbers = new Set();
        while (numbers.size < count) {
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            numbers.add(randomNumber);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }
});
