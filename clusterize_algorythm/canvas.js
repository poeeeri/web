window.points = [];

const canvases = [
    document.getElementById("canvas_for_clusterization1"),
    document.getElementById("canvas_for_clusterization2"),
    document.getElementById("canvas_for_clusterization3")
];

const ctxs = canvases.map(canvas => canvas.getContext("2d"));
let draw = false;

canvases.forEach(canvas => {
    canvas.addEventListener("mousedown", (e) => {
        draw = true;
        drawAt(e, canvas);
    });
    canvas.addEventListener("mousemove", (e) => {
        if (draw) drawAt(e, canvas);
    });
    canvas.addEventListener("mouseup", () => {
        draw = false;
    });
    canvas.addEventListener("mouseleave", () => {
        draw = false;
    });
});

function drawAt(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const point = { x, y, color: "black" };
    points.push(point);
    updateCanvas();
}

function drawPointOn(ctx, point, size = 5) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
    ctx.fillStyle = point.color;
    ctx.fill();
}

function updateCanvas() {
    ctxs.forEach(ctx => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        points.forEach(p => drawPointOn(ctx, p));
    });
    document.getElementById("count_of_points").textContent = points.length;
}

document.getElementById("clear_canvas").addEventListener("click", () => {
    points.length = 0;
    updateCanvas();
});


const menuToggle = document.querySelector('.menu_toggle');
const menu = document.querySelector('.menu');

document.querySelector('.menu_toggle').addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    menu.classList.toggle('active');
});

const navLinks = document.querySelectorAll('.link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            menuToggle.classList.remove('active');
            menu.classList.remove('active');
        }
    });
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        menuToggle.classList.remove('active');
        menu.classList.remove('active');
    }
});

