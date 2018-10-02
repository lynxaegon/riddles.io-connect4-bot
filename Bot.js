const log = console.error;
const utils = require('./utils');
const BLOCKED = -1;
const EMPTY = 0;
const MINE = 1;


module.exports = {
    init: function(game){
        this.game = game;
    },
    move: function(){
        var moveList = [];
        var enemyMoveList = [];
        var result;
        for(var i in this.game.discs.me){
            result = this._checkVertical(this.game.discs.me[i]);
            moveList = !result ? moveList : moveList.concat(result);
            result = this._checkHorrizontal(this.game.discs.me[i]);
            moveList = !result ? moveList : moveList.concat(result);
        }

        // predict enemy
		for(var i in this.game.discs.enemy){
			result = this._checkVertical(this.game.discs.enemy[i]);
			enemyMoveList = !result ? enemyMoveList : enemyMoveList.concat(result);
			result = this._checkHorrizontal(this.game.discs.enemy[i]);
			enemyMoveList = !result ? enemyMoveList : enemyMoveList.concat(result);
		}

		var myMove = false, enemyMove = false;
        if(moveList.length > 0){
            moveList.sort(function(a, b) {
                return b.count - a.count;
            });
            // log("Available moves:", moveList);
            myMove = moveList[0];
        }

		if(enemyMoveList.length > 0){
			enemyMoveList.sort(function(a, b) {
				return b.count - a.count;
			});

			enemyMove = enemyMoveList[0];
		}

		var move = -1;
		var emptyColumns = [];

		for(var i in this.game.board[0]){
			if(this.game.board[0][i].value == this.game.constants.DISC_EMPTY) {
				emptyColumns.push(parseInt(i));
			}
		}
		log(myMove, enemyMove);
		if(myMove.count == 3){
			move = myMove.move;
			log("MY move count = 3", move);
		} else if(enemyMove.count == 3){
			move = enemyMove.move;
			log("Enemy move count = 3", move);
		} else if(myMove.count >= enemyMove.count){
			move = myMove.move;
			log("MY Move > Enemy Move", move);
		} else if(enemyMove.count > 1) {
			move = enemyMove.move;
			log("Enemy Move count > 1", move);
		} else {
			move = utils.getRandom(0, emptyColumns.length - 1);
			move = emptyColumns[move];
			log("Random move", move);
		}
		move = parseInt(move);

		if(emptyColumns.indexOf(move) == -1){
			log(emptyColumns);
			log("Tried", move,"but not empty. Randomizing again");
			move = utils.getRandom(0, emptyColumns.length - 1);
			move = emptyColumns[move];
		}

		log("MOVED DISC", move);

        return move;
    },
    _checkVertical: function(disc){
        if(disc.checkedVertical)
            return false;
            
        var availableMoves = [];
        var x = disc.x;
        var y = disc.y;
        var type = this.game.board[y][x].value;
        var otherType = -1;
        if(type == this.game.constants.DISC_ME)
            otherType = this.game.constants.DISC_ENEMY;
        else 
            otherType = this.game.constants.DISC_ME;
        
        var count = 0;
        var result;
        var direction = 1;
        function changeDirection(){
            direction = -1;
            y = disc.y + direction;
        }
        
        while(true){
            if(y < 0)
                break;
            if(y >= this.game.settings.height){
                changeDirection();
                continue;
            }
            result = this._isValid(x, y, otherType, "checkedVertical");
            if(result == BLOCKED){
                if(direction == -1){
                    break;
                }
                else {
                    changeDirection();
                    continue;
                }
            } else if(result == EMPTY){
                availableMoves.push({
                    count: count,
                    move: x
                });
                if(direction == -1){
                    break;
                }
                else {
                    changeDirection();
                    continue;
                }
            }
            
            count++;
            y += direction;
        }
        return availableMoves;
    },
    _checkHorrizontal: function(disc){
        if(disc.checkedHorrizontal)
            return false;
            
        var availableMoves = [];
        var x = disc.x;
        var y = disc.y;
        var type = this.game.board[y][x].value;
        var otherType = -1;
        if(type == this.game.constants.DISC_ME)
            otherType = this.game.constants.DISC_ENEMY;
        else 
            otherType = this.game.constants.DISC_ME;
        
        var count = 0;
        var result;
        var direction = 1;
        function changeDirection(){
            direction = -1;
            x = disc.x + direction;
        }
        
        while(true){
            if(x < 0)
                break;
            if(x >= this.game.settings.width){
                changeDirection();
                continue;
            }
            result = this._isValid(x, y, otherType, "checkedHorrizontal");
            if(result == BLOCKED){
                if(direction == -1){
                    break;
                }
                else {
                    changeDirection();
                    continue;
                }
            } else if(result == EMPTY){
                result = this._isValid(x, y + 1, otherType);
                // log("empty space", x, y + 1, result);
                if(result != EMPTY){
                    var canPut4 = true;
                    // log("checking for space", x, y, direction, count, 4 - count);
                    for(var i = 1; i <= 4 - count; i++){
                        result = this._isValid(x + (direction * i), y, otherType);
                        if(result != EMPTY){
                            canPut4 = false;
                            // log("not enaugh space for", x, y, direction, count, 4 - count);
                            break;
                        }
                    }
                    if(canPut4){
                        availableMoves.push({
                            count: count,
                            move: x
                        });
                    }
                }
                
                if(direction == -1){
                    break;
                }
                else {
                    changeDirection();
                    continue;
                }
            }
            
            count++;
            x += direction;
        }
        
        return availableMoves;
    },
    _isValid: function(x, y, otherType, checkedType){
        if(!this.game.board[y] || !this.game.board[y][x])
            return BLOCKED;
        if(this.game.board[y][x].value == this.game.constants.DISC_EMPTY)
            return EMPTY;
        if(this.game.board[y][x].value == otherType)
            return BLOCKED;
            
        if(checkedType)
            this.game.board[y][x][checkedType] = true;
        return MINE;
    }
};