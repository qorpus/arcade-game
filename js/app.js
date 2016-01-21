var GamePiece = function( spriteImage, maxColumns, maxRows, columnWidth, rowHeight, startX, startY, xRenderOffset, yRenderOffset ){
    this.sprite = spriteImage;
    this.startX = startX;
    this.startY = startY;
    this.maxRows = maxRows;
    this.maxColumns = maxColumns;
    this.maxX = maxColumns * columnWidth;
    this.maxY = maxRows * rowHeight;
    this.columnWidth = columnWidth;
    this.rowHeight = rowHeight;
    this.yRenderOffset = yRenderOffset;
    this.xRenderOffset = xRenderOffset;

    this.x = startX;
    this.y = startY;
};

GamePiece.prototype.update = function(dt){
    //do nothing, should be implemented in subclass to do specific work.
};

GamePiece.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x+this.xRenderOffset, this.y+this.yRenderOffset);
};

//moves a gamepiece
GamePiece.prototype.move = function( newX, newY ){
    if( this.checkNewPoistion( newX, newY ) ){
        this.x = newX;
        this.y = newY;
    }
};

//should be overridden in subclasses to do something specifc
GamePiece.prototype.checkNewPoistion = function( newX, newY ){
    return true;
};

//resets gamepiece to its original state.
GamePiece.prototype.reset = function(){
    this.x = this.startX;
    this.y = this.startY;
};

//should be overridden in subclasses to do something specific
GamePiece.prototype.handleCollision = function( collided ){
    //do nothing.
};

//used to determine the type, should only be implemented at a superclass level
GamePiece.prototype.getType = function(){
    return "GamePiece";
};


// Enemies our player must avoid
var Enemy = function( spriteImage, difficulty, row, maxColumns, maxRows, columnWidth, rowHeight ) {
    GamePiece.call( this, spriteImage, maxColumns, maxRows, columnWidth, rowHeight, -columnWidth, (rowHeight*row), 0, -rowHeight/5 );

    //sets the velocity randomly based on the difficulty
    this.velocity = difficulty*100*Math.random();
};


Enemy.prototype = Object.create(GamePiece.prototype);
Enemy.prototype.constructor = Enemy;

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
//overrides prototype.
Enemy.prototype.update = function(dt) {
    
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if( this.x > this.maxX ){
        this.reset();
    }
    this.move( this.x + ( this.velocity * dt ), this.y  );
};

Enemy.prototype.getType = function(){
    return "Enemy";
};


//bug subclass of enemy
var LadyBug = function( difficulty, row, maxColumns, maxRows, columnWidth, rowHeight ){
    Enemy.call(this, 'images/enemy-bug.png', difficulty, row, maxColumns, maxRows, columnWidth, rowHeight );
};

LadyBug.prototype = Object.create(Enemy.prototype);
LadyBug.prototype.constructor = LadyBug;

var NegateBug = function( difficulty, row, maxColumns, maxRows, columnWidth, rowHeight ){
    Enemy.call(this, 'images/enemy-bug-negate.png', difficulty, row, maxColumns, maxRows, columnWidth, rowHeight );
};

NegateBug.prototype = Object.create(Enemy.prototype);
NegateBug.prototype.constructor = NegateBug;

var GrayBug = function( difficulty, row, maxColumns, maxRows, columnWidth, rowHeight ){
    Enemy.call(this, 'images/enemy-bug-gray.png', difficulty, row, maxColumns, maxRows, columnWidth, rowHeight );
};

GrayBug.prototype = Object.create(Enemy.prototype);
GrayBug.prototype.constructor = GrayBug;



//gem super class
var Gem = function( spriteImage, maxColumns, maxRows, columnWidth, rowHeight ){
    GamePiece.call( this, spriteImage, maxColumns, maxRows, columnWidth, rowHeight, Math.floor((maxColumns-1)*Math.random())*columnWidth, (1+Math.floor((maxRows-3)*Math.random()))*rowHeight, 0, -rowHeight*0.35 );
};

Gem.prototype = Object.create(GamePiece.prototype);
Gem.prototype.constructor = Gem;

//should be overridden in subclasses to do something specific
Gem.prototype.handleCollision = function( collided ){
    gameApp.removeGem( this );
};

Gem.prototype.getType = function(){
    return "Gem";
};

//gem subclasses
var GreenGem = function( maxColumns, maxRows, columnWidth, rowHeight ){
    Gem.call( this, 'images/Gem Green.png', maxColumns, maxRows, columnWidth, rowHeight );
};

GreenGem.prototype = Object.create(Gem.prototype);
GreenGem.prototype.constructor = GreenGem;


var BlueGem = function( maxColumns, maxRows, columnWidth, rowHeight ){
    Gem.call( this, 'images/Gem Blue.png', maxColumns, maxRows, columnWidth, rowHeight );
};

BlueGem.prototype = Object.create(Gem.prototype);
BlueGem.prototype.constructor = BlueGem;


var OrangeGem = function( maxColumns, maxRows, columnWidth, rowHeight ){
    Gem.call( this, 'images/Gem Orange.png', maxColumns, maxRows, columnWidth, rowHeight );
};

OrangeGem.prototype = Object.create(Gem.prototype);
OrangeGem.prototype.constructor = OrangeGem;


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function( spriteImage, maxColumns, maxRows, columnWidth, rowHeight ){

    GamePiece.call( this, spriteImage, maxColumns, maxRows, columnWidth, rowHeight, Math.floor(maxColumns/2)*columnWidth, rowHeight*(maxRows-1), 0, -(rowHeight/3) );

};

Player.prototype = Object.create(GamePiece.prototype);
Player.prototype.constructor = Player;

Player.prototype.handleInput = function(key){
    if( key == 'left' ){
        this.move( this.x - this.columnWidth, this.y );
    } else if ( key == 'right' ){
        this.move( this.x + this.columnWidth, this.y );
    } else if ( key == 'up' ){
        this.move( this.x, this.y - this.rowHeight );
    } else if ( key == 'down' ) {
        this.move( this.x, this.y + this.rowHeight );
    }
};

Player.prototype.checkNewPoistion = function(newX, newY){
    if( newY < this.rowHeight ){
        gameApp.success();
        return false; //no need to move now.
    }

    return ( newX >= 0 && newX < this.maxX && newY < this.maxY );

};

Player.prototype.handleCollision = function( collided ){
    if( collided.getType() == "Enemy" ){
        gameApp.fail();
    } else if ( collided.getType() == "Gem" ){
        gameApp.icrementGemScore();
    }

    
};

/*
 * Game application class
 * has standard methods for game
 *
 *
 */
var GameApp = function( enemyCount, gemCount, startDifficulty, maxColumns, maxRows, rowHeight, columnWidth, startTimer ){
    this.enemyCount = enemyCount;
    this.startDifficulty = startDifficulty;
    this.maxColumns = maxColumns;
    this.maxRows = maxRows;
    this.rowHeight = rowHeight;
    this.columnWidth = columnWidth;
    this.startTimer = startTimer;
    this.timer = startTimer;
    this.allGamePieces = [];
    this.player = null;
    this.textRenderY = maxRows*rowHeight+(rowHeight-5);
    this.gemCount = gemCount;
};


GameApp.prototype.resetPieces = function(){

    this.allGamePieces = [];
    
    this.addGamePieces();

    // Place the player object in a variable called player
    this.player = new Player('images/char-horn-girl.png', this.maxColumns, this.maxRows, this.columnWidth, this.rowHeight);

};


GameApp.prototype.addGamePieces = function(){
    this.addEnemies();
    this.addGems();
};

GameApp.prototype.addEnemies = function(){
    for( var i = 0; i < this.enemyCount; i++ ){
        var random = Math.ceil(Math.random()*3); //generate a random number between 1 and 3
        var theEnemy = null;
        switch( random ) {  //use the random to select which gem to create
            case ( 1 ):
                theEnemy = new LadyBug( this.difficulty, this.randomGamePieceRow(), this.maxColumns, this.maxRows, this.columnWidth, this.rowHeight );
            break;
            case ( 2 ):
                theEnemy = new NegateBug( this.difficulty, this.randomGamePieceRow(), this.maxColumns, this.maxRows, this.columnWidth, this.rowHeight );
            break;
            case ( 3 ):
            default:
                theEnemy = new GrayBug( this.difficulty, this.randomGamePieceRow(), this.maxColumns, this.maxRows, this.columnWidth, this.rowHeight );
            break;
        }
        this.allGamePieces.push(theEnemy);
    }
};

GameApp.prototype.randomGamePieceRow = function(){
    return 1 + Math.floor(Math.random()*(this.maxRows-3));
};

GameApp.prototype.addGems = function(){
    for( var i = 0; i < this.gemCount; i++ ){
        var random = Math.ceil(Math.random()*3); //generate a random number between 1 and 3
        var theGem = null;
        switch( random ) {  //use the random to select which gem to create
            case ( 1 ):
                theGem = new GreenGem( maxColumns, maxRows, columnWidth, rowHeight );
            break;
            case ( 2 ):
                theGem = new BlueGem( maxColumns, maxRows, columnWidth, rowHeight );
            break;
            case ( 3 ):
            default:
                theGem = new OrangeGem( maxColumns, maxRows, columnWidth, rowHeight );
            break;
        }
        this.allGamePieces.push(theGem);
    }
};

GameApp.prototype.icrementGemScore = function(){
    this.score += 50;
};

GameApp.prototype.removeGem = function( gem ){
    for(var i in this.allGamePieces){
        if( this.allGamePieces[i] === gem ){
            this.allGamePieces.splice( i, 1 );
            return;
        }
    }
};

GameApp.prototype.resetTimer = function(){
    this.timer = this.startTimer;
};

GameApp.prototype.resetDifficulty = function(){
    this.difficulty = this.startDifficulty;
};

GameApp.prototype.resetScore = function(){
    this.score = 0;
};

GameApp.prototype.update = function(dt){
    //subject time from timer
    this.timer -= dt;
    if( this.timer <= 0 ){
        this.start();  //reset the game completely.
    }
};

GameApp.prototype.renderTimer = function(){
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Time Left: " + Math.round(this.timer, 2), this.maxColumns*this.columnWidth*0.60 , this.textRenderY);
};

GameApp.prototype.renderScore = function(){
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + this.score , 5, this.textRenderY);  
};



GameApp.prototype.success = function(){
    this.score += 10;
    this.difficulty += 1;
    this.resetPieces();
};

GameApp.prototype.fail = function(){
    this.score -= 10;
    this.player.reset();
};

/*
 * Starts the game, inializes all the game pieces and the player.
 */
GameApp.prototype.start = function(){
    this.resetScore();
    this.resetDifficulty();
    this.resetTimer();
    this.resetPieces();
};



// Now instantiate your objects.
// Place all enemy objects in an array called allGamePieces
var enemyCount = 4;
var difficulty = 1;
var maxColumns = 5;
var maxRows = 6;
var rowHeight = 83;
var columnWidth = 101;
var timer = 30;
var gemCount = 2;

var gameApp = new GameApp( enemyCount, gemCount, difficulty, maxColumns, maxRows, rowHeight, columnWidth, timer );

gameApp.start();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    gameApp.player.handleInput(allowedKeys[e.keyCode]);
});
