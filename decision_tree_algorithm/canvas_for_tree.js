const canvas = document.getElementById("treeCanvasID");
const ctx = canvas.getContext("2d");

function updateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}