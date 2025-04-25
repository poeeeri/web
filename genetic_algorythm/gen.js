function getRandomInt(min, max) {
    min = Math.ceil(min); // округляем до ближайшего большего целого
    max = Math.floor(max); // округляем до ближайшего меньшего целого
    return Math.floor(Math.random() * (max - min + 1)) + min; 
}

class Point {
    number;
    x;
    y;
}


var points = [];


// ОТМЕТКА ТОЧЕК ВРУЧНУЮ
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var count_citys = 0;
var width = 600;
var height = 400;
var count = document.getElementById("count_city");
var pi = Math.PI;
count.innerHTML = "Количество городов на карте: " + count_citys;
canvas.onmousedown = function(event) {
    route_len.innerHTML = '';
    step_algorythm.innerHTML = '';
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

});



slider.addEventListener('input', () => {
    console.log(slider.valueAsNumber); // текущее количество городов
    count_on_slider.innerHTML = slider.valueAsNumber;
});


// СЛУЧАЙНАЯ ГЕНЕРАЦИЯ ГОРОДОВ
var generationt_citys = document.getElementById("generation_city");
generationt_citys.addEventListener('click', () => {

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
    for (let i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#00DF82";
        ctx.fillStyle = "#00090E";
        ctx.arc(points[i].x, points[i].y, 15, 0, 2 * pi, false);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }
}


function drawRouteWithPoints(route, points){

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "#F1F7F7";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < route.length; i++){
        const point = points[route[i]];
        ctx.lineTo(point.x, point.y);
    }

    ctx.lineTo(points[0].x, points[0].y);
    ctx.stroke();
    drawPoints(points);

}



// АЛГОРИТМ

class Individual {
    constructor(route, length_route = null, fitness = null){
        this.route = route;
        this.length_route = null;
        this.fitness = null;
    }
}

function create_population(matrix_length){

    const count = matrix_length.length*4; //количество особей в начальной популяции
    const population = new Set();
    const result = []; 

    //для отладки
    let attempts = 0;
    const maxAttempts = 10000;

    while (population.size < count && attempts < maxAttempts){
        attempts++;
        //создаем массив с городами в возрастающем порядке
        let route = [];
        for (let i = 1; i < matrix_length.length; i++){
            route.push(i);
        }
        // для перемешивания городов случайным образом используем алгоритм Фишера-Йетса
        for (let i = route.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i+1));
            [route[i], route[j]] = [route[j], route[i]];
        }

        const key = route.join(','); //преобразуем массив в строку чтобы исключать появление одинаковых маршрутов

        if (!population.has(key)){
            population.add(key);
            result.push(new Individual(route));
        }
    }

    if (attempts >= maxAttempts) {
        console.warn("Превышено количество попыток генерации популяции. Возможно, слишком мало уникальных маршрутов.");
    }

    return result;


}

function calculating_length_and_fitness_in_population(matrix_length, population){
   
    for (let i = 0; i < population.length; i++){
        let len = 0;
        population[i].route.unshift(0);
        population[i].route.push(0);
        for (let j = 0; j < population[i].route.length - 1; j++){
            len += matrix_length[population[i].route[j]][population[i].route[j+1]];
        }
        population[i].length_route = len;
        population[i].fitness = 1/len;
        population[i].route.shift();
        population[i].route.pop();

    }
}


//сортируем по приспособленности 
function sort_fitness(population){
    population.sort((a,b) => a.length_route - b.length_route);
}


//скрещивание
function crossover(matrix_length, population){

    //перемешиваем популяцию, чтобы случайно выбирать родителей 
    let mixed_population = [...population];
    for (let i = population.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i+1));
        [mixed_population[i], mixed_population[j]] = [mixed_population[j], mixed_population[i]];
    }

    let offsprings = [];

    //скрещивание рядом стоящих пар популяции(один из вариантов выбора родителей)
    for (let i = 0; i < mixed_population.length - 1; i+=2){

        let parent1 = [...mixed_population[i].route];
        let parent2 = [...mixed_population[i+1].route];

        let split = getRandomInt(1, mixed_population[i].route.length - 2);


        let child1 = parent1.slice(0, split);
        for (let j = 0; j < parent2.length; j++){
            if (!child1.includes(parent2[j])) child1.push(parent2[j]);
        }
        
        let child2 = parent2.slice(0, split);
        for (let j = 0; j < parent1.length; j++){
            if (!child2.includes(parent1[j])) child2.push(parent1[j]);
        }

        offsprings.push(new Individual(child1));
        offsprings.push(new Individual(child2));

    }
    
    calculating_length_and_fitness_in_population(matrix_length, offsprings);
    sort_fitness(population);

    return offsprings;
   
}



function mutation(matrix_length, offsprings) {
    let mutation_offsprings = offsprings.map(ind => new Individual([...ind.route]));
    let percentage_of_mutations = 0.3;

    for (let i = 0; i < mutation_offsprings.length; i++) {

        if (Math.random() < percentage_of_mutations) {
      
            let start = getRandomInt(0, offsprings[i].route.length - 1);
            let end = getRandomInt(start, offsprings[i].route.length - 1);

            while (start < end) {
                [mutation_offsprings[i].route[start], mutation_offsprings[i].route[end]] =
                    [mutation_offsprings[i].route[end], mutation_offsprings[i].route[start]];
                start++;
                end--;
            }

        }

    }

    calculating_length_and_fitness_in_population(matrix_length, mutation_offsprings);
    sort_fitness(mutation_offsprings);
    return mutation_offsprings;
}

function run_gen_algorithm(matrix_length, population){

    let offsprings = crossover(matrix_length, population);
    let mutation_offsprings = mutation(matrix_length, offsprings);

    //сортируем и оставляем лучших
    let result_population = [];
   
    // добавляем старую популяцию
    for (let i = 0; i < population.length; i++) {
        result_population.push(population[i]);
    }
    // добавляем потомков
    for (let i = 0; i < mutation_offsprings.length; i++) {
        result_population.push(mutation_offsprings[i]);
    }

    sort_fitness(result_population);
    result_population = result_population.slice(0, population.length);


    return result_population;


}

var route_len = document.getElementById("length");
var step_algorythm = document.getElementById("step_algorythm");


var algorithm = document.getElementById("algorithm");
algorithm.addEventListener('click', async () => {

    // ЗАПИСЬ ДЛИНЫ МЕЖДУ КАЖДОЙ ПАРОЙ ТОЧЕК В МАТРИЦУ
    var matrix_length = [];
    for (let i = 0; i < points.length; i++){
        matrix_length[i] = [];
        for (let j = 0; j < points.length; j++){
            if (i != j){
                matrix_length[i][j] = Math.pow(Math.pow(points[j].x - points[i].x, 2) + Math.pow(points[j].y - points[i].y, 2), 0.5);
    
            }
        }
    }
    console.log('массив длин:', matrix_length);
    
    var population = create_population(matrix_length);
    calculating_length_and_fitness_in_population(matrix_length, population);
    sort_fitness(population);
    console.log('начальная популяция', population);
    for (let i = 0; i < points.length*15; i++){
        population = run_gen_algorithm(matrix_length, population);
        console.log('лучшая особь: ', population[0]);
        let best_rout = [...population[0].route];
        best_rout.unshift(0);
        best_rout.push(0);

        drawRouteWithPoints(best_rout, points);
        console.log(`Шаг ${i + 1}: длина маршрута — ${population[0].length_route.toFixed(2)}`);
        route_len.innerHTML = "Длина маршрута: " + population[0].length_route.toFixed(2);
        step_algorythm.innerHTML = "Итерация: " + (i+1) + " из " + points.length*15;



        //задержка для отрисовки каждого маршрута 150мс
        await new Promise(resolve => setTimeout(resolve, 100));

    }

    console.log('Финальный маршрут: ', population[0]);
    // console.log('случайное число: ', getRandomInt(4,4));


});


const nav = document.getElementById('nav');
const hiddenNav = document.getElementById('hiddenNav');
nav.addEventListener('click', () => {
    hiddenNav.classList.toggle('active');
});

