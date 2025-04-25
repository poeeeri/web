const bandwidthInput = document.getElementById("bandwidth");
const info = document.getElementById("info");

document.getElementById("start_clasterization_with_meanshift").addEventListener("click", function () {
    if (points.length === 0) {
        alert("Добавьте точки для кластеризации!");
        return;
    }
    const bandwidth = parseFloat(bandwidthInput.value);
    clusters = meanShift(points, bandwidth);
    setupMeanShift();
    info3.textContent = `Найдено кластеров: ${clusters.length}`;
});

function euclideanForMeanShift(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function meanShift(points, bandwidth = 50) {
    const clustersCenters= [];
    for (let p of points) {
        let newCluster = true;
        for (let center of clustersCenters) {
            if (euclideanForMeanShift(p, center) < bandwidth / 2) {
                newCluster = false;
                break;
            }
        }
        if (newCluster) {
            clustersCenters.push({
                x: p.x,
                y: p.y
            });
        }
    }
    return clustersCenters;
}

function setupMeanShift() {
    const colors = ["red", "blue", "green", "purple", "orange", "yellow", "magenta"];
    const canvas3 = document.getElementById("canvas_for_clusterization3");
    const ctx3 = canvas3.getContext("2d");
    ctx3.clearRect(0, 0, canvas3.width, canvas3.height);

    points.forEach((p) => {
        let minDist = Infinity;
        let clusterIdx = 0;
        clusters.forEach((center, idx) => {
            const d = euclideanForMeanShift(p, center);
            if (d < minDist) {
                minDist = d;
                clusterIdx = idx;
            }
        });
        p.color = colors[clusterIdx % colors.length];
        drawPointOn(ctx3, p);
    });

}
