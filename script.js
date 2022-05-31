let gameController = new Controller,
gameModel = new Model,
gameView = new View

gameModel.init(gameView, gameController)
gameView.start(gameModel)
gameController.init(gameModel, gameView)

function sendName() {           //отправить имя  в таблицу рекордов
if (document.getElementById('myName') !== null) {
    let nickName = document.getElementById('myName').value
    gameView.pushMessageToTableHighscore(nickName)
}
}