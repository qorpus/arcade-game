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

    console.log("Start Y: " + startY);

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
GamePiece.prototype.checkNewPoistion = function( newY, newY ){
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




// Enemies our player must avoid
var Enemy = function( spriteImage, difficulty, row, maxColumns, maxRows, columnWidth, rowHeight ) {


//function( spriteImage, maxColumns, maxRows, columnWidth, rowHeight, startX, startY )

    GamePiece.call( this, spriteImage, maxColumns, maxRows, columnWidth, rowHeight, -columnWidth, (rowHeight*row), 0, -rowHeight/5 );

    //sets the velocity randomly based on the difficulty
    this.velocity = 100*( Math.random() * difficulty );
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


//Lady bug subclass of enemy
var LadyBug = function( difficulty, row, maxColumns, maxRows, columnWidth, rowHeight ){
    Enemy.call(this, 'images/enemy-bug.png', difficulty, row, maxColumns, maxRows, columnWidth, rowHeight )
};

LadyBug.prototype = Object.create(Enemy.prototype);
LadyBug.prototype.constructor = LadyBug;

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
    console.log("new pos: (" + newX + "," + newY + ")");
    if( newY < this.rowHeight ){
        this.reset();
        return false; //no need to move now.
    }

    return ( newX >= 0 && newX < this.maxX && newY < this.maxY );

};

Player.prototype.handleCollision = function( collided ){
   // this.reset();
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
var enemyCount = 1;
var difficulty = 1;
var maxColumns = 5;
var maxRows = 6;
var rowHeight = 83;
var columnWidth = 101;

var allEnemies = [];


while( allEnemies.length < enemyCount ) {

    allEnemies.push( new LadyBug( difficulty, 1 + Math.floor(Math.random()*maxRows-2), maxColumns, maxRows, columnWidth, rowHeight ) );

}

// Place the player object in a variable called player
var player = new Player('images/char-horn-girl.png', maxColumns, maxRows, columnWidth, rowHeight);


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
