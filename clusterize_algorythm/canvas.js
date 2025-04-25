// window.points = [];

// const canvases = [
//     document.getElementById("canvas_for_clusterization1"),
//     document.getElementById("canvas_for_clusterization2"),
//     document.getElementById("canvas_for_clusterization3")
// ]

// const ctxs = canvases.map(ctx => ctx.getContext("2d"));
// let draw = false;

// canvases.forEach(canvas => {
//     canvas.addEventListener("mousedown", (e) => {
//         draw = true;
//         drawAt(e);
//     });
//     canvas.addEventListener("mousemove", (e) => {
//         if (draw)
//             drawAt(e);
//     });
//     canvas.addEventListener("mouseup", () => {
//         draw = false;
//     });
// });


// function drawAt(e) {
//     const rect = canvases[0].getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     points.push({x, y, color:"black"});

//     ctxs.forEach(ctx => drawPointOn(ctx, {x, y, color:"black"}));
// }

// function drawPoint(point, size = 5) {
//     ctxs.forEach(ctx => {
//         ctx.beginPath();
//         ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
//         ctx.fillStyle = point.color;
//         ctx.fill();
//     });
// }

// function drawPointOn(ctx, point, size = 5) {
//     ctx.beginPath();
//     ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
//     ctx.fillStyle = point.color || "black";
//     ctx.fill();
// }


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

// Очистка холстов и списка точек
document.getElementById("clear_canvas").addEventListener("click", () => {
    points.length = 0;
    updateCanvas();
});

