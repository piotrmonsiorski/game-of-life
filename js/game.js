const initCols = 80;
const initRows = 30;
const initPercent = 30;
const gameSpeed = 100 // setInterval interval
let draw = false;

const boardDiv = document.querySelector('.board');
let fieldDivs;
const inputRows = document.querySelector('#rows');
const inputCols = document.querySelector('#cols');
const inputPercent = document.querySelector('#percent');
const btnReset = document.querySelector('#btn-reset');
const btnDraw = document.querySelector('#btn-draw');

const resetGame = () => {

    
    game.resetGame(cols, rows, percent);
}

class Field {
    constructor(percent) {
        this.state = this.genState(percent);
        this.neighbours = 0;
    }
    genState(percent) {
        const result = Math.round(Math.random() * 100);
        if (result < percent) {
            return true;
        }
        else {
            return false;
        }
    }
}

class Map {
    constructor(cols = initCols, rows = initRows, percent = initPercent) {
        this.cols = cols;
        this.rows = rows;
        this.fieldMap = [];
        
        this.generateMap(cols, rows, percent);
    }
    generateMap(cols, rows, percent) {
        const map = this.fieldMap;
        for (let i = 0; i < cols; i++) {
            const row = [];
            for (let j = 0; j < rows; j++) {
                const field = new Field(percent);
                row.push(field);
            }
            map.push(row);
        }
    }
}

class Game {
    constructor() {
        this.map = new Map();
        this.renderMap(this.map);
        this.countNeighbours(this.map);
    }
    renderMap(map) {
        const cols = map.cols;
        const rows = map.rows;
        
        let aliveCounter = 0;
        
        // draw map
        for (let i = 0; i < cols; i++) {
            const colDiv = document.createElement('div');
            colDiv.classList.add('col');
            for (let j = 0; j < rows; j++) {
                const fieldDiv = document.createElement('div');
                fieldDiv.classList.add('field');
                fieldDiv.dataset.col = i;
                fieldDiv.dataset.row = j;
                if (this.map.fieldMap[i][j].state) {
                    fieldDiv.classList.add('alive');
                    aliveCounter++;
                }
                colDiv.appendChild(fieldDiv);
            }
            boardDiv.appendChild(colDiv);
        }
        
        if(!aliveCounter) {
            clearInterval(gameReset);
        }
    }
    countNeighbours(map) {
        const cols = map.cols;
        const rows = map.rows;
        
        const appCoords = [ [ -1, -1 ] , [ 0, -1 ] , [ 1, -1 ] , [ -1, 0 ] , [ 1, 0 ] , [ -1, 1 ] , [ 0, 1 ] , [ 1, 1 ] ];
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                this.map.fieldMap[i][j].neighbours = 0;
                appCoords.forEach(coords => {
                    if ( !(i + coords[0] < 0 || i + coords[0] >= cols || j + coords[1] < 0 || j + coords[1] >= rows) ) {
                        if (this.map.fieldMap[i + coords[0]][j + coords[1]].state == true) {
                            this.map.fieldMap[i][j].neighbours++;
                        }
                    }
                });
                const div = document.querySelector(`[data-col="${i}"][data-row="${j}"]`);
//                div.textContent = this.map.fieldMap[i][j].neighbours;
            }
        }
    }
    nextDay() {        
        const cols = this.map.cols;
        const rows = this.map.rows;
        
        // redefine field state
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let fieldState = this.map.fieldMap[i][j];
                const fieldNeighbours = this.map.fieldMap[i][j].neighbours;
                switch(fieldNeighbours) {
                    case 8:
                    case 7:
                    case 6:
                    case 5:
                    case 4:
                        this.map.fieldMap[i][j].state = false; // die of overpopulation
                        break;
                    case 3:
                        this.map.fieldMap[i][j].state = true; // birth or static
                        break;
                    case 2: // static
                        break;
                    case 1:
                    default:
                        this.map.fieldMap[i][j].state = false; // die of loneliness
                        break;
                }
            }
        }
        boardDiv.innerHTML = '';
        this.renderMap(this.map);
        this.countNeighbours(this.map);
    }
    resetGame() {
        let cols = parseInt(inputCols.value, 10);
        let rows = parseInt(inputRows.value, 10);
        let percent = parseInt(inputPercent.value, 10);

        // if inputs are empty, reset to init values
        if (isNaN(cols) && isNaN(rows) && isNaN(percent)) {
            cols = initCols;
            rows = initRows;
            percent = initPercent;
        }
        // check if all inputs are filled
        if (isNaN(cols) || isNaN(rows) || isNaN(percent)) {
            alert('Jedna z podanych wartości jest pusta');
            return;
        }
        // check if values are not <0 or >100 or cols*rows>1000 or percent invalid
        if ((cols > 100 || cols < 0) || (rows > 100 || rows < 0) || (cols * rows > 5000) || (percent < 0) || (percent > 100)) {
            alert('Passed values are incorrect (max rows = 100, max colums = 100, max fields = 5000)');
            return;
        }

        boardDiv.innerHTML = '';
        this.map = new Map(cols, rows, percent);
        this.renderMap(this.map);
        this.countNeighbours(this.map);
        
        clearInterval(gameReset);
        gameReset = setInterval(this.nextDay.bind(this), gameSpeed);
    }
    drawGame() {
        if (!draw) {
            clearInterval(gameReset);
            // clear map
            this.map.fieldMap.forEach( col => {
                col.forEach ( field => {
                    field.neighbours = 0;
                    field.state = false;
                });
            });
            boardDiv.innerHTML = '';
            this.renderMap(this.map);
            btnDraw.textContent = 'play';
            draw = true;
            
            const that = this;
            
            fieldDivs = [...document.querySelectorAll('.field')];
            fieldDivs.forEach( field => {
                field.addEventListener('click', function() {
                    const col = field.dataset.col;
                    const row = field.dataset.row;
                    
                    that.map.fieldMap[col][row].state = !that.map.fieldMap[col][row].state;
                    field.classList.toggle('alive');
                });
            });
        }
        else {
            btnDraw.textContent = 'clear board and draw';
            draw = false;
            boardDiv.innerHTML = '';
            this.renderMap(this.map);
            this.countNeighbours(this.map);
            gameReset = setInterval(game.nextDay.bind(game), gameSpeed);
        }
    }
}

const game = new Game();
let gameReset = setInterval(game.nextDay.bind(game), gameSpeed);
btnReset.addEventListener('click', game.resetGame.bind(game));
btnDraw.addEventListener('click', game.drawGame.bind(game));