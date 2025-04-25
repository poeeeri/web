// загружаем csv файл для обучающей выборки
function loadDataForTrain(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById("trainTextArea").value = e.target.result;
    };
    reader.readAsText(file);
}

// загружаем csv файл для поиска решения
function loadDataForTest(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById("testTextArea").value = e.target.result;
    };
    reader.readAsText(file);
}

// читаем csv файл и превращаем в массив с признаками
function parseCSVFile(data) {
    return data.trim().split('\n').map(list => list.split(','))
}

const countsAttr = {};
const attr = {};


// ищем прирост инормации (энтропия в начале - энтропия в каждом атрибуте)
function informationGain(data, attribute, targetAttribute) {
    const baseEntropy = entropy(data, targetAttribute);
    const subsets = {};
    for (let row of data) {
        const attrValue = row[attribute];
        if (!subsets[attrValue]) {
            subsets[attrValue] = [];
        }
        subsets[attrValue].push(row);
    }

    let ent = 0;
    for (let value in subsets) {
        const subset = subsets[value];
        const subsetEnt = entropy(subset, targetAttribute);
        ent += (subset.length / data.length) * subsetEnt;
    }

    return baseEntropy - ent;
}

// ищем энтропию
function entropy(data, targetAttribute) {
    const countsAttr = {};
    // считаем количество классов
    for (let row of data) {
        const label = row[targetAttribute];
        countsAttr[label] = (countsAttr[label] || 0) + 1;
    }
    let ent = 0;
    // по всем возможным классам находим вероятность каждого
    // и высчитываем энтропию по формуле
    for (let label in countsAttr) {
        const p = countsAttr[label] / data.length;
        ent -= p * Math.log2(p);
    }
    return ent;
}

// дерево
function decisionTree(data, attributes) {
    const targetAttribute = headers[headers.length - 1];
    const labels = [...new Set(data.map(row => row[targetAttribute]))];
    if (labels.length === 1) {
        return {
            isLeaf: true,
            prediction: labels[0]
        };
    }

    let bestAttr = null;
    let bestGain = -Infinity;
    for (let attribute of attributes) {
        const gain = informationGain(data, attribute, targetAttribute);
        if (gain > bestGain) {
            bestGain = gain;
            bestAttr = attribute;
        }
    }
    const tree = {
        attribute: bestAttr,
        children: {}
    }
    const values = [...new Set(data.map(row => row[bestAttr]))];
    for (let value of values) {
        const subset = data.filter(row => row[bestAttr] === value);
        const remainingAttr = attributes.filter(attr => attr !== bestAttr);
        tree.children[value] = decisionTree(subset, remainingAttr);
    }
    return tree;
}

// решение
function decision() {
    const input = document.getElementById("testTextArea").value;
    if (!input) {
        alert("Введите данные для теста или загрузите CSV");
        return;
    }

    const values = input.split(",");
    if (values.length !== headers.length - 1) {
        alert("Количество атрибутов не совпадает с обучающей выборкой");
        return;
    }

    const example = {};
    headers.slice(0, -1).forEach((attr, i) => {
        example[attr] = values[i].trim();
    });

    const result = classify(tree, example);
    alert("решение: " + result);
}

function classify(tree, example) {
    if (tree.isLeaf) {
        return tree.prediction;
    }
    const attrValue = example[tree.attribute];
    const child = tree.children[attrValue];
    if (!child) {
        return "а я не знаю";
    }
    return classify(child, example);
}

let tree;
let headers = []; // признаки


// обучение дерева и визуализация его на холсте
function trainTree() {
    const csvText = document.getElementById("trainTextArea").value;
    const data = parseCSVFile(csvText);
    headers = data[0];
    const rows = data.slice(1);

    const examples = rows.map(row => {
        const obj = {};
        row.forEach((value, index) => {
            obj[headers[index]] = value;
        });
        return obj;
    });

    tree = decisionTree(examples, headers.slice(0, -1));
    visualizeTree();
}

function drawNode(node, x, y, depth, ctx, dx, dy) {
    const radius = 30;
    ctx.font = "14px 'Russo One'";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    const label = node.isLeaf ? node.prediction : node.attribute;
    ctx.beginPath();
    ctx.fillStyle = "#00DF82";
    ctx.strokeStyle = "#000";
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.fillText(label, x, y + 4);

    if (node.isLeaf) return;

    const values = Object.keys(node.children);
    const count = values.length;
    const totalWidth = dx * (count - 1);

    values.forEach((value, i) => {
        const childX = x - totalWidth / 2 + dx * i;
        const childY = y + dy;
        const child = node.children[value];
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineTo(childX, childY - radius);
        ctx.stroke();

        ctx.fillText(value, (x + childX) / 2, (y + childY) / 2 - 5);

        drawNode(child, childX, childY, depth + 1, ctx, dx, dy);
    });
}

function visualizeTree() {
    const canvas = document.getElementById("treeCanvasID");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNode(tree, canvas.width / 2, 50, 0, ctx, 160, 100);
}


const nav = document.getElementById('nav');
const hiddenNav = document.getElementById('hiddenNav');
nav.addEventListener('click', () => {
    hiddenNav.classList.toggle('active');
});