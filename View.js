"use strict";

function View() {
    let self = this,
        myModel = null;

        let cellWidthHeight,                                                                     //размер ячейки
        b,                                                                                    //коэффициент размера ячейки от величины экрана
        backAudio;                                                                        // музыка

    let checker = document.getElementById('soundOnOffButton'),                          
        checkerText,
        scorePlate = document.getElementById('counter');                               
       
    let columns = 9,                                                                // поле 9 на 9
        rows = 9,
        scoreNumber ;                                                                             //счет

    let game = document.getElementsByClassName("game")[0],
      
        field = document.getElementsByClassName('container')[0],
        buttons = document.getElementsByClassName('leftNav')[0],
        header = document.getElementById('header');
       
    let messages,                                                                //таблица рекордов
        ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php",
        stringName = 'Dmitry_Khorsun_progectSudoku',
        updatePassword;                                                         //пароль для блокировки на 1 мин в таблицу рекордов

    self.start = function (model) {
        myModel = model;
        self.buildScreen();
    }

    self.updateGroundStart = function () {
       game.style.background = 'white' 
    }

    self.updateGroundFinish = function () {
        game.style.background = 'url(../img/end.png) no-repeat center center';
        game.style.backgroundSize = 'contain';

     }

    function getWindowClientSize() {                  //выясняем размер окна
        let uaB = navigator.userAgent.toLowerCase(),
            isOperaB = (uaB.indexOf('opera') > -1),
            isIEB = (!isOperaB && uaB.indexOf('msie') > -1);

        let clientWidth = ((document.compatMode || isIEB) && !isOperaB) ?
            (document.compatMode == 'CSS1Compat') ?
                document.documentElement.clientWidth :
                document.body.clientWidth :
            (document.parentWindow || document.defaultView).innerWidth;

        let clientHeight = ((document.compatMode || isIEB) && !isOperaB) ?
            (document.compatMode == 'CSS1Compat') ?
                document.documentElement.clientHeight :
                document.body.clientHeight :
            (document.parentWindow || document.defaultView).innerHeight

        return {width: clientWidth, height: clientHeight}
    }

    self.buildScreen = function () {              // перестройка экрана в зависимости от устройства, размера и ориентации
        let pageWidth = getWindowClientSize().width,
            pageHeight = getWindowClientSize().height;

        const devices = new RegExp('Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini', "i");

        if (devices.test(navigator.userAgent)) {//tablet or mobil
            header.classList.remove('is-desktop');
            
            if (pageWidth > pageHeight) {
                field.style.flexDirection = 'row';
                buttons.style.flexDirection = 'column';
                if ((pageWidth / pageHeight < 1.2 &&
                    pageWidth / pageHeight > 1) ||
                    (pageHeight / pageWidth < 1.1 &&
                        pageHeight / pageWidth > 1)) {
                    b = Math.round(Math.round(pageHeight / 100) * 0.75);
                } else {
                    b = Math.round(Math.round(pageHeight / 100) * 0.95);
                }
            } else {
                field.style.flexDirection = 'column';
                buttons.style.flexDirection = 'row';
                if ((pageWidth / pageHeight < 1.35 &&
                    pageWidth / pageHeight > 1) ||
                    (pageHeight / pageWidth < 1.35 &&
                        pageHeight / pageWidth > 1)) {
                    b = Math.round(Math.round(pageWidth / 100) * 0.75);
                } else {
                    b = Math.round(Math.round(pageWidth / 100) * 0.95);
                }
            }
        } else {                                 //PC
            header.classList.add('is-desktop');
            if (pageWidth > pageHeight) {
                b = Math.round(Math.round(pageHeight / 100) * 0.75);
                field.style.flexDirection = 'row';
                buttons.style.flexDirection = 'column';
            } else {
                b = Math.round(Math.round(pageWidth / 100) * 0.75);
                field.style.flexDirection = 'column';
                buttons.style.flexDirection = 'row';
            }
        }

        cellWidthHeight = b * 10;   // размер ячейки

        game.style.width = rows * cellWidthHeight + 'px';  //размеры игрового поля
        game.style.height = columns * cellWidthHeight + 'px';

        return cellWidthHeight
    }

    self.deleteField = function () {                   //удалить предыдущую судоку
        let elements = document.querySelectorAll(".sudoku-game");
        for (var i = 0; i < elements.length; i++) {
            elements[i].remove();
        }   
    }

    self.music = function () {
        backAudio = new Audio("music/sudocu_Mot.mp3");
    }
    self.music()

    self.updateScore = function (count) {       //обновить счет
        scoreNumber = count;
        scorePlate.innerHTML = count;
    }

    self.soundOnOff = function () {           // запуск-остановка музыки
        checkerText = checker.textContent;
        if (checkerText === 'Включить музыку') {
            checker.textContent = 'Выключить музыку';
            backAudio.currentTime = 0;
            backAudio.play();
        } else if (checkerText === 'Выключить музыку') {
            checker.textContent = 'Включить музыку';
            backAudio.pause();
        }
    }

    self.showPage = function (infoType) {                   //показать страницу с информацией
        let infoContainer = document.getElementById('info-container')
        fillWithContent();

        function fillWithContent() {
            switch (infoType) {         //меняем контент в зависимости от выбора правил или таблицы
                case 'rules':           
                    let infoContent = document.getElementById('info-content');
                    infoContent.innerHTML = `<h2>Цель игры</h2><br>
<p>Цель - расставить в пустые клетки игрового поля цифры 1, 2, 3, 4, 5, 6, 7, 8 и 9 таким образом, чтобы в каждом секторе, в каждом столбце и каждой строки располагались цифры от 1 до 9 без повторений.</p><br><br>
<h2>Как играть?</h2><br>
<ol>
<li>Кнопка «Новая игра». При нажатии на нее генерируется новая комбинация цифр на игровом поле и запускается таймер.</li><br>
<li>На игровом поле щелкните по нужной клетке и введите цифры от 1 до 9, другие цифры и буквы не вводятся.</li><br>
<li>При нажатии на клавиши Delete или Backspace, введенная цифра стирается. При этом стартовые числа, выделенные серым цветом, стереть нельзя.</li><br>
<li>Если при вводе цифры в ячейку, в данном секторе, столбце или строке уже есть такая цифра, то она и все неверные цифры выделяются красным, и при этом сохраниь эту цифру не получится </li><br>
<li>Когда вы заполните все клетки, нажмите кнопку «Проверить», чтобы убедится в правильности и посмотреть, попали ли вы в таблицу рекордов </li><br>
</ol>`;

{/* <li>Для удобства игрока, когда щелкаешь по клетки, подсвечивается соответсвующие столбец и строка, а при вводе цифры - все одинаковые цифры на игровом поле подсвечиваются одним цветом. .</li><br></br> */}

                                                
                    infoContainer.style.animationName = 'info-show';
                    break
                case 'highScore':        
                    uploadTableHighScore();
                    break
            }

            function uploadTableHighScore() {   //читаем таблицу рекордов ajax
                $.ajax({
                        url: ajaxHandlerScript,
                        type: 'POST', dataType: 'json',
                        data: {f: 'READ', n: stringName},
                        cache: false,
                        success: readReady,
                        error: errorHandler
                    }
                )
            }

            function readReady(callresult) {          
                if (callresult.error != undefined)
                    alert(callresult.error);
                else {
                    messages = JSON.parse(callresult.result);
                    showHighScore(messages);
                    infoContainer.style.animationName = 'info-show';
                }
            }

            function showHighScore(messages) {     
                var str = '',
                    infoContent = document.getElementById('info-content');

                str += '<ol>';
                for (let m = 0; m < messages.length; m++) {
                    let message = messages[m];
                    str += "<li>" + message.name + ":  " + message.score + "<li /><br>";
                }
                str += '</ol>';
                infoContent.innerHTML = str;
            }

            function errorHandler(statusStr, errorStr) {
                alert(statusStr + ' ' + errorStr);
            }

        }
    }

    self.hidePage = function () {                     //скрыть инфу
        if (document.getElementById('info-container')) {
            let infoContainer = document.getElementById('info-container');
            infoContainer.style.animationName = 'info-hide';
        }
    }

    self.updateTableHighScore = function () {                               //обновить таблицу в конце игры (если попали)

        function readHighScoreTable() {                                           //читаем данные о рекордах ajax
            updatePassword = Math.random();
            $.ajax({
                    url: ajaxHandlerScript,
                    type: 'POST', dataType: 'json',
                    data: {
                        f: 'LOCKGET', n: stringName,
                        p: updatePassword
                    },
                    cache: false,
                    success: lockGetReady,
                    error: errorHandler
                }
            )
        }

        function lockGetReady(callresult) {  // если набрали больше рекорда, добавляем
            if (callresult.error !== undefined) {
                alert(callresult.error);
            } else {
                messages = JSON.parse(callresult.result);
                if (readLast(messages)) {       //проверим, является ли текущее значение очков рекордом, и если да, запишем его в таблицу
                    showWriteYourNameWindow();   //спрашивает имя и просит ввести

                    function showWriteYourNameWindow() {   //функция спрашивает имя
                        let message = `Наши поздравления!!! Вы попали в таблицу рекордов, окончательный счет -  ` + scoreNumber + `  !<br> <br>Введите ваше имя:
                                       <input type='text' id='myName'><br />`;
                        self.showMessageBox(message);
                    }
                } else {
                    self.showMessageBox('Игра окончена. <br> К сожалению, вы не попали в таблицу рекордов. Попробуйте еще раз');
                    myModel.gameOver();
                }
            }
        }

        function readLast(messages) {              
            let lastHighScore = messages[messages.length - 1],
                scoreLastHighScore = lastHighScore.score;
            if (scoreNumber > scoreLastHighScore ||   //если текущее значение больше текущего минимального рекорда или рекордов меньше 10, записываем на сервер (или нет в обратном сл.)
                messages.length < 10) {    
                return true                         
            }
            return false
        }

        function errorHandler(statusStr, errorStr) {  //ошибка, не может сохранить
            alert(statusStr + ' ' + errorStr);
        }

        readHighScoreTable();
    }

    self.pushMessageToTableHighscore = function (nickname) {
        messages.push({'name': nickname, 'score': scoreNumber});

        function compare(a, b) {       //сортировка по очкам
            return b.score - a.score
        }

        messages.sort(compare);

        if (messages.length > 10) {
            messages = messages.slice(0, 10);   //сохраняем только 10 рекордов
        }
        $.ajax({                                                                   //пререпишем таблицу на сервере
                url: ajaxHandlerScript,
                type: 'POST', dataType: 'json',
                data: {
                    f: 'UPDATE', n: stringName,
                    v: JSON.stringify(messages), p: updatePassword
                },
                cache: false,
                success: updateReady,
                error: errorHandler
            }
        )
        myModel.gameOver();
    }

    function updateReady(callresult) {     // сохраняем таблицу на серваке  (в случае успеха)
        if (callresult.error != undefined)
            alert(callresult.error);
    }

    function errorHandler(statusStr, errorStr) {  //ошибка, не может сохранить
        alert(statusStr + ' ' + errorStr);
        myModel.gameOver();
    }

    self.showMessageBox = function (messageInnerHtml) {            //выводит  сообщение
        let messageContainer = document.getElementById('message-container');
        fillWithContent();
        messageContainer.style.animationName = 'message-show';

        function fillWithContent() {
            let messageContent = document.getElementById('message-content');
            messageContent.innerHTML = messageInnerHtml;
        }
    }

    self.hideMessageBox = function () {   //скрывает  сообщение
        if (document.getElementById('message-container')) {
            let messageContainer = document.getElementById('message-container');
            messageContainer.style.animationName = 'message-hide';
        }
    }
}



