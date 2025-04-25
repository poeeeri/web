class Matrix {
    constructor(rows = 0, cols = 0) {
        this.matrix = [];
        this.rows = rows;
        this.cols = cols;
        this.init(rows, cols);
    }

    init(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.matrix = Array.from({length: rows}, () => Array.from({length: cols}, () => 0.0));
    }
}

class ActivateFunc {
    relu(x) {
        return Math.max(x * 0.01, x);
    }

    relu_derivative(x) {
        return x > 0 ? 1: 0.01;
    }
}

class DataNetwork{
    constructor(l, size) {
        this.l = l;
        this.size = size;
    }
}

class Network{
    constructor(){
        this.l = 0;
        this.size = [];
        this.bias = [];
        this.act_func = new ActivateFunc();
        this.weight = [];
        this.neurons_val = [];
        this.test_x = null;
        this.test_y = null;
    }

    randomGaussian(mu = 0, sigma = 1) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z * sigma + mu;
    }

    init(data) {
        this.l = data.l;
        this.size = data.size;
        this.weight = [];

        for (let i = 1; i < this.l; i++) {
            const rows = this.size[i];
            const cols = this.size[i - 1];
            const scale = Math.sqrt(2.0 / cols);
            const weightMatrix = new Matrix(rows, cols);
            for (let j = 0; j < rows; j++) {
                for (let k = 0; k < cols; k++) {
                    weightMatrix.matrix[j][k] = this.randomGaussian(0, scale);
                }
            }
            this.weight.push(weightMatrix);
        }

        this.bias = [];
        for (let i = 1; i< this.l; i++){
            const layerBias = [];
            for (let j = 0; j < this.size[i]; j++) {
                layerBias.push(this.randomGaussian(0, 0.01));
            }
            this.bias.push(layerBias);
        }

        this.neurons_val = this.size.map(n => Array(n).fill(0.0));
    }

    set_input(value) {
        this.neurons_val[0] = Array.from(value);
    }

    forward_feed() {
        for (let i = 1; i < this.l; i++) {
            const new_vals = [];
            for (let j = 0; j < this.size[i]; j++) {
                let sum_val = 0;
                for (let k = 0; k < this.size[i - 1]; k++) {
                    sum_val += this.weight[i - 1].matrix[j][k] * this.neurons_val[i - 1][k];
                }
                sum_val += this.bias[i - 1][j];
                new_vals.push(this.act_func.relu(sum_val));
            }
            this.neurons_val[i] = new_vals;
        }
        return this.neurons_val[this.l - 1];
    }

    search_max_index(value) {
        let max_val = -10000;
        let maxi = 0;
        for (let i = 0; i < value.length; i++) {
            if (max_val < value[i]) {
                maxi = i;
                max_val = value[i]
            }
        }
        return maxi;
    }

    async read_weights(filename = "weights.txt") {
        const response = await fetch(filename);
        const text = await response.text();
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        let idx = 0;
    
        for (const mtx of this.weight) {
            for (let i = 0; i < mtx.rows; i++) {
                mtx.matrix[i] = lines[idx].split(/\s+/).map(parseFloat);
                idx++;
            }
        }
    
        if (lines[idx] === "BIAS") {
            idx++;
            for (let i = 0; i < this.bias.length; i++) {
                this.bias[i] = lines[idx].split(/\s+/).map(parseFloat);
                idx++;
            }
        }
    }
    
}

function convertImage(canvas) {
    const size = 28;
    const digitSize = 20;
    let w = canvas.width;
    let h = canvas.height;
    const ctx1 = canvas.getContext("2d");

    // где начинается цифра
    const ctxData = ctx1.getImageData(0, 0, w, h).data;
    let minX = w, maxX = 0;
    let minY = h, maxY = 0;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const a = ctxData[idx + 3];
            if (a  < 10) continue; 
            const r = ctxData[idx];
            const g = ctxData[idx + 1];
            const b = ctxData[idx + 2];
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            if (gray < 255.0 * 0.9) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
    }

    if (maxX < minX || maxY < minY) {
        minX = 0; minY = 0;
        maxX = w - 1; maxY = h - 1;
    }

    let newWidht = maxX - minX + 1;
    let newHeight = maxY - minY + 1;

    // центрирование
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = digitSize;
    tempCanvas.height = digitSize;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = "white";
    tempCtx.fillRect(0, 0, digitSize, digitSize);

    const scale = Math.min(digitSize / newHeight, digitSize/ newWidht);
    const dw = newWidht * scale;
    const dh = newHeight * scale;
    const dx = (digitSize - dw) / 2;
    const dy = (digitSize - dh) / 2;
    tempCtx.drawImage(canvas, minX, minY, newWidht, newHeight, dx, dy, dw, dh);

    // масштабирование
    const newCanvas = document.createElement('canvas');
    newCanvas.width = size;
    newCanvas.height = size;
    const newCtx = newCanvas.getContext("2d");
    newCtx.fillStyle = "white";
    newCtx.fillRect(0, 0, size, size);
    const dxy = 4;
    newCtx.drawImage(tempCanvas, dxy, dxy);

    // читаем итоговое изображение
    const image = newCtx.getImageData(0, 0, size, size).data;
    const input = [];
    for (let i = 0; i < image.length; i += 4) {
        const r1 = image[i];
        const g1 = image[i + 1];
        const b1 = image[i + 2];
        const gray1 = 0.299 * r1 + 0.587 * g1 + 0.114 * b1;
        const normalized = (255.0 - gray1)/255;
        input.push(normalized);
    }
    return input;
}


const canvas = document.getElementById('canvas_for_nn');
const ctx = canvas.getContext('2d');

ctx.lineWidth = 20;
ctx.lineCap = 'round';

const mouse = { x: 0, y: 0 };
let draw = false;

canvas.addEventListener("mousedown", function(e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    draw = true;
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
});

canvas.addEventListener("mousemove", function(e) {
    if (draw) {
        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
    }
});

canvas.addEventListener("mouseup", function(e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
    ctx.lineTo(mouse.x, mouse.offsetTop);
    ctx.closePath();
    draw = false;
});



document.getElementById("clear_canvas").addEventListener("click", function(e){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("output").textContent = "Это цифра...";
});

async function main() {
    const value = convertImage(canvas);
    const NW = new Network();
    const NWConfig = new DataNetwork(3, [784, 128, 10]);
    NW.init(NWConfig);
    await NW.read_weights();
    NW.set_input(value);
    const output = NW.forward_feed();
    const predictDigit = NW.search_max_index(output);
    document.getElementById("output").textContent = "Это цифра " + predictDigit;
}

