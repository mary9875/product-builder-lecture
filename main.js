document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const numbersContainer = document.querySelector('.numbers-container');
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    const themeText = document.getElementById('theme-text');

    // Animal Test Elements
    const imageUpload = document.getElementById('image-upload');
    const faceImage = document.getElementById('face-image');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const labelContainer = document.getElementById('label-container');
    const resultMessage = document.getElementById('result-message');

    // Teachable Machine URL
    const MODEL_URL = "https://teachablemachine.withgoogle.com/models/Uhwx1XPAt/";
    let model, maxPredictions;

    // Load Model initially
    async function loadModel() {
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
    }
    loadModel();

    // Animal Face Test Logic (File Upload)
    imageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            faceImage.src = event.target.result;
            faceImage.classList.remove('hidden');
            uploadPlaceholder.classList.add('hidden');
            
            // 이미지 로드 대기 후 예측
            faceImage.onload = async () => {
                await predict();
            };
        };
        reader.readAsDataURL(file);
    });

    async function predict() {
        if (!model) return;
        
        const prediction = await model.predict(faceImage);
        let highestProb = 0;
        let bestMatch = "";

        labelContainer.innerHTML = ''; // 기존 결과 초기화

        for (let i = 0; i < maxPredictions; i++) {
            const className = prediction[i].className;
            const prob = (prediction[i].probability * 100).toFixed(0);
            
            const wrapper = document.createElement('div');
            wrapper.className = 'result-bar-wrapper';
            wrapper.innerHTML = `
                <div class="result-label">
                    <span class="class-name">${className}</span>
                    <span class="probability">${prob}%</span>
                </div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${prob}%"></div>
                </div>
            `;
            labelContainer.appendChild(wrapper);

            if (prediction[i].probability > highestProb) {
                highestProb = prediction[i].probability;
                bestMatch = className;
            }
        }

        const emoji = bestMatch.includes("강아지") || bestMatch.toLowerCase().includes("dog") ? "🐶" : "🐱";
        resultMessage.textContent = `당신은 귀여운 ${bestMatch}상입니다! ${emoji}`;
    }
});
