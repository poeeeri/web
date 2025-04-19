const canvas = document.getElementById("canvas_for_clusterization");
const ctx = canvas.getContext("2d");
const points = [];

function updateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let point of points) {
        drawPoint(point.x, point.y, point.color);
    }

    document.getElementById("count_of_points").textContent = points.length;
}

function drawPoint(x, y, color, size = 5) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

document.getElementById("clear_canvas").addEventListener("click", () => {
    points.length = 0;
    updateCanvas();
});

canvas.addEventListener("click", function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    points.push({x, y, color: "black"});
    updateCanvas();
});

