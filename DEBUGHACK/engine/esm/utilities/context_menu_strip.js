// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Context menu items

import { registerType } from "../typesystem.js";
import { ss } from "../ss.js";
import { Vector2d } from "../double3d.js";


// wwtlib.ContextMenuStrip

export function ContextMenuStrip() {
    this.items = [];
}

var ContextMenuStrip$ = {
    _dispose: function () { },

    _nonMenuClick: function (e) {
        var menu = document.getElementById('contextmenu');
        menu.style.display = 'none';
        window.removeEventListener('click', ss.bind('_nonMenuClick', this), false);
        var popup = document.getElementById('popoutmenu');
        while (popup.firstChild != null) {
            popup.removeChild(popup.firstChild);
        }
        popup.style.display = 'none';
    },

    _menuItemClicked: function (e) {
        var me = e.currentTarget;
        me.itemTag.click(me.itemTag, new ss.EventArgs());
    },

    _show: function (position) {
        var menu = document.getElementById('contextmenu');
        while (menu.firstChild != null) {
            menu.removeChild(menu.firstChild);
        }
        menu.className = 'contextmenu';
        menu.style.display = 'block';
        menu.style.left = position.x.toString() + 'px';
        menu.style.top = position.y.toString() + 'px';
        window.addEventListener('click', ss.bind('_nonMenuClick', this), true);
        var $enum1 = ss.enumerate(this.items);
        while ($enum1.moveNext()) {
            var item = $enum1.current;
            if (item.visible) {
                var md = document.createElement('div');
                if (item.dropDownItems.length > 0) {
                    md.className = 'contextmenuitem submenu';
                }
                else {
                    if (item.checked) {
                        md.className = 'contextmenuitem checkedmenu';
                    }
                    else {
                        md.className = 'contextmenuitem';
                    }
                }
                md.innerText = item.name;
                var it = md;
                it.itemTag = item;
                md.addEventListener('mouseover', ss.bind('_openSubMenu', this), false);
                if (item.click != null) {
                    md.addEventListener('click', ss.bind('_menuItemClicked', this), false);
                }
                menu.appendChild(md);
            }
        }
    },

    _openSubMenu: function (e) {
        var me = e.currentTarget;
        var child = me.itemTag;
        var menu = document.getElementById('popoutmenu');
        while (menu.firstChild != null) {
            menu.removeChild(menu.firstChild);
        }
        menu.style.display = 'none';
        if (!child.dropDownItems.length) {
            return;
        }
        var position = new Vector2d();
        position.x = e.currentTarget.parentNode.offsetLeft + e.currentTarget.parentNode.clientWidth;
        position.y = e.currentTarget.parentNode.offsetTop + e.currentTarget.offsetTop;
        menu.className = 'contextmenu';
        menu.style.display = 'block';
        menu.style.left = position.x.toString() + 'px';
        menu.style.top = position.y.toString() + 'px';
        window.addEventListener('click', ss.bind('_nonMenuClick', this), true);
        var $enum1 = ss.enumerate(child.dropDownItems);
        while ($enum1.moveNext()) {
            var item = $enum1.current;
            if (item.visible) {
                var md = document.createElement('div');
                md.className = (item.checked) ? 'contextmenuitem checkedmenu' : 'contextmenuitem';
                md.innerText = item.name;
                var it = md;
                it.itemTag = item;
                md.addEventListener('click', ss.bind('_menuItemClicked', this), false);
                menu.appendChild(md);
            }
        }
    }
};

registerType("ContextMenuStrip", [ContextMenuStrip, ContextMenuStrip$, null]);


// wwtlib.ToolStripMenuItem

export function ToolStripMenuItem() {
    this.tag = null;
    this.dropDownItems = [];
    this.checked = false;
    this.enabled = true;
    this.visible = true;
}

ToolStripMenuItem.create = function (name) {
    var tsmi = new ToolStripMenuItem();
    tsmi.name = name;
    return tsmi;
};

var ToolStripMenuItem$ = {};

registerType("ToolStripMenuItem", [ToolStripMenuItem, ToolStripMenuItem$, null]);


// wwtlib.ToolStripSeparator

export function ToolStripSeparator() {
    ToolStripMenuItem.call(this);
    this.name = '--------------------------------------';
}

var ToolStripSeparator$ = {};

registerType("ToolStripSeparator", [ToolStripSeparator, ToolStripSeparator$, ToolStripMenuItem]);


// wwtlib.TagMe

export function TagMe() { }

var TagMe$ = {};

registerType("TagMe", [TagMe, TagMe$, null]);
