document.getElementById("start_clasterization").addEventListener("click", function() {
    if (points.length == 0) {
        alert("Добавьте точки на холст");
        return;
    }
    const k = parseInt(document.getElementById("k_value").textContent);
    setupKMeans(k);
});

function setupKMeans(k) {
    dataExtremes = getDataExtremes(points);
    dataRange = getDataRange(dataExtremes);
    means = initMeans(k, dataExtremes, dataRange);
    
    runRec();
}

function getDataExtremes(points) {
    var extremes = [{min: 1000, max: -1000}, {min: 1000, max: -1000}];
    
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        if (point.x < extremes[0].min) 
            extremes[0].min = point.x;
        if (point.x > extremes[0].max) 
            extremes[0].max = point.x;
        if (point.y < extremes[1].min) 
            extremes[1].min = point.y;
        if (point.y > extremes[1].max) 
            extremes[1].max = point.y;
    }
    return extremes;
}

function getDataRange(dataExtremes) {
    return [
        dataExtremes[0].max - dataExtremes[0].min,
        dataExtremes[1].max - dataExtremes[1].min
    ];
}

function initMeans(k, dataExtremes, dataRange) {
    const newMeans = [];
    for (let i = 0; i < k; i++) {
        newMeans.push({
            x: dataExtremes[0].min + (Math.random() * dataRange[0]),
            y: dataExtremes[1].min + (Math.random() * dataRange[1])
        });
    }
    return newMeans;
}

function makeAssignments() {
    const assignments = [];
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        let minDist = 1000;
        let bсluster = 0;
        
        for (let j = 0; j < means.length; j++) {
            const mean = means[j];
            const dx = point.x - mean.x;
            const dy = point.y - mean.y;
            const dist = Math.sqrt(dx ** 2 + dy ** 2);
            
            if (dist < minDist) {
                minDist = dist;
                bсluster = j;
            }
        }
        
        assignments[i] = bсluster;
    }
    
    return assignments;
}

function moveMeans(assignments) {
    const sums = Array(means.length).fill().map(() => ({x: 0, y: 0}));
    const counts = Array(means.length).fill(0);
    let moved = false;
    
    for (let i = 0; i < assignments.length; i++) {
        const cluster = assignments[i];
        sums[cluster].x += points[i].x;
        sums[cluster].y += points[i].y;
        counts[cluster]++;
    }
    
    for (let i = 0; i < means.length; i++) {
        if (counts[i] == 0) {
            means[i] = {
                x: dataExtremes[0].min + Math.random() * dataRange[0],
                y: dataExtremes[1].min + Math.random() * dataRange[1]
            };
            moved = true;
        } 
        else {
            const newX = sums[i].x / counts[i];
            const newY = sums[i].y / counts[i];
            
            if (Math.abs(means[i].x - newX) > 0.1 || Math.abs(means[i].y - newY) > 0.1)
                moved = true;
            means[i] = {x: newX, y: newY};
        }
    }
    
    return moved;
}

function drawClusters(assignments){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const colors = ["red", "blue", "green", "purple", "orange", "white", "magenta"];
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const cluster = assignments[i];
        drawPoint(point.x, point.y, colors[cluster]);
    }
}

function runRec(){
    const assignments = makeAssignments();
    const moved = moveMeans(assignments);
    drawClusters(assignments);
    if (moved){
        setTimeout(run, 500);
    }
}