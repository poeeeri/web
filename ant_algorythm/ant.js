function getRandomInt(min, max) {
    min = Math.ceil(min); 
    max = Math.floor(max); 
    return Math.floor(Math.random() * (max - min + 1)) + min; 
  }

class Point {
    number;
    x;
    y;
}


class Inf {
    constructor(len = 0) {
        this.len = len;
        this.inverse_distance = len === 0 ? 0 : 0.01 / len;
        this.pheromones = len === 0 ? 0 : 0.5; // начальное значение феромона
    }
}

class Ant {

    route = [];
    len;

}



var points = [];

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var count_citys = 0;
var width = 600;
var height = 400;
var count = document.getElementById("count_city");
var pi = Math.PI;
count.innerHTML = "Количество городов на карте: " + count_citys;
canvas.onmousedown = function(event) {
    drawPoints(points);
    const point = new Point();
    point.x = event.offsetX;
    point.y = event.offsetY;
    point.number = count_citys;
    points.push(point);
    console.log('массив точек:', points);
    console.log('Клик на canvas произошел в точке:', point.x, point.y);
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#00DF82";
    ctx.fillStyle =  "#00090E";
    ctx.arc(point.x, point.y, 15, 0, 2*pi, false);
    ctx.stroke();
    ctx.fill();
    count_citys++;
    // ОТОБРАЖЕНИЕ ТЕКУЩЕГО КОЛИЧЕСТВА ДОВ НА КАРТЕ
    console.log('Количество городов:', count_citys);
    count.innerHTML = "Количество городов на карте: " + count_citys;
    ctx.closePath();
}

// ОЧИСТИТЬ ХОЛСТ
var clear = document.getElementById("clear");
clear.addEventListener('click', () => {
    ctx.clearRect(0, 0, width, height);
    points = [];
    count_citys = 0;
    count.innerHTML = "Количество городов на карте: " + count_citys;
    route_len.innerHTML = '';
    step_algorythm.innerHTML = '';

})

// ОТОБРАЖЕНИЯ КОЛИЧЕСТВА ТОЧЕК НА ПОЛЗУНКЕ
var slider = document.getElementById("citySlider");
var count_on_slider = document.getElementById("countOnSlider");
count_on_slider.innerHTML = slider.valueAsNumber;

slider.addEventListener('input', () => {
    console.log(slider.valueAsNumber); // текущее количество городов
    count_on_slider.innerHTML = slider.valueAsNumber;
});

// СЛУЧАЙНАЯ ГЕНЕРАЦИЯ ГОРОДОВ
var generationt_citys = document.getElementById("generation_city");
generationt_citys.addEventListener('click', () => {

    route_len.innerHTML = '';
    step_algorythm.innerHTML = '';

    ctx.clearRect(0,0, width, height);
    count_citys = 0;
    count.innerHTML = "Количество городов на карте: " + count_citys;
    points = [];

    for (let i = 0; i < slider.valueAsNumber; i++){
    
        x_rand = getRandomInt(0, width);
        y_rand = getRandomInt(0, height);

        const point = new Point();
        point.x = x_rand;
        point.y = y_rand;
        point.number = count_citys;
        points.push(point);

        count_citys++;
        console.log('Количество городов:', count_citys);
        count.innerHTML = "Количество городов на карте: " + count_citys;

        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#00DF82";
        ctx.fillStyle =  "#00090E";
        ctx.arc(x_rand, y_rand, 15, 0, 2*pi, false);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }

    console.log('массив точек:', points);

    
});



function drawPoints(points){
    // ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#00DF82";
        ctx.fillStyle =  "#00090E";
        ctx.arc(points[i].x, points[i].y, 15, 0, 2 * pi, false);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }
}


function drawRouteWithPoints(route, points){

    ctx.clearRect(0, 0, width, height);
    // drawPoints(points);

    ctx.strokeStyle = "#F1F7F7";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(points[route[0]].x, points[route[0]].y);

    for (let i = 1; i < route.length; i++){
        const point = points[route[i]];
        ctx.lineTo(point.x, point.y);
    }

    // ctx.lineTo(points[0].x, points[0].y);
    ctx.stroke();
    drawPoints(points);
}

//АЛГОРИТМ

//создание матрицы с ферамонами и дистанцией между каждой парой вершин
function create_matrix_inf(points){

    let  matrix_inf = [];
    for (let i = 0; i < points.length; i++){
        matrix_inf[i] = [];
        for (let j = 0; j < points.length; j++){
            let len = 0;
            if (i != j){
                len = Math.pow(Math.pow(points[j].x - points[i].x, 2) + Math.pow(points[j].y - points[i].y, 2), 0.5);
            }
            matrix_inf[i][j] = new Inf(len);
        }
    }

    return matrix_inf;
}

//поиск вероятности для каждого города
function find_transition_probability(matrix_inf, current_point, visited) {
    let probability = [];
    let sum = 0;

    let alpha = 1;
    let beta = 3;

    for (let i = 0; i < matrix_inf[current_point].length; i++) {
        if (!visited.includes(i) && i !== current_point) {
            sum += Math.pow(matrix_inf[current_point][i].pheromones, alpha) * Math.pow(matrix_inf[current_point][i].inverse_distance, beta);
        }
    }

    for (let i = 0; i < matrix_inf[current_point].length; i++) {
        if (visited.includes(i) || i === current_point) {
            probability[i] = 0;
        } else {
            probability[i] = (Math.pow(matrix_inf[current_point][i].pheromones, alpha) * Math.pow(matrix_inf[current_point][i].inverse_distance, beta)) / sum;
        }
    }

    return probability;
}
//выбор следующего города с помощью рулетки вероятности
function choose_next_city(probability) {
    let random = Math.random();
    let nums = [];
    let roulette = [];

    let sum = 0;
    for (let i = 0; i < probability.length; i++) {
        if (probability[i] != 0) {
            nums.push(i);
            sum += probability[i];
            roulette.push(sum);
        }
    }

    let next_city;

    for (let i = 0; i < roulette.length; i++) {
        if (random < roulette[i]) {
            next_city = nums[i];
            break;
        }
    }

    return next_city;
}

//проход одного муравья
function trip_one_ant(matrix_inf, start_city) {
    let visited = [start_city];
    let ant = new Ant();
    ant.route = [start_city];

    while (visited.length < matrix_inf.length) {
        let probability = find_transition_probability(matrix_inf, start_city, visited);
        let next_city = choose_next_city(probability);

        

        visited.push(next_city);
        ant.route.push(next_city);
        start_city = next_city;
    }

    ant.route.push(ant.route[0]);
    return ant;
}


//генерация нескольких муравьев
function trips_ants(matrix_inf){

    let matrix_trips = [];


    for (let i = 0; i < matrix_inf.length; i++){

        matrix_trips[i] = trip_one_ant(matrix_inf, i);
        matrix_trips[i].len = calculating_length(matrix_inf, matrix_trips[i]);
    }


    return matrix_trips;
}

function calculating_length(matrix_inf, ant){

    let len = 0;
    for (let i = 0; i < ant.route.length-1; i++){

        len += matrix_inf[ant.route[i]][ant.route[i+1]].len;
    }

    return len;

}

function updating_pheromones(matrix_inf, matrix_trips){

    //испарение феромонов
    let rho = 0.1; //коэффициент испарения феромонов
    for (let i = 0; i < matrix_inf.length; i++){
        for (let j = 0; j < matrix_inf.length; j++){
            if (i != j){
                matrix_inf[i][j].pheromones *= (1-rho);
            }
        }
    }

    //наложение новых феромонов
    let Q = 100;
    for (let i = 0; i < matrix_trips.length; i++){
        
        let ant = matrix_trips[i];
        
        for (let j = 0; j < ant.route.length-1; j++){


            matrix_inf[ant.route[j]][ant.route[j+1]].pheromones += Q/ant.len;

        }
    }
}


function sort_length(matrix_trips){
    matrix_trips.sort((a,b) => a.len - b.len);

}

function run_ant_algorithm(matrix_inf){ //одна итерация

    let matrix_trips = trips_ants(matrix_inf); //создаем маршруты муравьев
    updating_pheromones(matrix_inf, matrix_trips); //обновляем феромоны
    sort_length(matrix_trips);
    drawRouteWithPoints(matrix_trips[0].route, points);


}

var route_len = document.getElementById("length");
var step_algorythm = document.getElementById("step_algorythm");

var algorithm = document.getElementById("algorithm");
algorithm.addEventListener('click', async () => {

    
    let Q = 100;
    let best_route = null;
    let best_len = Infinity;

    var matrix_inf = create_matrix_inf(points);
    

    for (let i = 0; i < points.length*20; i++){
        // run_ant_algorithm(matrix_inf);
        
        let matrix_trips = trips_ants(matrix_inf); //создаем маршруты муравьев
        updating_pheromones(matrix_inf, matrix_trips); //обновляем феромоны
        sort_length(matrix_trips);

        if (matrix_trips[0].len < best_len) {
            best_len = matrix_trips[0].len;
            best_route = [...matrix_trips[0].route];
            drawRouteWithPoints(best_route, points);
        }

        //элитный муравей
        if (best_route !== null){
            for (let j = 0; j < best_route.length - 1; j++) {
                matrix_inf[best_route[j]][best_route[j+1]].pheromones += Q / best_len;
            }        
        }
        
        route_len.innerHTML = "Длина маршрута: " + best_len.toFixed(2);
        step_algorythm.innerHTML = "Итерация: " + (i+1) + " из " + points.length*20;

        //задержка для отрисовки каждого маршрута 150мс
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    

});