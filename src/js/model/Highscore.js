module.exports = Highscore;

var Lockr = require('lockr');

function Highscore(level, max) {
    this.level = level;
    this.max = max;
    this.data = Lockr.get(level);
    if (!this.data) {
        this.data = [];
    }
}

Highscore.prototype.newScore = function (name, score) {
    this.insert({name: name, score: score});
    this.save();
};

Highscore.prototype.insert = function (newData) {

    for (var i = 0; i < this.max; i++) {
        if (this.data[i] === undefined) {
            this.data.push(newData);
            return;
        }
        if (newData.score > this.data[i].score) {
            if (this.data.length === this.max) {
                this.data.pop();
            }
            this.data.splice(i, 0, newData);
            return;
        }
    }
};

Highscore.prototype.save = function () {
    Lockr.set(this.level, this.data);
};
