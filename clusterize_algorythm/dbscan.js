document.getElementById("start_clasterization_with_dbscan").addEventListener("click", function() {
    if (points.length == 0) {
        alert("Добавьте точки на холст");
        return;
    }
    const eps = parseInt(document.getElementById("eps_value").textContent);
    setupDBSCAN(eps);
});


function euclidean(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function rangeQuery(dist, data, q, eps) {
    return data.filter(p => dist(p.data, q.data) <= eps);
}

function dbscan(dist, data, minPts, eps) {
    let c = 0;
    data = data.map((p, i) => ({
        idx: i,
        data: p,
        label: -1
    }));

    data.forEach(p => {
        if (p.label !== -1) return;
        let n = rangeQuery(dist, data, p, eps);
        if (n.length < minPts) {
            p.label = 0;
            return;
        }
        c += 1;
        p.label = c;

        let s = n.filter(q => q.idx !== p.idx);
        while (s.length) {
            let q = s.pop();
            if (q.label === 0) q.label = c;
            if (q.label !== -1) continue;
            q.label = c;
            let n2 = rangeQuery(dist, data, q, eps);
            if (n2.length >= minPts) {
                s = s.concat(n2);
            }
        }
    });
    return data.map( d => ({
        ...d.data, 
        cluster: d.label <= 0 ? -1 : d.label - 1
    }));
}


function setupDBSCAN(eps) {
    const minPts = 3;
    const clusters = dbscan(euclidean, points, minPts, eps);
    const colors = ["red", "blue", "green", "purple", "orange", "white", "magenta"];
    const uniqueClusters = new Set();
    
    for (let i = 0; i < points.length; i++) {
        const cluster = clusters[i].cluster;
        if (cluster === -1) {
            points[i].color = "gray";
        } else {
            points[i].color = colors[cluster % colors.length];
            uniqueClusters.add(cluster);
        }
    }
    updateCanvas();
    let count = points.filter(p => p.color === "gray").length;
    const clusterCount = uniqueClusters.size;
    info.textContent = `найдено кластеров: ${clusterCount} (шум: ${count})`;
}