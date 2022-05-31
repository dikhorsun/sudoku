"use strict";

class Sudoku {
    constructor(initString = '000000000000000000000000000000000000000000000000000000000000000000000000000000000') {
        const starValues = initString.split('').filter(x => '0123456789'.includes(x)).map(x => Number(x))
        this.body =[];

//создаем массив из 81 эл.
        let idCounter = 1;
        for(let y=0; y<9; y++) {
            for(let x=0; x<9; x++){
                this.body.push({
                    id: idCounter,
                    x: x,
                    y: y, 
                    number: starValues[idCounter-1],
                    selected: false,
                    supported: false,
                    started: starValues[idCounter-1]===0 ? false: true,  // является ли число стартовым (равно ли 0)
                    important: false, 
                    error: false,
                    s: parseInt(y/3)*3 + parseInt(x/3)
                })
                idCounter++
            }
            
        }
    }
        
// метод быстрого доступа к элементам конткретной строки, столбца, сегмента
    getRow(n){
        const row = [];

        for(let i=0; i<9; i++) {
            row.push(this.body[n*9+i])
        }
        
        return row
    }

    getColumn(n){
        const column = [];

        for(let i=0; i<9; i++) {
            column.push(this.body[i*9+n])
        }
        
        return column
    }

    //   getSegment(n){
    //     const segment = [];

    //     const x = n % 3
    //     const y = parseInt(n / 3)
        
    //    for (let dy=0; dy<3; dy++) {
    //     for (let dx=0; dx<3; dx++) {
    //         segment.push(this.body [
    //             y * 27 + dy * 9 + x * 3 + dx
    //         ])
    //     }
    //    }
     
    //     return segment
    // }

    getSegment(n){
        const segment = [];

        for(let i=0; i<81; i++) {
            if(n===this.body[i].s){
                segment.push(this.body[i])
            }
           
        }
        
        return segment
    }
    // обработчик keydown, проверяющий стартовая ячейка или нет(и не дает ее удалить) + дающий ввести только цифры 1-9
    keydownHandler (event, cell) {
        event = event || window.event
        if(!cell.started){
            if('123456789'.includes(event.key)){
                cell.number = parseInt(event.key)

                if(cell.error){
                    for(const item of this.body){
                        item.error = false
                    }
                }
                // проверка на наличие такой же цифры в строке, столбце и сегменте
                for(const item of this.getRow(cell.y)) {
                    if (item !== cell&&item.number===cell.number) {
                        item.error = true;
                        cell.error = true;
                    }
                }

                for(const item of this.getColumn(cell.x)) {
                    if (item !== cell&&item.number===cell.number) {
                        item.error = true;
                        cell.error = true;
                    }
                }

                for(const item of this.getSegment(cell.s)) {
                    if (item === cell) {
                        continue
                    }

                    if (item.number===cell.number){
                        item.error = true;
                        cell.error = true;
                    }
                }
            }
            else if (event.key=='Backspace'||event.key=='Delete'){
                cell.number = 0;
            }
            
            for (const item of this.body){
                item.important = false;
            }
            if (cell.number){
                for (const item of this.body){
                    if(item.number===cell.number) {
                        item.important = true;
                    }
                }
            }
        }
       
        event.preventDefault()
        this.viewUpdate()
    }
    focusHandler (event, cell) {
        event = event || window.event
        cell.selected = true

        for (const item of this.getRow(cell.y)){
            item.supported = true
        }
        for (const item of this.getColumn(cell.x)){
            item.supported = true
        }

        if (cell.number){
            for (const item of this.body){
                if(item.number===cell.number) {
                    item.important = true;
                }
            }
        }

        this.viewUpdate()
    }

    blurHandler (event, cell) {
        event = event || window.event
        cell.selected = false
        
        if (cell.error){
            cell.number = 0;
        }

        for (const cell of this.body){
            cell.important = false;
            cell.supported = false;
            cell.error = false;
        }

        this.viewUpdate()
        
    }

// создаем поле со всеми инпутами и добавляеи в HTML
    getHTML (size) {
      
        // нашли и работаем со всеми ячейками
        for(const cell of this.body) {
            const inputElement = document.createElement('input');
            inputElement.classList.add('sudoku-cell');
            inputElement.setAttribute('type', 'text');

            inputElement.addEventListener('keydown', event => this.keydownHandler(event, cell))
            inputElement.addEventListener('focus', event => this.focusHandler(event, cell))
            inputElement.addEventListener('blur', event => this.blurHandler(event, cell))

            if(cell.started){
                inputElement.classList.add('start-cell');
            }

            cell.element = inputElement;
        }

        const rootElement = document.createElement('div');
        rootElement.classList.add('sudoku-game');
        rootElement.style.width = `${size}%`;
        rootElement.style.height = `${size}%`;
 
    
        // добавили сегменты
        for (let s=0; s<9; s++) {
            const segmentElement = document.createElement('div');
            segmentElement.classList.add('sudoku-segment');
            
            // добавили ячейки в сегменты
            for (const cell of this.getSegment(s)) {
                segmentElement.append(cell.element)
            }

            rootElement.append(segmentElement)
        }
        this.viewUpdate()

        return rootElement
    }

    viewUpdate () {
        for (const cell of this.body){
            
            cell.element.classList.remove("supported-cell", "selected-cell", "important-cell", "error")
            if (cell.number){
                cell.element.value = cell.number        
            }
            else cell.element.value = ''
                
         
            if(cell.supported){
                cell.element.classList.add("supported-cell")
            }

            if(cell.selected){
                cell.element.classList.add("selected-cell")
            }

            if(cell.important){
                cell.element.classList.add("important-cell")
            }

            if(cell.error){
                cell.element.classList.add("error")
            }
        }
    }
    // находи решения, где potentials - массив возможных решений для клетки
    getPotentials() {
        const potentials = [];

        for (const cell of this.body){
            if(cell.number) {
                potentials.push(cell.number)
            }
            else {
                //нахоидим все числа в строке, столбце, сегменте и фильтруем оставляя только доступные для решения значения
                const rowNumbers = this.getRow(cell.y).map(x => x.number);
                const columnNumbers = this.getColumn(cell.x).map(x => x.number);
                const segmentNumbers = this.getSegment(cell.s).map(x => x.number);

                const alphabet = [1, 2, 3, 4, 5, 6, 7, 8, 9]
                potentials.push(
                    alphabet
                        .filter(x => !rowNumbers.includes(x))
                        .filter(x => !columnNumbers.includes(x))
                        .filter(x => !segmentNumbers.includes(x))
                )

            }
            
        }
        return potentials
    }

    //метод создает копию (сделав строку из текущего массива)
    getCopy () {
        return new Sudoku(
            this.body.map(x => x.number).join('')
        )
    }

    // авто-решение судоку
    // сразу решение, если оно решаемое логически
    solve () {
        const copy = this.getCopy();
        let flag = true;

        while(flag){
            flag = false;

            const potentials = copy.getPotentials();

            for (let i = 0; i<81; i++){
                const potential = potentials[i];

                if(potential instanceof Array && potential.length === 1){
                    copy.body[i].number = potential[0];
                    flag = true
                }
            }
        }
        // делаем перебор для решения даже пустого судоку 

        const potentials = copy.getPotentials();
        
        for (let power=2; power<=9; power++){
            for( let i=0; i<81; i++){
                if(potentials[i].length === power){
                    for (const value of potentials[i]){
                        const nextCopy = copy.getCopy();
                        nextCopy.body[i].number = value;

                        const resultCopy = nextCopy.solve();
                        if (resultCopy.isSolved){
                            return resultCopy
                        }
                    }
                }
            }

        }
        return copy
    }

    // геттер, проверяющий решили судоку или нет
    get isSolved () {
        for (const cell of this.body) {
            if(cell.number === 0){
                return false
            }
        }
        
        for (let i=0; i<9; i++){
            
            const row = this.getRow(i).map(x => x.number);
            for(let n=1; n<=9; n++){
                if(!row.includes(n)){
                    return false
                }
            }
            const column = this.getColumn(i).map(x => x.number);
            for(let n=1; n<=9; n++){
                if(!column.includes(n)){
                    return false
                }
            }
            const segment = this.getSegment(i).map(x => x.number);
            for(let n=1; n<=9; n++){
                if(!segment.includes(n)){
                    return false
                }
            }
            
        }
        return true
    }
    // статические методы для всего класса (поиск пустых ячеек, поиск заполненных ячеек (с return соответсвенно рандомными пустой и заполненной ящейки), 
    //и генерации судоку с нужным нам кол-вом заполненных ячеек n  исходя из полностью решенного до этого судоку)
    static getFreeCell (sudoku) {
        const cells = sudoku.body.filter(x => !x.number);
        const index = Math.floor(Math.random()*cells.length);

        return cells[index];
    }

    static getBysuCell (sudoku) {
        const cells = sudoku.body.filter(x => x.number);
        const index = Math.floor(Math.random()*cells.length);

        return cells[index];
    }

    static generate (n) {
        n = Math.min(81, Math.max(n, 9))  //чтобы  n было в диапазоне от 0 до 81
        const w = new Sudoku;

        for (let i = 1; i<=9-n; i++) {     // заполняем стартовое поле цифрами 1-9 в случайном порядке
            const freeCell = Sudoku.getFreeCell(w);
            freeCell.number = i;
        }

        const s = w.solve();  // получили решенную полностью заполненную судоку 

        for (let i = 0; i<(81-n); i++) {
            const busyCell = Sudoku.getBysuCell(s);
            busyCell.number = 0;
        }
        return new Sudoku(s.body.map(x => x.number).join(''))     
    }
    
     




}

