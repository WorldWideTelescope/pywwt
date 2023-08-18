// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Miscellaneous utilities.

import { registerType } from "./typesystem.js";
import { ss } from "./ss.js";

// wwtlib.Util

export function Util() {
}

Util.splitString = function (target, split) {
    var parts = [];
    var start = 0;
    var end = 0;
    for (var i = 0; i < target.length; i++) {
        var found = false;
        for (var j = 0; j < split.length; j++) {
            if (target[i] === split[j]) {
                parts.push(target.substring(start, end - start));
                found = true;
                continue;
            }
            start = i + 1;
            end = i + 1;
        }
        if (!found) {
            end++;
        }
    }
    if (end > start) {
        parts.push(target.substring(start, end - start));
    }
    return parts;
};

Util.stringContains = function (target, chars) {
    for (var i = 0; i < chars.length; i++) {
        if (target.indexOf(chars[i]) > -1) {
            return true;
        }
    }
    return false;
};

Util.getHashCode = function (target) {
    var hash = 0;
    if (!target.length) {
        return hash;
    }
    for (var i = 0; i < target.length; i++) {
        var c = target.charCodeAt(i);
        hash = ((hash << 5) - hash) + c;
    }
    return hash;
};

Util.compare = function (l, r) {
    if (l === r) {
        return 0;
    }
    if (l > r) {
        return 1;
    }
    return -1;
};

Util.logN = function (num, b) {
    return Math.log(num) / Math.log(b);
};

// Parse timespan into int with milliseconds
Util.parseTimeSpan = function (timespan) {
    var val = 0;
    var parts = timespan.split(':');
    if (parts.length === 3) {
        val += parseInt(parts[0]) * 3600000;
        val += parseInt(parts[1]) * 60000;
        val += ss.truncate((parseFloat(parts[2]) * 1000));
    }
    return val;
};

// convert duration to HH:MM:SS.S
Util.xmlDuration = function (duration) {
    var s = duration / 1000;
    var hours = Math.floor(s / 3600);
    var min = Math.floor(s / 60) - (hours * 60);
    var sec = s - ((hours * 3600) + min * 60);
    return ss.format('{0}:{1}:{2}', hours, min, sec);
};

Util.xmlDate = function (d) {
    var hours = d.getHours();
    var amPm = 'AM';
    if (hours > 12) {
        hours -= 12;
        amPm = 'PM';
    }
    return (d.getMonth() + 1).toString() + '/' + d.getDate().toString() + '/' + d.getFullYear().toString() + ' ' + hours.toString() + ':' + d.getMinutes().toString() + ':' + d.getSeconds().toString() + ' ' + amPm;
};

Util.selectSingleNode = function (parent, name) {
    var node = null;
    var $enum1 = ss.enumerate(parent.childNodes);
    while ($enum1.moveNext()) {
        var child = $enum1.current;
        if (child.nodeName === name) {
            node = child;
            break;
        }
    }
    return node;
};

Util.getInnerText = function (node) {
    if (ss.emptyString(node.text)) {
        var cn = node;
        return cn.textContent;
    }
    else {
        return node.text;
    }
};

Util.getWrappedText = function (ctx, text, width) {
    var lines = [];
    lines.push(text);
    return lines;
};

Util.toHex = function (number) {
    var num = Math.max(0, Math.min(ss.truncate(number), 255));
    return '0123456789ABCDEF'.substr((num - num % 16) / 16, 1) + '0123456789ABCDEF'.substr(num % 16, 1);
};

Util.fromHex = function (data) {
    var val = 0;
    switch (data.substr(1, 1).toUpperCase()) {
        case 'A':
            val += 10;
            break;
        case 'B':
            val += 11;
            break;
        case 'C':
            val += 12;
            break;
        case 'D':
            val += 13;
            break;
        case 'E':
            val += 14;
            break;
        case 'F':
            val += 15;
            break;
        default:
            val += parseInt(data.substr(1, 1));
            break;
    }
    switch (data.substr(0, 1).toUpperCase()) {
        case 'A':
            val += 10 * 16;
            break;
        case 'B':
            val += 11 * 16;
            break;
        case 'C':
            val += 12 * 16;
            break;
        case 'D':
            val += 13 * 16;
            break;
        case 'E':
            val += 14 * 16;
            break;
        case 'F':
            val += 15 * 16;
            break;
        default:
            val += parseInt(data.substr(0, 1)) * 16;
            break;
    }
    return val;
};

Util._openUrl = function (url) {
    window.open(url);
};

Util.log10 = function (num) {
    return Math.log(num) / 2.30258509299405;
};

Util.sign = function (num) {
    if (num < 0) {
        return -1;
    }
    return 1;
};

var Util$ = {};

registerType("Util", [Util, Util$, null]);
