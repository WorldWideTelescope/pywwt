// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// A framework for constructing UIs associated with specific layers. Largely
// unused in the web engine context.

import { ss } from "../ss.js";
import { registerType } from "../typesystem.js";
import { Colors } from "../color.js";


// wwtlib.LayerUI

export function LayerUI() { }

LayerUI._type = null;

var LayerUI$ = {
    get_hasTreeViewNodes: function () {
        return false;
    },

    getTreeNodes: function () {
        return null;
    },

    getNodeContextMenu: function (node) {
        return null;
    },

    setUICallbacks: function (callbacks) { }
};

registerType("LayerUI", [LayerUI, LayerUI$, null]);


// wwtlib.LayerUIMenuItem

export function LayerUIMenuItem() {
    this._tag = null;
    this._isChecked = false;
    this._isEnabled = true;
    this._subMenus = null;
}

var LayerUIMenuItem$ = {
    get_name: function () {
        return this._name;
    },

    set_name: function (value) {
        this._name = value;
        return value;
    },

    get_tag: function () {
        return this._tag;
    },

    set_tag: function (value) {
        this._tag = value;
        return value;
    },

    get_checked: function () {
        return this._isChecked;
    },

    set_checked: function (value) {
        this._isChecked = value;
        return value;
    },

    get_enabled: function () {
        return this._isEnabled;
    },

    set_enabled: function (value) {
        this._isEnabled = value;
        return value;
    },

    add_menuItemSelected: function (value) {
        this.__menuItemSelected = ss.bindAdd(this.__menuItemSelected, value);
    },

    remove_menuItemSelected: function (value) {
        this.__menuItemSelected = ss.bindSub(this.__menuItemSelected, value);
    },

    fireMenuItemSelected: function () {
        if (this.__menuItemSelected != null) {
            this.__menuItemSelected(this);
        }
    },

    get_subMenus: function () {
        if (this._subMenus == null) {
            this._subMenus = [];
        }
        return this._subMenus;
    }
};

registerType("LayerUIMenuItem", [LayerUIMenuItem, LayerUIMenuItem$, null]);


// wwtlib.LayerUITreeNode

export function LayerUITreeNode() {
    this._parent = null;
    this._level = 0;
    this._open = false;
    this._isChecked = false;
    this._bold = false;
    this._color = Colors.get_white();
    this._nodes = null;
}

var LayerUITreeNode$ = {
    add_nodeChecked: function (value) {
        this.__nodeChecked = ss.bindAdd(this.__nodeChecked, value);
    },

    remove_nodeChecked: function (value) {
        this.__nodeChecked = ss.bindSub(this.__nodeChecked, value);
    },

    fireNodeChecked: function (newState) {
        if (this.__nodeChecked != null) {
            this.__nodeChecked(this, newState);
        }
    },

    add_nodeUpdated: function (value) {
        this.__nodeUpdated = ss.bindAdd(this.__nodeUpdated, value);
    },

    remove_nodeUpdated: function (value) {
        this.__nodeUpdated = ss.bindSub(this.__nodeUpdated, value);
    },

    fireNodeUpdated: function () {
        if (this.__nodeUpdated != null) {
            this.__nodeUpdated(this);
        }
    },

    add_nodeSelected: function (value) {
        this.__nodeSelected = ss.bindAdd(this.__nodeSelected, value);
    },

    remove_nodeSelected: function (value) {
        this.__nodeSelected = ss.bindSub(this.__nodeSelected, value);
    },

    fireNodeSelected: function () {
        if (this.__nodeSelected != null) {
            this.__nodeSelected(this);
        }
    },

    add_nodeActivated: function (value) {
        this.__nodeActivated = ss.bindAdd(this.__nodeActivated, value);
    },

    remove_nodeActivated: function (value) {
        this.__nodeActivated = ss.bindSub(this.__nodeActivated, value);
    },

    fireNodeActivated: function () {
        if (this.__nodeActivated != null) {
            this.__nodeActivated(this);
        }
    },

    get_name: function () {
        return this._name;
    },

    set_name: function (value) {
        if (this._name !== value) {
            this._name = value;
            this.fireNodeUpdated();
        }
        return value;
    },

    get_parent: function () {
        return this._parent;
    },

    set_parent: function (value) {
        this._parent = value;
        return value;
    },

    get_level: function () {
        return this._level;
    },

    set_level: function (value) {
        this._level = value;
        return value;
    },

    get_tag: function () {
        return this._tag;
    },

    set_tag: function (value) {
        this._tag = value;
        return value;
    },

    get_referenceTag: function () {
        return this._referenceTag;
    },

    set_referenceTag: function (value) {
        this._referenceTag = value;
        return value;
    },

    get_opened: function () {
        return this._open;
    },

    set_opened: function (value) {
        if (this._open !== value) {
            this._open = value;
            this.fireNodeUpdated();
        }
        return value;
    },

    get_checked: function () {
        return this._isChecked;
    },

    set_checked: function (value) {
        if (this._isChecked !== value) {
            this._isChecked = value;
            this.fireNodeUpdated();
        }
        return value;
    },

    get_bold: function () {
        return this._bold;
    },

    set_bold: function (value) {
        if (this._bold !== value) {
            this._bold = value;
            this.fireNodeUpdated();
        }
        return value;
    },

    get_color: function () {
        return this._color;
    },

    set_color: function (value) {
        if (this._color !== value) {
            this._color = value;
            this.fireNodeUpdated();
        }
        return value;
    },

    add: function (name) {
        var node = new LayerUITreeNode();
        node.set_name(name);
        node.set_parent(this);
        node.set_level(this.get_level() + 1);
        this.get_nodes().push(node);
        return node;
    },

    get_nodes: function () {
        if (this._nodes == null) {
            this._nodes = [];
        }
        return this._nodes;
    }
};

registerType("LayerUITreeNode", [LayerUITreeNode, LayerUITreeNode$, null]);
