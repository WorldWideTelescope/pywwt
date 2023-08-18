// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// Infrastructure for browsing the WWT folder structure.

import { ss } from "./ss.js";
import { registerType, registerEnum } from "./typesystem.js";
import { globalWWTControl } from "./data_globals.js";
import { globalRenderContext } from "./render_globals.js";
import { Vector2d } from "./double3d.js";
import { Folder } from "./folder.js";
import { FolderUp } from "./folder_up.js";
import { Imageset } from "./imageset.js";
import { Place } from "./place.js";
import { RenderTriangle } from "./render_triangle.js";
import { Tour } from "./tour.js";
import { Mouse, Rectangle } from "./util.js";


// wwtlib.ThumbnailSize

export var ThumbnailSize = {
    small: 0,
    big: 1
};

registerType("ThumbnailSize", ThumbnailSize);
registerEnum("ThumbnailSize", ThumbnailSize);


// wwtlib.FolderBrowser

export function FolderBrowser() {
    this._items = [];
    this.top = 10;
    this.left = 10;
    this._indexTouchDown = -1;
    this._mouseDown = false;
    this._lastX = 0;
    this._lastY = 0;
    this._ignoreClick = false;
    this._thumbnailSize = 0;
    this._horzSpacing = 110;
    this._vertSpacing = 75;
    this._thumbHeight = 65;
    this._thumbWidth = 110;
    this._horzMultiple = 110;
    this._rowCount = 1;
    this._colCount = 6;
    this._dragging = false;
    this._startIndex = 0;
    this._startOffset = 0;
    this._selectedItem = -1;
    this._hoverItem = -1;
    this.showAddButton = false;
    this.width = 0;
    this.height = 0;
    this._addButtonHover = false;
    this.imageClicked = false;
}

FolderBrowser._downloading = false;
FolderBrowser._imagesLoaded = false;
FolderBrowser._imageLoadCount = 0;

FolderBrowser.create = function () {
    var temp = new FolderBrowser();
    temp.height = 85;
    temp.width = 1920;
    temp.canvas = document.createElement('canvas');
    temp.canvas.width = temp.width;
    temp.canvas.height = temp.height;
    temp.setup();
    temp.loadImages();
    return temp;
};

var FolderBrowser$ = {
    setup: function () {
        this.canvas.addEventListener('click', ss.bind('onClick', this), false);
        this.canvas.addEventListener('dblclick', ss.bind('onDoubleClick', this), false);
        this.canvas.addEventListener('mousemove', ss.bind('onMouseMove', this), false);
        this.canvas.addEventListener('mouseup', ss.bind('onMouseUp', this), false);
        this.canvas.addEventListener('mousedown', ss.bind('onMouseDown', this), false);
        this.canvas.addEventListener('touchstart', ss.bind('onTouchStart', this), false);
        this.canvas.addEventListener('touchmove', ss.bind('onTouchMove', this), false);
        this.canvas.addEventListener('touchend', ss.bind('onTouchEnd', this), false);
        this.canvas.addEventListener('mouseout', ss.bind('onMouseUp', this), false);
    },

    onTouchStart: function (e) {
        var ev = e;
        ev.preventDefault();
        this._mouseDown = true;
        this._lastX = ev.targetTouches[0].pageX;
        this._lastY = ev.targetTouches[0].pageY;
        this._indexTouchDown = this._getItemIndexFromCursor(Vector2d.create(ev.targetTouches[0].pageX, ev.targetTouches[0].pageY));
    },

    onTouchMove: function (e) {
        var ev = e;
        ev.preventDefault();
        if (this._mouseDown) {
            var curX = ev.targetTouches[0].pageX - this._lastX;
            var curY = ev.targetTouches[0].pageY - this._lastY;
            if (this._mouseDown) {
                this._dragging = true;
            }
            if (!this._dragging) {
                var newHover = this._getItemIndexFromCursor(Vector2d.create(ev.targetTouches[0].pageX, ev.targetTouches[0].pageY));
                if (this._hoverItem !== newHover) {
                    this._hoverItem = newHover;
                }
            }
            else {
                var tiles = Math.round(((ev.targetTouches[0].pageX - this._lastX) + this._startOffset) / this._horzSpacing);
                var offset = Math.round(((ev.targetTouches[0].pageX - this._lastX) + this._startOffset) - (tiles * this._horzSpacing));
                this._startOffset = offset;
                this._startIndex -= tiles;
                if (this._startIndex < 0) {
                    this._startOffset -= (this._horzSpacing * this._startIndex);
                    this._startIndex = 0;
                }
                this._lastX = ev.targetTouches[0].pageX;
                this._lastY = ev.targetTouches[0].pageY;
            }
            this.refresh();
        }
    },

    onTouchEnd: function (e) {
        var ev = e;
        ev.preventDefault();
        if (this._dragging) {
            this._dragging = false;
            this._ignoreClick = true;
        } else if (this._indexTouchDown > -1 && this._mouseDown) {
            this._handleClick(this._indexTouchDown);
        }
        this._startOffset = 0;
        this._mouseDown = false;
        this.refresh();
    },

    onClick: function (e) {
        if (!this._ignoreClick) {
            var index = this._getItemIndexFromCursor(Vector2d.create(e.offsetX, e.offsetY));
            this._handleClick(index);
        } else {
            this._ignoreClick = false;
        }
    },

    _handleClick: function (index) {
        var $this = this;

        if (index > -1) {
            if (ss.canCast(this._items[index], Place)) {
                var place = this._items[index];
                globalWWTControl.gotoTarget(place, false, false, true);
                return;
            }
            if (ss.canCast(this._items[index], Imageset)) {
                var imageset = this._items[index];
                globalRenderContext.set_backgroundImageset(imageset);
                return;
            }
            if (ss.canCast(this._items[index], Tour)) {
                var tour = this._items[index];
                globalWWTControl.playTour(tour.get_tourUrl());
                return;
            }
            if (ss.canCast(this._items[index], Folder)) {
                var folder = this._items[index];
                this._startIndex = 0;
                folder.childLoadCallback(function () {
                    $this._items = folder.get_children();
                    $this.refresh();
                });
                return;
            }
            if (ss.canCast(this._items[index], FolderUp)) {
                var folderUp = this._items[index];
                if (folderUp.parent != null) {
                    this._startIndex = 0;
                    folderUp.parent.childLoadCallback(function () {
                        $this._items = folderUp.parent.get_children();
                        $this.refresh();
                    });
                }
                return;
            }
        }
        return;
    },

    onDoubleClick: function (e) {
        RenderTriangle.renderingOn = !RenderTriangle.renderingOn;
    },

    onGestureChange: function (e) {
        var g = e;
        this._mouseDown = false;
        var delta = g.scale;
    },

    onMouseDown: function (e) {
        this._mouseDown = true;
        this._lastX = Mouse.offsetX(this.canvas, e);
        this._lastY = Mouse.offsetY(this.canvas, e);
    },

    onMouseMove: function (e) {
        if (this._mouseDown) {
            this._dragging = true;
        }
        if (!this._dragging) {
            var newHover = this._getItemIndexFromCursor(Vector2d.create(Mouse.offsetX(this.canvas, e), Mouse.offsetY(this.canvas, e)));
            if (this._hoverItem !== newHover) {
                this._hoverItem = newHover;
            }
        } else {
            var tiles = Math.round(((Mouse.offsetX(this.canvas, e) - this._lastX) + this._startOffset) / this._horzSpacing);
            var offset = Math.round(((Mouse.offsetX(this.canvas, e) - this._lastX) + this._startOffset) - (tiles * this._horzSpacing));
            this._startOffset = offset;
            this._startIndex -= tiles;
            if (this._startIndex < 0) {
                this._startOffset -= (this._horzSpacing * this._startIndex);
                this._startIndex = 0;
            }
            this._lastX = Mouse.offsetX(this.canvas, e);
            this._lastY = Mouse.offsetY(this.canvas, e);
        }
        this.refresh();
    },

    onMouseUp: function (e) {
        if (this._dragging) {
            this._startOffset = 0;
            this._dragging = false;
            this._ignoreClick = true;
        }
        this._mouseDown = false;
        this.refresh();
    },

    loadImages: function () {
        var $this = this;

        if (!FolderBrowser._imagesLoaded && !FolderBrowser._downloading) {
            FolderBrowser._imageLoadCount = 0;
            FolderBrowser._imagesLoaded = false;
            FolderBrowser._downloading = true;
            FolderBrowser._bmpBackground = document.createElement('img');
            FolderBrowser._bmpBackground.src = 'images/thumbBackground.png';
            FolderBrowser._bmpBackground.addEventListener('load', function (e) {
                FolderBrowser._imageLoadCount++;
                if (FolderBrowser._imageLoadCount === 5) {
                    FolderBrowser._downloading = false;
                    FolderBrowser._imagesLoaded = true;
                    $this.refresh();
                }
            }, false);
            FolderBrowser._bmpBackgroundHover = document.createElement('img');
            FolderBrowser._bmpBackgroundHover.src = 'images/thumbBackgroundHover.png';
            FolderBrowser._bmpBackgroundHover.addEventListener('load', function (e) {
                FolderBrowser._imageLoadCount++;
                if (FolderBrowser._imageLoadCount === 5) {
                    FolderBrowser._downloading = false;
                    FolderBrowser._imagesLoaded = true;
                    $this.refresh();
                }
            }, false);
            FolderBrowser._bmpBackgroundWide = document.createElement('img');
            FolderBrowser._bmpBackgroundWide.src = 'images/thumbBackgroundWide.png';
            FolderBrowser._bmpBackgroundWide.addEventListener('load', function (e) {
                FolderBrowser._imageLoadCount++;
                if (FolderBrowser._imageLoadCount === 5) {
                    FolderBrowser._downloading = false;
                    FolderBrowser._imagesLoaded = true;
                    $this.refresh();
                }
            }, false);
            FolderBrowser._bmpBackgroundWideHover = document.createElement('img');
            FolderBrowser._bmpBackgroundWideHover.src = 'images/thumbBackgroundWideHover.png';
            FolderBrowser._bmpBackgroundWideHover.addEventListener('load', function (e) {
                FolderBrowser._imageLoadCount++;
                if (FolderBrowser._imageLoadCount === 5) {
                    FolderBrowser._downloading = false;
                    FolderBrowser._imagesLoaded = true;
                    $this.refresh();
                }
            }, false);
            FolderBrowser._bmpDropInsertMarker = document.createElement('img');
            FolderBrowser._bmpDropInsertMarker.src = 'images/dragInsertMarker.png';
            FolderBrowser._bmpDropInsertMarker.addEventListener('load', function (e) {
                FolderBrowser._imageLoadCount++;
                if (FolderBrowser._imageLoadCount === 5) {
                    FolderBrowser._downloading = false;
                    FolderBrowser._imagesLoaded = true;
                    $this.refresh();
                }
            }, false);
        }
    },

    get_thumbnailSize: function () {
        return this._thumbnailSize;
    },

    set_thumbnailSize: function (value) {
        this._thumbnailSize = value;
        switch (value) {
            case 1:
                this._horzSpacing = 180;
                this._vertSpacing = 75;
                this._thumbHeight = 65;
                this._thumbWidth = 180;
                break;
            case 0:
                this._horzSpacing = 110;
                this._vertSpacing = 75;
                this._thumbHeight = 65;
                this._thumbWidth = 110;
                break;
        }
        this._updatePaginator();
        this.refresh();
        return value;
    },

    refresh: function () {
        if (this.width !== window.innerWidth) {
            this.width = window.innerWidth;
        }
        this.paint();
    },

    get_rowCount: function () {
        return this._rowCount;
    },

    set_rowCount: function (value) {
        if (this._rowCount !== value) {
            this._rowCount = value;
            this._updatePaginator();
        }
        return value;
    },

    _updatePaginator: function () { },

    get_colCount: function () {
        return this._colCount;
    },

    set_colCount: function (value) {
        if (this._colCount !== value) {
            this._colCount = value;
            this._updatePaginator();
        }
        return value;
    },

    get_itemsPerPage: function () {
        return this._rowCount * this._colCount;
    },

    get_currentPage: function () {
        return this._startIndex / this.get_itemsPerPage();
    },

    get_pageCount: function () {
        return Math.max(1, ((this._items.length + this.get_itemsPerPage() - 1) + ((this.showAddButton) ? 1 : 0)) / this.get_itemsPerPage());
    },

    paint: function () {
        var $this = this;

        var g = this.canvas.getContext('2d');
        g.fillStyle = 'rgb(20, 22, 31)';
        g.fillRect(0, 0, this.width, this.height);
        if (!FolderBrowser._imagesLoaded) {
            return;
        }
        var netHeight = (this.height - 10 * 2);
        var netWidth = (this.width - 10 * 2);
        this.set_rowCount(Math.round(Math.max(netHeight / this._thumbHeight, 1)));
        this.set_colCount(Math.round(Math.max(netWidth / this._horzSpacing, 1)));
        this._horzMultiple = (netWidth + 13) / this.get_colCount();
        this._startIndex = Math.round((this._startIndex / this.get_itemsPerPage()) * this.get_itemsPerPage());
        var rectf;
        var index = this._startIndex;
        for (var y = 0; y < this._rowCount; y++) {
            for (var x = 0; x < this._colCount; x++) {
                if (index >= this._items.length) {
                    if (!this._items.length || this.showAddButton) {
                        rectf = Rectangle.create(this.left + x * this._horzMultiple + 3 + this._startOffset, this.top + y * this._vertSpacing, this._thumbWidth - 10, 60);
                        g.drawImage((this._thumbnailSize === 1) ? FolderBrowser._bmpBackgroundWide : FolderBrowser._bmpBackground, ss.truncate((x * this._horzMultiple)) + this._startOffset, y * this._vertSpacing);
                    }
                    break;
                }
                rectf = Rectangle.create(this.left + x * this._horzMultiple + 3 + this._startOffset, this.top + y * this._vertSpacing, this._thumbWidth - 14, 60);
                var textBrush = 'white';
                if (index === this._hoverItem || (index === this._selectedItem && this._hoverItem === -1)) {
                    g.drawImage((this._thumbnailSize === 1) ? FolderBrowser._bmpBackgroundWideHover : FolderBrowser._bmpBackgroundHover, this.left + ss.truncate((x * this._horzMultiple)) + this._startOffset, this.top + y * this._vertSpacing);
                    textBrush = 'yellow';
                }
                else {
                    g.drawImage((this._thumbnailSize === 1) ? FolderBrowser._bmpBackgroundWide : FolderBrowser._bmpBackground, this.left + ss.truncate((x * this._horzMultiple)) + this._startOffset, this.top + y * this._vertSpacing);
                }
                this._items[index].set_bounds(Rectangle.create((this.left + x * this._horzMultiple) + this._startOffset, this.top + (y * this._vertSpacing), ss.truncate(this._horzMultiple), this._vertSpacing));
                try {
                    var bmpThumb = this._items[index].get_thumbnail();
                    if (bmpThumb != null) {
                        g.drawImage(bmpThumb, this.left + (x * this._horzMultiple) + 2 + this._startOffset, this.top + y * this._vertSpacing + 3);
                        g.strokeStyle = 'rgb(0,0,0)';
                        g.rect(this.left + ss.truncate((x * this._horzMultiple)) + 2 + this._startOffset, this.top + y * this._vertSpacing + 3, this._items[index].get_thumbnail().width, this._items[index].get_thumbnail().height);
                    }
                    else {
                        this._items[index].set_thumbnail(document.createElement('img'));
                        this._items[index].get_thumbnail().src = this._items[index].get_thumbnailUrl();
                        this._items[index].get_thumbnail().addEventListener('load', function (e) {
                            $this.refresh();
                        }, false);
                    }
                }
                catch ($e1) {
                }
                g.fillStyle = textBrush;
                g.strokeStyle = textBrush;
                g.lineWidth = 1;
                g.font = 'normal 8pt Arial';
                g.fillText(this._items[index].get_name(), rectf.x, rectf.y + rectf.height, rectf.width);
                index++;
            }
            if (index >= this._items.length) {
                break;
            }
        }
    },

    _getItemIndexFromCursor: function (testPointIn) {
        var testPoint = Vector2d.create(testPointIn.x + this.left, testPointIn.y + this.top);
        this.imageClicked = false;
        var index = -1;
        var xpos = ss.truncate((testPoint.x / this._horzMultiple));
        var xPart = ss.truncate((testPoint.x % this._horzMultiple));
        if (xpos >= this._colCount) {
            return -1;
        }
        if (xpos < 0) {
            return -1;
        }
        var ypos = ss.truncate((testPoint.y / this._vertSpacing));
        var yPart = ss.truncate((testPoint.y % this._vertSpacing));
        if (ypos >= this._rowCount) {
            return -1;
        }
        if (ypos < 0) {
            return -1;
        }
        index = this._startIndex + ypos * this._colCount + xpos;
        if (index === this._items.length) {
            this._addButtonHover = true;
        } else {
            this._addButtonHover = false;
        }
        if (index > this._items.length - 1) {
            return -1;
        }
        if ((this._items[index]).get_isImage() && yPart < 16 && xPart > 78) {
            this.imageClicked = true;
        }
        return index;
    },

    _addItems: function (list) {
        this._items = list;
    }
};

registerType("FolderBrowser", [FolderBrowser, FolderBrowser$, null]);
