const bandwidthInput = document.getElementById("bandwidth");
const info = document.getElementById("info");


document.getElementById("start_clasterization_with_meanshift").addEventListener("click", function() {
    if (points.length === 0) {
        alert("Добавьте точки для кластеризации!");
        return;
    }
    const bandwidth = parseInt(bandwidthInput.value);
    clusters = meanShift(points, bandwidth);
    setupMeanShift();
    info.textContent = `Найдено кластеров: ${clusters.length}`;
});

function euclideanForMeanShift(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function meanShift(data, bandwidth = 50, maxIter = 100) {
    var shiftPoints = points.slice();
    var clustersCenters = [];
    for (let i = 0; i < shiftPoints.length; i++) {
        let point = shiftPoints[i];
        let iter = 0;
        let shift = Infinity;

        while (shift > 1 && iter < maxIter) {
            const oldPos = {...point};
            const neighbors = findNeighbor(shiftPoints, point, bandwidth);
            if (neighbors.length > 0) {
                const mean = {x: 0, y: 0};
                neighbors.forEach(neighbor => {
                    mean.x += neighbor.x;
                    mean.y += neighbor.y;
                });

                mean.x /= neighbors.length;
                mean.y /= neighbors.length;
            }

            shift = euclideanForMeanShift(point, oldPos);
            iter++;
        }
    }

    for (let i = 0; i < shiftPoints.length; i++) {
        const point  = shiftPoints[i];
        let searchCluster = false;

        for (let j = 0; j < clustersCenters.length; j++) {
            const cluster = clustersCenters[j];
            const dist = euclideanForMeanShift(point, cluster);
            if (dist < bandwidth/2) {
                searchCluster = true;
                break;
            }
        }
        if (!searchCluster) {
            clustersCenters.push({...point});
        }
    }
    return clustersCenters;
}

function findNeighbor(points, center, r) {
    return points.filter(point => {
        const dist = euclideanForMeanShift(point, center);
        return dist <= r;
    });
}

function setupMeanShift() {
    const colors = ["red", "blue", "green", "purple", "orange", "white", "magenta"];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach(point => {
        let minDist = Infinity;
        let clusterIdx = 0;

        clusters.forEach((cluster, idx) => {
            const dist = euclideanForMeanShift(point, cluster);
            if (dist < minDist) {
                minDist = dist;
                clusterIdx = idx;
            }
        });
        const color = colors[clusterIdx % colors.length];
        drawPoint(point.x, point.y, color);
    });

}