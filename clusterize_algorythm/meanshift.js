document.getElementById("start_clasterization_with_meanshift").addEventListener("click", function(){
    if (points.length === 0) {
        alert("расставьте точки");
        return;
    }
    setupMeanShift();
})


function euclideanForMeanShift(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}


function setupMeanShift() {
    
}