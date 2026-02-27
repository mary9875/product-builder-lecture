document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const numbersContainer = document.querySelector('.numbers-container');
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const themeText = document.getElementById('theme-text');

    // Animal Test Elements
    const startTestBtn = document.getElementById('start-test-btn');
    const labelContainer = document.getElementById('label-container');
    const resultMessage = document.getElementById('result-message');
    const loadingSpinner = document.getElementById('loading-spinner');

    // Teachable Machine URL
    const MODEL_URL = "https://teachablemachine.withgoogle.com/models/Uhwx1XPAt/";
    let model, webcam, maxPredictions;

    // 테마 설정 불러오기
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
            themeText.textContent = '다크 모드';
        }
    }

    // 테마 전환 함수
    function switchTheme(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeText.textContent = '다크 모드';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeText.textContent = '라이트 모드';
        }
    }

    toggleSwitch.addEventListener('change', switchTheme, false);

    // 번호 생성 로직
    generateBtn.addEventListener('click', () => {
        generateAndDisplayNumbers();
    });

    function generateAndDisplayNumbers() {
        numbersContainer.innerHTML = ''; // 기존 번호 초기화
        const numbers = generateUniqueNumbers(6, 1, 45);

        numbers.forEach((number, index) => {
            setTimeout(() => {
                const ball = document.createElement('div');
                ball.classList.add('number-ball');
                ball.classList.add(`color-${(index % 6) + 1}`);
                ball.textContent = number;
                numbersContainer.appendChild(ball);
            }, index * 100); // 순차적으로 나타나는 효과
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

    // Animal Face Test Logic
    async function initAnimalTest() {
        startTestBtn.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');

        try {
            const modelURL = MODEL_URL + "model.json";
            const metadataURL = MODEL_URL + "metadata.json";

            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();

            const flip = true;
            webcam = new tmImage.Webcam(250, 250, flip);
            await webcam.setup();
            await webcam.play();
            
            loadingSpinner.classList.add('hidden');
            document.getElementById("webcam-container").appendChild(webcam.canvas);
            
            // UI 초기화
            for (let i = 0; i < maxPredictions; i++) {
                const wrapper = document.createElement('div');
                wrapper.className = 'result-bar-wrapper';
                wrapper.innerHTML = `
                    <div class="result-label">
                        <span class="class-name"></span>
                        <span class="probability">0%</span>
                    </div>
                    <div class="bar-container">
                        <div class="bar-fill"></div>
                    </div>
                `;
                labelContainer.appendChild(wrapper);
            }

            window.requestAnimationFrame(loop);
        } catch (error) {
            console.error(error);
            alert("카메라를 불러오는 데 실패했습니다.");
            startTestBtn.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
        }
    }

    async function loop() {
        webcam.update();
        await predict();
        window.requestAnimationFrame(loop);
    }

    async function predict() {
        const prediction = await model.predict(webcam.canvas);
        let highestProb = 0;
        let bestMatch = "";

        for (let i = 0; i < maxPredictions; i++) {
            const className = prediction[i].className;
            const prob = (prediction[i].probability * 100).toFixed(0);
            
            const wrapper = labelContainer.childNodes[i];
            wrapper.querySelector('.class-name').textContent = className;
            wrapper.querySelector('.probability').textContent = prob + "%";
            wrapper.querySelector('.bar-fill').style.width = prob + "%";

            if (prediction[i].probability > highestProb) {
                highestProb = prediction[i].probability;
                bestMatch = className;
            }
        }

        if (highestProb > 0.6) {
            const emoji = bestMatch.includes("강아지") || bestMatch.toLowerCase().includes("dog") ? "🐶" : "🐱";
            resultMessage.textContent = `당신은 귀여운 ${bestMatch}상입니다! ${emoji}`;
        } else {
            resultMessage.textContent = "얼굴을 잘 보여주세요!";
        }
    }

    startTestBtn.addEventListener('click', initAnimalTest);
});
