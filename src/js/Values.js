module.exports = Values;

var Lockr = require('lockr');

Values.HIGHSCORESIZE = 100;
Values.MAXBUTTONS = 3;
Values.DELAY = 5000;
Values.HIGHWAYMAXWIDTH = 650;
Values.COLORS = [
    {c1: '#c21f1f', c2: '#fe6666'},
    {c1: 'green', c2: 'lightgreen'},
    {c1: '#004CB3', c2: '#8ED6FF'}
];


// key{primary:,secondary:}
Values.control = {
    k1: {p: "1", s: "ArrowLeft"},
    k2: {p: "2", s: "ArrowDown"},
    k3: {p: "3", s: "ArrowRight"},
    pause: {p: "p", s: "Escape"},
    fullscreen: {p: "f", s: ""}
};

Values.loadOptions = function () {
    var c = Lockr.get("control");
    if (c)
        Values.control = Lockr.get("control");
};

Values.saveOptions = function (control) {
    Values.control = control;
    Lockr.set("control", control);
};

function Values() {}
;