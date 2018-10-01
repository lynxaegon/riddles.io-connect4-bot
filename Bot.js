const log = console.error;
const utils = require('./utils');

module.exports = {
    init: function(game){
        this.game = game;
    },
    move: function(){
        log("Random move");
        return utils.getRandom(0, this.game.settings.width - 1);
    }
};
