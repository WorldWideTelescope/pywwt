// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Basic color types.

import { registerType } from "./typesystem.js";
import { ss } from "./ss.js";
import { Util } from "./util.js";

// wwtlib.Color

export function Color() {
    this.a = 255;
    this.b = 255;
    this.g = 255;
    this.r = 255;
    this.name = '';
}

Color.fromArgb = function (a, r, g, b) {
    var temp = new Color();
    temp.a = a;
    temp.r = r;
    temp.g = g;
    temp.b = b;
    return temp;
};

Color._fromArgbColor = function (a, col) {
    var temp = new Color();
    temp.a = a;
    temp.r = col.r;
    temp.g = col.g;
    temp.b = col.b;
    return temp;
};

Color.fromName = function (name) {
    var temp = Color.load(name);
    return temp;
};

Color.load = function (color) {
    var a = 255, r = 255, g = 255, b = 255;
    var pieces = color.split(':');
    if (pieces.length === 5) {
        a = parseInt(pieces[1]);
        r = parseInt(pieces[2]);
        g = parseInt(pieces[3]);
        b = parseInt(pieces[4]);
    }
    else if (pieces.length === 2) {
        return Color.fromName(pieces[1].toLowerCase());
    }
    else if (pieces.length === 1 && ss.startsWith(pieces[0], '#')) {
        return Color.fromHex(pieces[0]);
    }
    else if (pieces.length === 1 && pieces[0].length === 8) {
        return Color.fromSimpleHex(pieces[0]);
    }
    else if (pieces.length === 1) {
        return Color._fromWindowsNamedColor(pieces[0]);
    }
    return Color.fromArgb(a, r, g, b);
};

Color._fromWindowsNamedColor = function (color) {
    switch (color.toLowerCase()) {
        case 'activeborder':
            return Color.fromArgb(255, 180, 180, 180);
        case 'activecaption':
            return Color.fromArgb(255, 153, 180, 209);
        case 'activecaptiontext':
            return Color.fromArgb(255, 0, 0, 0);
        case 'appworkspace':
            return Color.fromArgb(255, 171, 171, 171);
        case 'control':
            return Color.fromArgb(255, 240, 240, 240);
        case 'controldark':
            return Color.fromArgb(255, 160, 160, 160);
        case 'controldarkdark':
            return Color.fromArgb(255, 105, 105, 105);
        case 'controllight':
            return Color.fromArgb(255, 227, 227, 227);
        case 'controllightlight':
            return Color.fromArgb(255, 255, 255, 255);
        case 'controltext':
            return Color.fromArgb(255, 0, 0, 0);
        case 'desktop':
            return Color.fromArgb(255, 255, 255, 255);
        case 'graytext':
            return Color.fromArgb(255, 109, 109, 109);
        case 'highlight':
            return Color.fromArgb(255, 51, 153, 255);
        case 'highlighttext':
            return Color.fromArgb(255, 255, 255, 255);
        case 'hottrack':
            return Color.fromArgb(255, 0, 102, 204);
        case 'inactiveborder':
            return Color.fromArgb(255, 244, 247, 252);
        case 'inactivecaption':
            return Color.fromArgb(255, 191, 205, 219);
        case 'inactivecaptiontext':
            return Color.fromArgb(255, 0, 0, 0);
        case 'info':
            return Color.fromArgb(255, 255, 255, 225);
        case 'infotext':
            return Color.fromArgb(255, 0, 0, 0);
        case 'menu':
            return Color.fromArgb(255, 240, 240, 240);
        case 'menutext':
            return Color.fromArgb(255, 0, 0, 0);
        case 'scrollbar':
            return Color.fromArgb(255, 200, 200, 200);
        case 'window':
            return Color.fromArgb(255, 255, 255, 255);
        case 'windowframe':
            return Color.fromArgb(255, 100, 100, 100);
        case 'windowtext':
            return Color.fromArgb(255, 0, 0, 0);
        case 'transparent':
            return Color.fromArgb(0, 255, 255, 255);
        case 'aliceblue':
            return Color.fromArgb(255, 240, 248, 255);
        case 'antiquewhite':
            return Color.fromArgb(255, 250, 235, 215);
        case 'aqua':
            return Color.fromArgb(255, 0, 255, 255);
        case 'aquamarine':
            return Color.fromArgb(255, 127, 255, 212);
        case 'azure':
            return Color.fromArgb(255, 240, 255, 255);
        case 'beige':
            return Color.fromArgb(255, 245, 245, 220);
        case 'bisque':
            return Color.fromArgb(255, 255, 228, 196);
        case 'black':
            return Color.fromArgb(255, 0, 0, 0);
        case 'blanchedalmond':
            return Color.fromArgb(255, 255, 235, 205);
        case 'blue':
            return Color.fromArgb(255, 0, 0, 255);
        case 'blueviolet':
            return Color.fromArgb(255, 138, 43, 226);
        case 'brown':
            return Color.fromArgb(255, 165, 42, 42);
        case 'burlywood':
            return Color.fromArgb(255, 222, 184, 135);
        case 'cadetblue':
            return Color.fromArgb(255, 95, 158, 160);
        case 'chartreuse':
            return Color.fromArgb(255, 127, 255, 0);
        case 'chocolate':
            return Color.fromArgb(255, 210, 105, 30);
        case 'coral':
            return Color.fromArgb(255, 255, 127, 80);
        case 'cornflowerblue':
            return Color.fromArgb(255, 100, 149, 237);
        case 'cornsilk':
            return Color.fromArgb(255, 255, 248, 220);
        case 'crimson':
            return Color.fromArgb(255, 220, 20, 60);
        case 'cyan':
            return Color.fromArgb(255, 0, 255, 255);
        case 'darkblue':
            return Color.fromArgb(255, 0, 0, 139);
        case 'darkcyan':
            return Color.fromArgb(255, 0, 139, 139);
        case 'darkgoldenrod':
            return Color.fromArgb(255, 184, 134, 11);
        case 'darkgray':
            return Color.fromArgb(255, 169, 169, 169);
        case 'darkgreen':
            return Color.fromArgb(255, 0, 100, 0);
        case 'darkkhaki':
            return Color.fromArgb(255, 189, 183, 107);
        case 'darkmagenta':
            return Color.fromArgb(255, 139, 0, 139);
        case 'darkolivegreen':
            return Color.fromArgb(255, 85, 107, 47);
        case 'darkorange':
            return Color.fromArgb(255, 255, 140, 0);
        case 'darkorchid':
            return Color.fromArgb(255, 153, 50, 204);
        case 'darkred':
            return Color.fromArgb(255, 139, 0, 0);
        case 'darksalmon':
            return Color.fromArgb(255, 233, 150, 122);
        case 'darkseagreen':
            return Color.fromArgb(255, 143, 188, 139);
        case 'darkslateblue':
            return Color.fromArgb(255, 72, 61, 139);
        case 'darkslategray':
            return Color.fromArgb(255, 47, 79, 79);
        case 'darkturquoise':
            return Color.fromArgb(255, 0, 206, 209);
        case 'darkviolet':
            return Color.fromArgb(255, 148, 0, 211);
        case 'deeppink':
            return Color.fromArgb(255, 255, 20, 147);
        case 'deepskyblue':
            return Color.fromArgb(255, 0, 191, 255);
        case 'dimgray':
            return Color.fromArgb(255, 105, 105, 105);
        case 'dodgerblue':
            return Color.fromArgb(255, 30, 144, 255);
        case 'firebrick':
            return Color.fromArgb(255, 178, 34, 34);
        case 'floralwhite':
            return Color.fromArgb(255, 255, 250, 240);
        case 'forestgreen':
            return Color.fromArgb(255, 34, 139, 34);
        case 'fuchsia':
            return Color.fromArgb(255, 255, 0, 255);
        case 'gainsboro':
            return Color.fromArgb(255, 220, 220, 220);
        case 'ghostwhite':
            return Color.fromArgb(255, 248, 248, 255);
        case 'gold':
            return Color.fromArgb(255, 255, 215, 0);
        case 'goldenrod':
            return Color.fromArgb(255, 218, 165, 32);
        case 'gray':
            return Color.fromArgb(255, 128, 128, 128);
        case 'green':
            return Color.fromArgb(255, 0, 128, 0);
        case 'greenyellow':
            return Color.fromArgb(255, 173, 255, 47);
        case 'honeydew':
            return Color.fromArgb(255, 240, 255, 240);
        case 'hotpink':
            return Color.fromArgb(255, 255, 105, 180);
        case 'indianred':
            return Color.fromArgb(255, 205, 92, 92);
        case 'indigo':
            return Color.fromArgb(255, 75, 0, 130);
        case 'ivory':
            return Color.fromArgb(255, 255, 255, 240);
        case 'khaki':
            return Color.fromArgb(255, 240, 230, 140);
        case 'lavender':
            return Color.fromArgb(255, 230, 230, 250);
        case 'lavenderblush':
            return Color.fromArgb(255, 255, 240, 245);
        case 'lawngreen':
            return Color.fromArgb(255, 124, 252, 0);
        case 'lemonchiffon':
            return Color.fromArgb(255, 255, 250, 205);
        case 'lightblue':
            return Color.fromArgb(255, 173, 216, 230);
        case 'lightcoral':
            return Color.fromArgb(255, 240, 128, 128);
        case 'lightcyan':
            return Color.fromArgb(255, 224, 255, 255);
        case 'lightgoldenrodyellow':
            return Color.fromArgb(255, 250, 250, 210);
        case 'lightgray':
            return Color.fromArgb(255, 211, 211, 211);
        case 'lightgreen':
            return Color.fromArgb(255, 144, 238, 144);
        case 'lightpink':
            return Color.fromArgb(255, 255, 182, 193);
        case 'lightsalmon':
            return Color.fromArgb(255, 255, 160, 122);
        case 'lightseagreen':
            return Color.fromArgb(255, 32, 178, 170);
        case 'lightskyblue':
            return Color.fromArgb(255, 135, 206, 250);
        case 'lightslategray':
            return Color.fromArgb(255, 119, 136, 153);
        case 'lightsteelblue':
            return Color.fromArgb(255, 176, 196, 222);
        case 'lightyellow':
            return Color.fromArgb(255, 255, 255, 224);
        case 'lime':
            return Color.fromArgb(255, 0, 255, 0);
        case 'limegreen':
            return Color.fromArgb(255, 50, 205, 50);
        case 'linen':
            return Color.fromArgb(255, 250, 240, 230);
        case 'magenta':
            return Color.fromArgb(255, 255, 0, 255);
        case 'maroon':
            return Color.fromArgb(255, 128, 0, 0);
        case 'mediumaquamarine':
            return Color.fromArgb(255, 102, 205, 170);
        case 'mediumblue':
            return Color.fromArgb(255, 0, 0, 205);
        case 'mediumorchid':
            return Color.fromArgb(255, 186, 85, 211);
        case 'mediumpurple':
            return Color.fromArgb(255, 147, 112, 219);
        case 'mediumseagreen':
            return Color.fromArgb(255, 60, 179, 113);
        case 'mediumslateblue':
            return Color.fromArgb(255, 123, 104, 238);
        case 'mediumspringgreen':
            return Color.fromArgb(255, 0, 250, 154);
        case 'mediumturquoise':
            return Color.fromArgb(255, 72, 209, 204);
        case 'mediumvioletred':
            return Color.fromArgb(255, 199, 21, 133);
        case 'midnightblue':
            return Color.fromArgb(255, 25, 25, 112);
        case 'mintcream':
            return Color.fromArgb(255, 245, 255, 250);
        case 'mistyrose':
            return Color.fromArgb(255, 255, 228, 225);
        case 'moccasin':
            return Color.fromArgb(255, 255, 228, 181);
        case 'navajowhite':
            return Color.fromArgb(255, 255, 222, 173);
        case 'navy':
            return Color.fromArgb(255, 0, 0, 128);
        case 'oldlace':
            return Color.fromArgb(255, 253, 245, 230);
        case 'olive':
            return Color.fromArgb(255, 128, 128, 0);
        case 'olivedrab':
            return Color.fromArgb(255, 107, 142, 35);
        case 'orange':
            return Color.fromArgb(255, 255, 165, 0);
        case 'orangered':
            return Color.fromArgb(255, 255, 69, 0);
        case 'orchid':
            return Color.fromArgb(255, 218, 112, 214);
        case 'palegoldenrod':
            return Color.fromArgb(255, 238, 232, 170);
        case 'palegreen':
            return Color.fromArgb(255, 152, 251, 152);
        case 'paleturquoise':
            return Color.fromArgb(255, 175, 238, 238);
        case 'palevioletred':
            return Color.fromArgb(255, 219, 112, 147);
        case 'papayawhip':
            return Color.fromArgb(255, 255, 239, 213);
        case 'peachpuff':
            return Color.fromArgb(255, 255, 218, 185);
        case 'peru':
            return Color.fromArgb(255, 205, 133, 63);
        case 'pink':
            return Color.fromArgb(255, 255, 192, 203);
        case 'plum':
            return Color.fromArgb(255, 221, 160, 221);
        case 'powderblue':
            return Color.fromArgb(255, 176, 224, 230);
        case 'purple':
            return Color.fromArgb(255, 128, 0, 128);
        case 'red':
            return Color.fromArgb(255, 255, 0, 0);
        case 'rosybrown':
            return Color.fromArgb(255, 188, 143, 143);
        case 'royalblue':
            return Color.fromArgb(255, 65, 105, 225);
        case 'saddlebrown':
            return Color.fromArgb(255, 139, 69, 19);
        case 'salmon':
            return Color.fromArgb(255, 250, 128, 114);
        case 'sandybrown':
            return Color.fromArgb(255, 244, 164, 96);
        case 'seagreen':
            return Color.fromArgb(255, 46, 139, 87);
        case 'seashell':
            return Color.fromArgb(255, 255, 245, 238);
        case 'sienna':
            return Color.fromArgb(255, 160, 82, 45);
        case 'silver':
            return Color.fromArgb(255, 192, 192, 192);
        case 'skyblue':
            return Color.fromArgb(255, 135, 206, 235);
        case 'slateblue':
            return Color.fromArgb(255, 106, 90, 205);
        case 'slategray':
            return Color.fromArgb(255, 112, 128, 144);
        case 'snow':
            return Color.fromArgb(255, 255, 250, 250);
        case 'springgreen':
            return Color.fromArgb(255, 0, 255, 127);
        case 'steelblue':
            return Color.fromArgb(255, 70, 130, 180);
        case 'tan':
            return Color.fromArgb(255, 210, 180, 140);
        case 'teal':
            return Color.fromArgb(255, 0, 128, 128);
        case 'thistle':
            return Color.fromArgb(255, 216, 191, 216);
        case 'tomato':
            return Color.fromArgb(255, 255, 99, 71);
        case 'turquoise':
            return Color.fromArgb(255, 64, 224, 208);
        case 'violet':
            return Color.fromArgb(255, 238, 130, 238);
        case 'wheat':
            return Color.fromArgb(255, 245, 222, 179);
        case 'white':
            return Color.fromArgb(255, 255, 255, 255);
        case 'whitesmoke':
            return Color.fromArgb(255, 245, 245, 245);
        case 'yellow':
            return Color.fromArgb(255, 255, 255, 0);
        case 'yellowgreen':
            return Color.fromArgb(255, 154, 205, 50);
        case 'buttonface':
            return Color.fromArgb(255, 240, 240, 240);
        case 'buttonhighlight':
            return Color.fromArgb(255, 255, 255, 255);
        case 'buttonshadow':
            return Color.fromArgb(255, 160, 160, 160);
        case 'gradientactivecaption':
            return Color.fromArgb(255, 185, 209, 234);
        case 'gradientinactivecaption':
            return Color.fromArgb(255, 215, 228, 242);
        case 'menubar':
            return Color.fromArgb(255, 240, 240, 240);
        case 'menuhighlight':
            return Color.fromArgb(255, 51, 153, 255);
    }
    return Color.fromArgb(255, 255, 255, 255);
};

Color.fromHex = function (data) {
    var r = Util.fromHex(data.substr(1, 2));
    var g = Util.fromHex(data.substr(3, 2));
    var b = Util.fromHex(data.substr(5, 2));
    var a = 255;
    return Color.fromArgb(a, r, g, b);
};

Color.fromSimpleHex = function (data) {
    var a = Util.fromHex(data.substr(0, 2));
    var r = Util.fromHex(data.substr(2, 2));
    var g = Util.fromHex(data.substr(4, 2));
    var b = Util.fromHex(data.substr(6, 2));
    return Color.fromArgb(a, r, g, b);
};

Color.fromInt = function (color) {
    var r = (color & 4278190080) >>> 24;
    var g = (color & 16711680) >>> 16;
    var b = (color & 65280) >>> 8;
    var a = (color & 255);
    return Color.fromArgb(a, r, g, b);
};

var Color$ = {
    toFormat: function () {
        if (ss.emptyString(this.name)) {
            return ss.format('rgb({0},{1},{2})', this.r.toString(), this.g.toString(), this.b.toString());
        }
        else {
            return this.name;
        }
    },

    save: function () {
        if (!ss.emptyString(this.name)) {
            return ss.format('{0}:{1}', 0, this.name);
        }
        else {
            return ss.format('{0}:{1}:{2}:{3}:{4}', 1, this.a, this.r, this.g, this.b);
        }
    },

    toString: function () {
        if (ss.emptyString(this.name)) {
            return ss.format('#{0}{1}{2}', Util.toHex(this.r), Util.toHex(this.g), Util.toHex(this.b));
        }
        else {
            return this.name;
        }
    },

    toSimpleHex: function () {
        if (ss.emptyString(this.name)) {
            return ss.format('{0}{1}{2}{3}', Util.toHex(this.a), Util.toHex(this.r), Util.toHex(this.g), Util.toHex(this.b));
        }
        else {
            return this.name;
        }
    },

    _clone: function () {
        return Color.fromArgb(this.a, this.r, this.g, this.b);
    }
};

registerType("Color", [Color, Color$, null]);


// wwtlib.Colors

export function Colors() { }

Colors.get_black = function () {
    return Color.fromArgb(255, 0, 0, 0);
};

Colors.get_blue = function () {
    return Color.fromArgb(255, 0, 0, 255);
};

Colors.get_brown = function () {
    return Color.fromArgb(255, 165, 42, 42);
};

Colors.get_cyan = function () {
    return Color.fromArgb(255, 0, 255, 255);
};

Colors.get_darkGray = function () {
    return Color.fromArgb(255, 169, 169, 169);
};

Colors.get_gray = function () {
    return Color.fromArgb(255, 128, 128, 128);
};

Colors.get_green = function () {
    return Color.fromArgb(255, 0, 255, 0);
};

Colors.get_lightGray = function () {
    return Color.fromArgb(255, 211, 211, 211);
};

Colors.get_magenta = function () {
    return Color.fromArgb(255, 255, 0, 255);
};

Colors.get_orange = function () {
    return Color.fromArgb(255, 255, 165, 0);
};

Colors.get_purple = function () {
    return Color.fromArgb(255, 128, 0, 128);
};

Colors.get_red = function () {
    return Color.fromArgb(255, 255, 0, 0);
};

Colors.get_transparent = function () {
    return Color.fromArgb(0, 255, 255, 255);
};

Colors.get_white = function () {
    return Color.fromArgb(255, 255, 255, 255);
};

Colors.get_yellow = function () {
    return Color.fromArgb(255, 255, 255, 0);
};

var Colors$ = {};

registerType("Colors", [Colors, Colors$, null]);
