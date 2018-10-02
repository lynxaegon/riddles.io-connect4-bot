/**
 * __main__
 */

const readline = require('readline');
const log = console.error;

const game = {
    settings: {},
    constants: {
        DISC_EMPTY: ".",
        DISC_ME: -1,
        DISC_ENEMY: -1
    },
    board: [],
    discs: {
        me: [],
        enemy: []
    }
};
const BOT = require("./Bot");

function run() {
    this.io = readline.createInterface(process.stdin, process.stdout);
    this.io.on('line', function(data){
        data = data.split(" ");
        var type = data.shift();
        var cmd = data.shift();
        switch(type){
            case "settings":
                switch(cmd){
                    case "player_names":
                        game.settings.players = data.shift().split(",");
                        break;
                    case "your_bot":
                        game.settings.me = data.shift();
                        game.constants.DISC_ME = game.settings.players.indexOf(game.settings.me);
                        game.constants.DISC_ENEMY = game.constants.DISC_ME == 0 ? 1 : 0;
                        break;
                    case "field_width":
                        game.settings.width = parseInt(data.shift());
                        break;
                    case "field_height":
                        game.settings.height = parseInt(data.shift());
                        break;
                    default:
                        game.settings[cmd] = data.shift();
                }
                break;
            case "update":
                if(cmd == "game"){
                    cmd = data.shift();
                    if(cmd == "round"){
                        game.round = parseInt(data.shift());
                    }
                    else if(cmd == "field"){
                        game.board = [];
                        game.discs = {
                            me: [],
                            enemy: []
                        }
                        
                        var values = data.shift();
                        values = values.split(",");
                        var disc;
                        for(var i = 0; i < game.settings.height; i++){
                            for(var j = 0; j < game.settings.width; j++){
                                if(!game.board[i])
                                    game.board[i] = [];
                                if(!game.board[i][j])
                                    game.board[i][j] = [];
                                
                                disc = {
                                    value: values[i * game.settings.width + j],
                                    x: j,
                                    y: i
                                };
                                game.board[i][j] = disc;
                                // user checks
                                if(disc.value == game.constants.DISC_ENEMY){
                                    game.discs.enemy.push(disc);
                                } else if(disc.value == game.constants.DISC_ME){
                                    game.discs.me.push(disc);
                                }
                            }
                        }
                    }        
                }
                break;
            case "action":
                if(cmd == "move"){
                    BOT.init(game);
                    console.log("place_disc", BOT.move());
                }
                break;
        }
    });
}

run();