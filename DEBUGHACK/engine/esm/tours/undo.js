// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Managing undos of changes made in the tour editor.

import { ss } from "../ss.js";
import { registerType } from "../typesystem.js";
import { IUndoStep } from "../interfaces.js";
import { Language } from "../util.js";


// wwtlib.Undo

export function Undo() { }

Undo._undoStack = new ss.Stack();
Undo._redoStack = new ss.Stack();

Undo.clear = function () {
    Undo._undoStack = new ss.Stack();
    Undo._redoStack = new ss.Stack();
};

Undo.push = function (step) {
    Undo._undoStack.push(step);
    Undo._redoStack = new ss.Stack();
};

Undo.peekActionString = function () {
    if (Undo._undoStack.count > 0) {
        return Undo._undoStack.peek().toString();
    }
    else {
        return Language.getLocalizedText(551, 'Nothing to Undo');
    }
};

Undo.peekRedoActionString = function () {
    if (Undo._redoStack.count > 0) {
        return Undo._redoStack.peek().toString();
    }
    else {
        return '';
    }
};

Undo.peekAction = function () {
    return (Undo._undoStack.count > 0);
};

Undo.peekRedoAction = function () {
    return (Undo._redoStack.count > 0);
};

Undo.stepBack = function () {
    var step = Undo._undoStack.pop();
    step.undo();
    Undo._redoStack.push(step);
};

Undo.stepForward = function () {
    var step = Undo._redoStack.pop();
    step.redo();
    Undo._undoStack.push(step);
};

var Undo$ = {};

registerType("Undo", [Undo, Undo$, null]);


// wwtlib.UndoStep

export function UndoStep() { }

var UndoStep$ = {
    undo: function () { },

    redo: function () { },

    toString: function () {
        return Language.getLocalizedText(551, 'Nothing to Undo');
    }
};

registerType("UndoStep", [UndoStep, UndoStep$, null, IUndoStep]);


// wwtlib.UndoTourSlidelistChange

export function UndoTourSlidelistChange(text, tour) {
    this._currentIndex = 0;
    this._actionText = '';
    this._targetTour = null;
    this._undoList = [];
    for (var i = 0; i < tour.get_tourStops().length; i++) {
        this._undoList.push(tour.get_tourStops()[i]);
    }
    this._currentIndex = tour.get_currentTourstopIndex();
    this._actionText = text;
    this._targetTour = tour;
    this._targetTour.set_tourDirty(true);
}

var UndoTourSlidelistChange$ = {
    get_actionText: function () {
        return this._actionText;
    },

    set_actionText: function (value) {
        this._actionText = value;
        return value;
    },

    undo: function () {
        this._redoList = this._targetTour.get_tourStops();
        this._targetTour.set_tourStops(this._undoList);
        this._targetTour.set_currentTourstopIndex(this._currentIndex);
        this._targetTour.set_tourDirty(true);
    },

    redo: function () {
        this._undoList = this._targetTour.get_tourStops();
        this._targetTour.set_tourStops(this._redoList);
        this._targetTour.set_currentTourstopIndex(this._currentIndex);
        this._targetTour.set_tourDirty(true);
    },

    toString: function () {
        return this._actionText;
    }
};

registerType("UndoTourSlidelistChange", [UndoTourSlidelistChange, UndoTourSlidelistChange$, null, IUndoStep]);


// wwtlib.UndoTourPropertiesChange

export function UndoTourPropertiesChange(text, tour) {
    this._actionText = '';
    this._targetTour = null;
    this._undoDomeMode = false;
    this._undoLevel = 0;
    this._redoDomeMode = false;
    this._redoLevel = 0;
    this._undoTitle = tour.get_title();
    this._undoAuthor = tour.get_author();
    this._undoAuthorEmail = tour.get_authorEmail();
    this._undoDescription = tour.get_description();
    this._undoAuthorImage = tour.get_authorImage();
    this._undoOrganizationUrl = tour.get_organizationUrl();
    this._undoOrgName = tour.get_orgName();
    this._undoKeywords = tour.get_keywords();
    this._undoTaxonomy = tour.get_taxonomy();
    this._undoLevel = tour.get_level();
    this._actionText = text;
    this._targetTour = tour;
    this._targetTour.set_tourDirty(true);
}

var UndoTourPropertiesChange$ = {
    get_actionText: function () {
        return this._actionText;
    },

    set_actionText: function (value) {
        this._actionText = value;
        return value;
    },

    undo: function () {
        this._redoTitle = this._targetTour.get_title();
        this._redoAuthor = this._targetTour.get_author();
        this._redoAuthorEmail = this._targetTour.get_authorEmail();
        this._redoDescription = this._targetTour.get_description();
        this._redoAuthorImage = this._targetTour.get_authorImage();
        this._redoOrganizationUrl = this._targetTour.get_organizationUrl();
        this._redoOrgName = this._targetTour.get_orgName();
        this._redoKeywords = this._targetTour.get_keywords();
        this._redoTaxonomy = this._targetTour.get_taxonomy();
        this._redoLevel = this._targetTour.get_level();
        this._targetTour.set_title(this._undoTitle);
        this._targetTour.set_author(this._undoAuthor);
        this._targetTour.set_authorEmail(this._undoAuthorEmail);
        this._targetTour.set_description(this._undoDescription);
        this._targetTour.set_authorImage(this._undoAuthorImage);
        this._targetTour.set_organizationUrl(this._undoOrganizationUrl);
        this._targetTour.set_orgName(this._undoOrgName);
        this._targetTour.set_keywords(this._undoKeywords);
        this._targetTour.set_taxonomy(this._undoTaxonomy);
        this._targetTour.set_level(this._undoLevel);
        this._targetTour.set_tourDirty(true);
    },

    redo: function () {
        this._targetTour.set_title(this._redoTitle);
        this._targetTour.set_author(this._redoAuthor);
        this._targetTour.set_authorEmail(this._redoAuthorEmail);
        this._targetTour.set_description(this._redoDescription);
        this._targetTour.set_authorImage(this._redoAuthorImage);
        this._targetTour.set_organizationUrl(this._redoOrganizationUrl);
        this._targetTour.set_orgName(this._redoOrgName);
        this._targetTour.set_keywords(this._redoKeywords);
        this._targetTour.set_taxonomy(this._redoTaxonomy);
        this._targetTour.set_level(this._redoLevel);
        this._targetTour.set_tourDirty(true);
    },

    toString: function () {
        return this._actionText;
    }
};

registerType("UndoTourPropertiesChange", [UndoTourPropertiesChange, UndoTourPropertiesChange$, null, IUndoStep]);
