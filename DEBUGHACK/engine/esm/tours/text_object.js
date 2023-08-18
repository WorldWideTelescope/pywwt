// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A basic text data object.

import { registerType, registerEnum, Enums } from "../typesystem.js";
import { ss } from "../ss.js";
import { Util } from "../baseutil.js";
import { Color } from "../color.js";



// wwtlib.TextBorderStyle

export var TextBorderStyle = {
    none: 0,
    tight: 1,
    small: 2,
    medium: 3,
    large: 4
};

registerType("TextBorderStyle", TextBorderStyle);
registerEnum("TextBorderStyle", TextBorderStyle);


// wwtlib.TextObject

export function TextObject() {
    this.bold = false;
    this.italic = false;
    this.underline = false;
    this.fontSize = 0;
    this.borderStyle = 0;
}

TextObject.create = function (text, bold, italic, underline, fontSize, fontName, forgroundColor, backgroundColor, borderStyle) {
    var temp = new TextObject();
    temp.text = text;
    temp.bold = bold;
    temp.italic = italic;
    temp.underline = underline;
    temp.fontSize = fontSize;
    temp.fontName = fontName;
    temp.foregroundColor = forgroundColor;
    temp.backgroundColor = backgroundColor;
    temp.borderStyle = borderStyle;
    return temp;
};

TextObject._fromXml = function (node) {
    var newTextObject = new TextObject();
    newTextObject.text = Util.getInnerText(node);
    newTextObject.borderStyle = 0;
    newTextObject.bold = ss.boolean(node.attributes.getNamedItem('Bold').nodeValue);
    newTextObject.italic = ss.boolean(node.attributes.getNamedItem('Italic').nodeValue);
    newTextObject.underline = ss.boolean(node.attributes.getNamedItem('Underline').nodeValue);
    newTextObject.fontSize = parseFloat(node.attributes.getNamedItem('FontSize').nodeValue);
    newTextObject.fontName = node.attributes.getNamedItem('FontName').nodeValue;
    newTextObject.foregroundColor = Color.load(node.attributes.getNamedItem('ForgroundColor').nodeValue);
    newTextObject.backgroundColor = Color.load(node.attributes.getNamedItem('BackgroundColor').nodeValue);
    if (node.attributes.getNamedItem('BorderStyle') != null) {
        newTextObject.borderStyle = Enums.parse('TextBorderStyle', node.attributes.getNamedItem('BorderStyle').nodeValue);
    }
    return newTextObject;
};

var TextObject$ = {
    toString: function () {
        return this.text;
    },

    _saveToXml: function (xmlWriter) {
        xmlWriter._writeStartElement('TextObject');
        xmlWriter._writeAttributeString('Bold', this.bold.toString());
        xmlWriter._writeAttributeString('Italic', this.italic.toString());
        xmlWriter._writeAttributeString('Underline', this.underline.toString());
        xmlWriter._writeAttributeString('FontSize', this.fontSize.toString());
        xmlWriter._writeAttributeString('FontName', this.fontName);
        xmlWriter._writeAttributeString('ForgroundColor', this.foregroundColor.save());
        xmlWriter._writeAttributeString('BackgroundColor', this.backgroundColor.save());
        xmlWriter._writeAttributeString('BorderStyle', Enums.toXml('TextBorderStyle', this.borderStyle));
        xmlWriter._writeString(this.text);
        xmlWriter._writeEndElement();
    }
};

registerType("TextObject", [TextObject, TextObject$, null]);
