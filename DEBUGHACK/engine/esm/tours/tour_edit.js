// Copyright 2023 the .NET Foundation
// Licensed under the MIT License

// The "tour editor tab" UX.
//
// This file defines `TourEditTab`; the types `TourEdit` and `TourEditor` are
// defined in `tour_editor.js`.

import { ss } from "../ss.js";
import { registerType } from "../typesystem.js";
import { globalWWTControl, setManagerVisibleLayerList } from "../data_globals.js";
import { globalRenderContext } from "../render_globals.js";
import { Vector2d } from "../double3d.js";
import { Util } from "../baseutil.js";
import { Colors } from "../color.js";
import { XmlTextWriter } from "../utilities/xml_text_writer.js";
import { ContextMenuStrip, ToolStripMenuItem, ToolStripSeparator } from "../utilities/context_menu_strip.js";
import { Cursor, Cursors, Guid, Language, SelectLink } from "../util.js";
import { Place } from "../place.js";
import { SpaceTimeController } from "../space_time_controller.js";
import { UiTools } from "../ui_tools.js";
import { LayerManager } from "../layers/layer_manager.js";
import { Overlay } from "./overlay.js";
import { Undo, UndoTourSlidelistChange } from "./undo.js";
import { TourStop, UndoTourStopChange } from "./tour_stop.js";
import { TourPlayer } from "./tour_player.js";
import { TourEditor, TourEdit, SoundEditor, OverlayList, TourStopList, TimeLine } from "./tour_editor.js";


// wwtlib.TourEditTab

export function TourEditTab() {
    this.musicTrack = new SoundEditor();
    this.voiceTrack = new SoundEditor();
    this._tour = null;
    this.tourStopList = new TourStopList();
    this.tourEditorUI = new TourEditor();
    this._contextMenu = new ContextMenuStrip();
    this.nextSlideCallback = null;
    this.playing = false;
    this._player = null;
    this._defultColor = Colors.get_white();
}

var TourEditTab$ = {
    setUiStrings: function () { },

    get_tour: function () {
        return this._tour;
    },

    set_tour: function (value) {
        this._tour = value;
        this.tourEditorUI.set_tour(this._tour);
        this.tourStopList.tour = this._tour;
        Overlay.defaultAnchor = 1;
        if (this._tour.get_tourStops().length > 0) {
            globalWWTControl.gotoTarget(this._tour.get_tourStops()[0].get_target(), false, true, false);
            this._tour.set_currentTourstopIndex(0);
            this.tourStopList.selectedItem = this._tour.get_currentTourstopIndex();
            this.musicTrack.target = this._tour.get_currentTourStop();
            this.voiceTrack.target = this._tour.get_currentTourStop();
            setManagerVisibleLayerList(this._tour.get_currentTourStop().layers);
        }
        this.setEditMode(this._tour.get_editMode());
        return value;
    },

    tour_CurrentTourstopChanged: function () {
        OverlayList._updateOverlayList(this._tour.get_currentTourStop(), this.tourEditorUI.selection);
        if (this.tourEditorUI != null) {
            this.tourEditorUI.clearSelection();
        }
        this.tourStopList.refresh();
    },

    setFocusedChild: function () { },

    selectCurrent: function () {
        this.tourStopList.selectedItem = this._tour.get_currentTourstopIndex();
        this.tourStopList.refresh();
    },

    tourEdit_Load: function (sender, e) { },

    playNow: function (fromStart) {
        this.playing = true;
        if (this.get_tour().get_editMode() || fromStart) {
            this.get_tour().set_currentTourstopIndex(-1);
        }
        this.setPlayPauseMode();
    },

    _tourPlayer_TourEnded: function (sender, e) { },

    _endTour_CloseTour: function (sender, e) { },

    _endTour_LaunchTour: function (sender, e) {
        this.playNow(true);
    },

    setEditMode: function (visible) { },

    tourStopList_ItemClicked: function (sender, e) {
        if (this._tour.get_currentTourStop() !== e) {
            this._tour.set_currentTourStop(e);
            if (e != null) {
                this.musicTrack.target = this._tour.get_currentTourStop();
                this.voiceTrack.target = this._tour.get_currentTourStop();
            }
            else {
                this.musicTrack.target = null;
                this.voiceTrack.target = null;
            }
            this.tourEditorUI.clearSelection();
        }
        if (this.playing) {
            this._playFromHere_Click(sender, new ss.EventArgs());
        }
    },

    tourStopList_ItemDoubleClicked: function (sender, e) {
        this.showSlideStartPosition(e);
    },

    showSlideStartPosition: function (ts) {
        this._tour.set_currentTourStop(ts);
        if (ts != null) {
            this.musicTrack.target = this._tour.get_currentTourStop();
            this.voiceTrack.target = this._tour.get_currentTourStop();
        } else {
            this.musicTrack.target = null;
            this.voiceTrack.target = null;
        }
        this.tourEditorUI.clearSelection();
        if (this._tour.get_currentTourStop() != null) {
            this._tour.get_currentTourStop().syncSettings();
            SpaceTimeController.set_now(this._tour.get_currentTourStop().get_startTime());
            SpaceTimeController.set_syncToClock(false);
            globalWWTControl.gotoTarget(ts.get_target(), false, true, false);
            this._tour.get_currentTourStop().set_tweenPosition(0);
            this._tour.get_currentTourStop()._updateLayerOpacity();
            setManagerVisibleLayerList(this._tour.get_currentTourStop().layers);
        }
    },

    tourStopList_MouseClick: function (sender, e) {
        if (!this._tour.get_editMode()) {
        }
        if (this.tourStopList.multipleSelection) {
            // MultiSelection Menu
            if (this._contextMenu != null) {
                this._contextMenu._dispose();
            }
            this._contextMenu = new ContextMenuStrip();
            var selectAllMenu = ToolStripMenuItem.create(Language.getLocalizedText(1345, 'Select All'));
            var cutMenu = ToolStripMenuItem.create(Language.getLocalizedText(427, 'Cut'));
            var copyMenu = ToolStripMenuItem.create(Language.getLocalizedText(428, 'Copy'));
            var pasteMenu = ToolStripMenuItem.create(Language.getLocalizedText(429, 'Paste'));
            var deleteMenu = ToolStripMenuItem.create(Language.getLocalizedText(167, 'Delete'));
            cutMenu.click = ss.bind('_cutMenu_Click', this);
            copyMenu.click = ss.bind('_copyMenu_Click', this);
            pasteMenu.click = ss.bind('_pasteMenu_Click', this);
            deleteMenu.click = ss.bind('_deleteMenu_Click', this);
            selectAllMenu.click = ss.bind('_selectAllMenu_Click', this);
            var sep1 = new ToolStripSeparator();
            this._contextMenu.items.push(selectAllMenu);
            this._contextMenu.items.push(sep1);
            this._contextMenu.items.push(cutMenu);
            this._contextMenu.items.push(copyMenu);
            pasteMenu.enabled = this.tourEditorUI.clipboardType === 'WorldWideTelescope.Slide';
            this._contextMenu.items.push(pasteMenu);
            this._contextMenu.items.push(deleteMenu);
            this._contextMenu._show(Cursor.get_position());
        } else if (this._tour.get_currentTourStop() == null) {
            // Context menu for no selection
            if (this._contextMenu != null) {
                this._contextMenu._dispose();
            }
            this._contextMenu = new ContextMenuStrip();
            var selectAllMenu = ToolStripMenuItem.create(Language.getLocalizedText(1345, 'Select All'));
            var pasteMenu = ToolStripMenuItem.create(Language.getLocalizedText(425, 'Paste'));
            var sep1 = new ToolStripSeparator();
            var sep2 = new ToolStripSeparator();
            var insertSlide = ToolStripMenuItem.create(Language.getLocalizedText(426, 'Add New Slide'));
            pasteMenu.click = ss.bind('_pasteMenu_Click', this);
            selectAllMenu.click = ss.bind('_selectAllMenu_Click', this);
            insertSlide.click = ss.bind('_addNewSlide_Click', this);
            pasteMenu.enabled = this.tourEditorUI.clipboardType === 'WorldWideTelescope.Slide';
            this._contextMenu.items.push(selectAllMenu);
            this._contextMenu.items.push(sep1);
            this._contextMenu.items.push(pasteMenu);
            this._contextMenu.items.push(sep2);
            this._contextMenu.items.push(insertSlide);
            this._contextMenu._show(Cursor.get_position());
        } else {
            if (this._contextMenu != null) {
                this._contextMenu._dispose();
            }
            this._contextMenu = new ContextMenuStrip();
            var selectAllMenu = ToolStripMenuItem.create(Language.getLocalizedText(1345, 'Select All'));
            var cutMenu = ToolStripMenuItem.create(Language.getLocalizedText(427, 'Cut'));
            var copyMenu = ToolStripMenuItem.create(Language.getLocalizedText(428, 'Copy'));
            var pasteMenu = ToolStripMenuItem.create(Language.getLocalizedText(429, 'Paste'));
            var deleteMenu = ToolStripMenuItem.create(Language.getLocalizedText(167, 'Delete'));
            var sep1 = new ToolStripSeparator();
            var sep3 = new ToolStripSeparator();
            var sep4 = new ToolStripSeparator();
            var sep5 = new ToolStripSeparator();
            var sep6 = new ToolStripSeparator();
            var sep7 = new ToolStripSeparator();
            var insertSlide = ToolStripMenuItem.create(Language.getLocalizedText(431, 'Insert New Slide'));
            var insertDuplicate = ToolStripMenuItem.create(Language.getLocalizedText(627, 'Duplicate Slide at End Position'));
            var insertSlideshow = ToolStripMenuItem.create(Language.getLocalizedText(628, 'Merge Tour after slide...'));
            var playFromHere = ToolStripMenuItem.create(Language.getLocalizedText(432, 'Preview Tour From Here'));
            var sep2 = new ToolStripSeparator();
            var captureThumbnail = ToolStripMenuItem.create(Language.getLocalizedText(433, 'Capture New Thumbnail'));
            var setSkyPosition = ToolStripMenuItem.create(Language.getLocalizedText(434, 'Set Start Camera Position'));
            var setEndSkyPosition = ToolStripMenuItem.create(Language.getLocalizedText(435, 'Set End Camera Position'));
            var showSkyPosition = ToolStripMenuItem.create(Language.getLocalizedText(436, 'Show Start Camera Position'));
            var showEndSkyPosition = ToolStripMenuItem.create(Language.getLocalizedText(437, 'Show End Camera Position'));
            var masterSlide = ToolStripMenuItem.create(Language.getLocalizedText(438, 'Master Slide'));
            var makeTimeline = ToolStripMenuItem.create(Language.getLocalizedText(1346, 'Create Timeline'));
            var showTimeline = ToolStripMenuItem.create(Language.getLocalizedText(1347, 'Show Timeline'));
            var linkString = this._tour.get_currentTourStop().get_nextSlide();
            switch (linkString) {
                case '':
                case null:
                case 'Next':
                    linkString = ' (' + Language.getLocalizedText(610, 'Next Slide') + ')';
                    break;
                case 'Return':
                    linkString = ' (' + Language.getLocalizedText(602, 'Return to Caller') + ')';
                    break;
                default:
                    var index = this.get_tour().getTourStopIndexByID(linkString);
                    if (index > -1) {
                        if (ss.emptyString(this._tour.get_tourStops()[index].get_description())) {
                            linkString = ss.format(' (Slide {0})', index);
                        }
                        else {
                            linkString = ' (' + this._tour.get_tourStops()[index].get_description() + ')';
                        }
                    }
                    break;
            }
            var setNextSlide = ToolStripMenuItem.create(Language.getLocalizedText(590, 'Set Next Slide') + linkString);
            var trackSpaceTime = ToolStripMenuItem.create(Language.getLocalizedText(439, 'Track Date/Time/Location'));
            var fadeInOverlays = ToolStripMenuItem.create(Language.getLocalizedText(629, 'Fade In Slide Elements'));
            var properties = ToolStripMenuItem.create(Language.getLocalizedText(20, 'Properties'));
            var interpolation = ToolStripMenuItem.create(Language.getLocalizedText(1029, 'Animation Tween Type'));
            var Linear = ToolStripMenuItem.create(Language.getLocalizedText(1030, 'Linear'));
            var Ease = ToolStripMenuItem.create(Language.getLocalizedText(1031, 'Ease In/Out'));
            var EaseIn = ToolStripMenuItem.create(Language.getLocalizedText(1032, 'Ease In'));
            var EaseOut = ToolStripMenuItem.create(Language.getLocalizedText(1033, 'Ease Out'));
            var Exponential = ToolStripMenuItem.create(Language.getLocalizedText(1034, 'Exponential'));
            Linear.tag = 0;
            Ease.tag = 3;
            EaseIn.tag = 1;
            EaseOut.tag = 2;
            Exponential.tag = 4;
            Linear.click = ss.bind('_interpolation_Click', this);
            Ease.click = ss.bind('_interpolation_Click', this);
            EaseIn.click = ss.bind('_interpolation_Click', this);
            EaseOut.click = ss.bind('_interpolation_Click', this);
            Exponential.click = ss.bind('_interpolation_Click', this);
            switch (this._tour.get_currentTourStop().get_interpolationType()) {
                case 0:
                    Linear.checked = true;
                    break;
                case 1:
                    EaseIn.checked = true;
                    break;
                case 2:
                    EaseOut.checked = true;
                    break;
                case 3:
                    Ease.checked = true;
                    break;
                case 4:
                    Exponential.checked = true;
                    break;
                default:
                    break;
            }
            interpolation.dropDownItems.push(Linear);
            interpolation.dropDownItems.push(Ease);
            interpolation.dropDownItems.push(EaseIn);
            interpolation.dropDownItems.push(EaseOut);
            interpolation.dropDownItems.push(Exponential);
            selectAllMenu.click = ss.bind('_selectAllMenu_Click', this);
            insertDuplicate.click = ss.bind('_insertDuplicate_Click', this);
            cutMenu.click = ss.bind('_cutMenu_Click', this);
            copyMenu.click = ss.bind('_copyMenu_Click', this);
            pasteMenu.click = ss.bind('_pasteMenu_Click', this);
            deleteMenu.click = ss.bind('_deleteMenu_Click', this);
            insertSlide.click = ss.bind('_insertNewSlide_Click', this);
            properties.click = ss.bind('_properties_Click', this);
            captureThumbnail.click = ss.bind('_captureThumbnail_Click', this);
            setSkyPosition.click = ss.bind('_setSkyPosition_Click', this);
            setEndSkyPosition.click = ss.bind('_setEndSkyPosition_Click', this);
            showEndSkyPosition.click = ss.bind('_showEndSkyPosition_Click', this);
            showSkyPosition.click = ss.bind('_showSkyPosition_Click', this);
            playFromHere.click = ss.bind('_playFromHere_Click', this);
            masterSlide.click = ss.bind('_masterSlide_Click', this);
            setNextSlide.click = ss.bind('_setNextSlide_Click', this);
            trackSpaceTime.click = ss.bind('_trackSpaceTime_Click', this);
            insertSlideshow.click = ss.bind('_insertSlideshow_Click', this);
            fadeInOverlays.click = ss.bind('_fadeInOverlays_Click', this);
            if (this._tour.get_currentTourStop().get_masterSlide()) {
                masterSlide.checked = true;
            }
            if (this._tour.get_currentTourStop().get_hasTime()) {
                trackSpaceTime.checked = true;
            }
            fadeInOverlays.checked = this._tour.get_currentTourStop().get_fadeInOverlays();
            this._contextMenu.items.push(selectAllMenu);
            this._contextMenu.items.push(sep7);
            this._contextMenu.items.push(cutMenu);
            this._contextMenu.items.push(copyMenu);
            pasteMenu.enabled = this.tourEditorUI.clipboardType === 'WorldWideTelescope.Slide';
            this._contextMenu.items.push(pasteMenu);
            this._contextMenu.items.push(deleteMenu);
            this._contextMenu.items.push(sep1);
            this._contextMenu.items.push(insertSlide);
            this._contextMenu.items.push(insertDuplicate);
            this._contextMenu.items.push(insertSlideshow);
            this._contextMenu.items.push(sep2);
            this._contextMenu.items.push(playFromHere);
            this._contextMenu.items.push(sep3);
            this._contextMenu.items.push(setSkyPosition);
            this._contextMenu.items.push(setEndSkyPosition);
            this._contextMenu.items.push(sep4);
            this._contextMenu.items.push(showSkyPosition);
            this._contextMenu.items.push(showEndSkyPosition);
            this._contextMenu.items.push(sep5);
            this._contextMenu.items.push(captureThumbnail);
            this._contextMenu.items.push(sep6);
            this._contextMenu.items.push(masterSlide);
            this._contextMenu.items.push(setNextSlide);
            this._contextMenu.items.push(fadeInOverlays);
            this._contextMenu.items.push(trackSpaceTime);
            this._contextMenu.items.push(interpolation);
            this._contextMenu._show(Vector2d.create(e.clientX, e.clientY));
        }
    },

    _selectAllMenu_Click: function (sender, e) {
        this.tourStopList.selectAll();
    },

    _interpolation_Click: function (sender, e) {
        var item = sender;
        this._tour.get_currentTourStop().set_interpolationType(item.tag);
    },

    _nextSlideChosen: function () {
        if (this._selectDialog.get_OK()) {
            this._tour.get_currentTourStop().set_nextSlide(this._selectDialog.get_id());
        }
    },

    _setNextSlide_Click: function (sender, e) {
        this._selectDialog = new SelectLink(null);
        this.nextSlideCallback(this._selectDialog, ss.bind('_nextSlideChosen', this));
    },

    _insertDuplicate_Click: function (sender, e) {
        Undo.push(new UndoTourSlidelistChange(Language.getLocalizedText(530, 'Duplicate Slide at End Position'), this._tour));
        var ts = this._tour.get_currentTourStop().copy();
        if (ts == null) {
            return;
        }
        if (ts.get_endTarget() != null) {
            ts.get_endTarget().set_backgroundImageset(ts.get_target().get_backgroundImageset());
            ts.get_endTarget().set_studyImageset(ts.get_target().get_studyImageset());
            ts.set_target(ts.get_endTarget());
            ts.set_startTime(ts.get_endTime());
            ts.set_endTarget(null);
        }
        var $enum1 = ss.enumerate(ts.get_overlays());
        while ($enum1.moveNext()) {
            var overlay = $enum1.current;
            overlay.set_tweenFactor(1);
            overlay.set_animate(!overlay.get_animate());
            overlay.set_animate(!overlay.get_animate());
        }
        ts.set_tweenPosition(0);
        ts.set_fadeInOverlays(false);
        this._tour.insertAfterTourStop(ts);
        this.tourStopList.refresh();
    },

    _fadeInOverlays_Click: function (sender, e) {
        this._tour.get_currentTourStop().set_fadeInOverlays(!this._tour.get_currentTourStop().get_fadeInOverlays());
    },

    _insertSlideshow_Click: function (sender, e) { },

    _trackSpaceTime_Click: function (sender, e) {
        Undo.push(new UndoTourStopChange(Language.getLocalizedText(532, 'Track Time Edit'), this._tour));
        this._tour.get_currentTourStop().set_hasTime(!this._tour.get_currentTourStop().get_hasTime());
    },

    _masterSlide_Click: function (sender, e) {
        Undo.push(new UndoTourStopChange(Language.getLocalizedText(533, 'Master Slide State Edit'), this._tour));
        this._tour.get_currentTourStop().set_masterSlide(!this._tour.get_currentTourStop().get_masterSlide());
        this.tourStopList.refresh();
    },

    _playFromHere_Click: function (sender, e) {
        this.playFromCurrentTourstop();
    },

    playFromCurrentTourstop: function () {
        this.playing = true;
        globalWWTControl.gotoTarget(this._tour.get_currentTourStop().get_target(), false, true, false);
        SpaceTimeController.set_now(this._tour.get_currentTourStop().get_startTime());
        SpaceTimeController.set_syncToClock(false);
        this.setPlayPauseMode();
    },

    playFromTourstop: function (ts) {
        this._tour.set_currentTourStop(ts);
        this.playFromCurrentTourstop();
    },

    _showSkyPosition_Click: function (sender, e) {
        if (this._tour.get_currentTourStop() != null) {
            globalWWTControl.gotoTarget(this._tour.get_currentTourStop().get_target(), false, true, false);
            this._tour.get_currentTourStop().syncSettings();
            SpaceTimeController.set_now(this._tour.get_currentTourStop().get_startTime());
            SpaceTimeController.set_syncToClock(false);
            this._tour.get_currentTourStop().set_tweenPosition(0);
            setManagerVisibleLayerList(this._tour.get_currentTourStop().layers);
            this.tourStopList.refresh();
        }
    },

    _showEndSkyPosition_Click: function (sender, e) {
        this._tour.get_currentTourStop().set_tweenPosition(1);
        this._tour.get_currentTourStop()._updateLayerOpacity();
        if (this._tour.get_currentTourStop() != null && this._tour.get_currentTourStop().get_endTarget() != null) {
            globalWWTControl.gotoTargetFull(false, true, this._tour.get_currentTourStop().get_endTarget().get_camParams(), this._tour.get_currentTourStop().get_target().get_studyImageset(), this._tour.get_currentTourStop().get_target().get_backgroundImageset());
            globalRenderContext.set_solarSystemTrack(this._tour.get_currentTourStop().get_endTarget().get_target());
            SpaceTimeController.set_now(this._tour.get_currentTourStop().get_endTime());
            this._tour.get_currentTourStop().syncSettings();
            setManagerVisibleLayerList(this._tour.get_currentTourStop().layers);
            SpaceTimeController.set_syncToClock(false);
            this.tourStopList.refresh();
            this.tourEditorUI.clearSelection();
        }
    },

    _setEndSkyPosition_Click: function (sender, e) {
        if (this._tour.get_currentTourStop() != null) {
            Undo.push(new UndoTourStopChange(Language.getLocalizedText(435, 'Set End Camera Position'), this._tour));
            var newPlace = Place.createCameraParams('End Place', globalRenderContext.viewCamera.copy(), 268435456, globalWWTControl.constellation, globalRenderContext.get_backgroundImageset().get_dataSetType(), globalRenderContext.get_solarSystemTrack());
            this._tour.get_currentTourStop().set_endTarget(newPlace);
            this._tour.get_currentTourStop().get_endTarget().set_constellation(globalWWTControl.constellation);
            this._tour.get_currentTourStop().set_endTime(SpaceTimeController.get_now());
            this._tour.get_currentTourStop().set_tweenPosition(1);
            var $enum1 = ss.enumerate(ss.keys(this._tour.get_currentTourStop().layers));
            while ($enum1.moveNext()) {
                var key = $enum1.current;
                var info = this._tour.get_currentTourStop().layers[key];
                if (ss.keyExists(LayerManager.get_layerList(), info.id)) {
                    info.endOpacity = LayerManager.get_layerList()[info.id].get_opacity();
                    info.endParams = LayerManager.get_layerList()[info.id].getParams();
                }
            }
            this._tour.get_currentTourStop()._updateLayerOpacity();
            this.tourStopList.refresh();
            TimeLine.refreshUi();
            this.tourEditorUI.clearSelection();
        }
    },

    _setSkyPosition_Click: function (sender, e) {
        if (this._tour.get_currentTourStop() != null) {
            Undo.push(new UndoTourStopChange(Language.getLocalizedText(434, 'Set Start Camera Position'), this._tour));
            this._tour.get_currentTourStop().get_target().set_target(globalRenderContext.get_solarSystemTrack());
            this._tour.get_currentTourStop().get_target().set_type(globalRenderContext.get_backgroundImageset().get_dataSetType());
            this._tour.get_currentTourStop().get_target().set_camParams(globalRenderContext.viewCamera.copy());
            this._tour.get_currentTourStop().get_target().set_constellation(globalWWTControl.constellation);
            this._tour.get_currentTourStop().get_target().set_studyImageset(globalRenderContext.get_foregroundImageset());
            this._tour.get_currentTourStop().get_target().set_type(globalRenderContext.get_backgroundImageset().get_dataSetType());
            this._tour.get_currentTourStop().get_target().set_backgroundImageset(globalRenderContext.get_backgroundImageset().get_stockImageSet());
            this._tour.get_currentTourStop().captureSettings();
            this._tour.get_currentTourStop().layers = LayerManager._getVisibleLayerList(this._tour.get_currentTourStop().layers);
            this._tour.get_currentTourStop().set_tweenPosition(0);
            this.tourStopList.refresh();
            TimeLine.refreshUi();
            this.tourEditorUI.clearSelection();
        }
    },

    _captureThumbnail_Click: function (sender, e) {
        if (this._tour.get_currentTourStop() != null) {
            this._captureThumbnail(this._tour.get_currentTourStop());
        }
    },

    _captureThumbnail: function (tourStop) {
        var $this = this;

        globalWWTControl.captureThumbnail(function (blob) {
            var filename = ss.format('{0}.thumb.png', tourStop.get_id());
            $this._tour.addCachedFile(filename, blob);
            tourStop.set_thumbnail($this._tour.getCachedTexture(filename, function () {
                $this.tourStopList.refresh();
            }));
        });
    },

    _properties_Click: function (sender, e) {
        throw new Error('The method or operation is not implemented.');
    },

    tourStopList_AddNewSlide: function (sender, e) {
        this.addSlide(false);
        this.tourStopList.ensureAddVisible();
    },

    _addNewSlide_Click: function (sender, e) {
        this.addSlide(false);
        this.tourStopList.ensureAddVisible();
    },

    _insertNewSlide_Click: function (sender, e) {
        this.addSlide(true);
    },

    addSlide: function (insert) {
        Undo.push(new UndoTourSlidelistChange(Language.getLocalizedText(426, 'Add New Slide'), this._tour));
        Cursor.set_current(Cursors.get_waitCursor());
        var placeName = 'Current Screen';
        var newPlace = Place.createCameraParams(placeName, globalRenderContext.viewCamera.copy(), 268435456, globalWWTControl.constellation, globalRenderContext.get_backgroundImageset().get_dataSetType(), globalRenderContext.get_solarSystemTrack());
        newPlace.set_studyImageset(globalRenderContext.get_foregroundImageset());
        newPlace.set_backgroundImageset(globalRenderContext.get_backgroundImageset().get_stockImageSet());
        var newTourStop = TourStop.create(newPlace);
        if (insert) {
            this._tour.insertTourStop(newTourStop);
        } else {
            this._tour.addTourStop(newTourStop);
        }
        if (this._tour.get_currentTourStop() != null) {
            this.musicTrack.target = this._tour.get_currentTourStop();
            this.voiceTrack.target = this._tour.get_currentTourStop();
        } else {
            this.musicTrack.target = null;
            this.voiceTrack.target = null;
        }
        this._tour.get_currentTourStop().layers = LayerManager._getVisibleLayerList(this._tour.get_currentTourStop().layers);
        this._captureThumbnail(newTourStop);
        this.tourStopList.selectedItem = this.tourStopList.findItem(newTourStop);
        this.tourStopList.refresh();
        this.tourEditorUI.clearSelection();
        Cursor.set_current(Cursors.get_defaultV());
        TimeLine.refreshUi();
    },

    _deleteMenu_Click: function (sender, e) {
        Undo.push(new UndoTourSlidelistChange(Language.getLocalizedText(534, 'Delete Slide'), this._tour));
        var $enum1 = ss.enumerate(ss.keys(this.tourStopList.selectedItems));
        while ($enum1.moveNext()) {
            var key = $enum1.current;
            var item = this.tourStopList.selectedItems[key];
            this._tour.removeTourStop(item);
        }
        ss.clearKeys(this.tourStopList.selectedItems);
        this.tourStopList.selectedItem = -1;
        this._tour.set_currentTourStop(null);
        this.musicTrack.target = null;
        this.voiceTrack.target = null;
        this.tourStopList.refresh();
        this.tourEditorUI.clearSelection();
    },

    _pasteMenu_Click: function (sender, e) {
        if (this.tourEditorUI.clipboardType === 'WorldWideTelescope.Slide') {
            Undo.push(new UndoTourSlidelistChange(Language.getLocalizedText(535, 'Paste Slide'), this._tour));
            var xParser = new DOMParser();
            var doc = xParser.parseFromString(this.tourEditorUI.clipboardData, 'text/xml');
            var node = Util.selectSingleNode(doc, 'TourStops');
            var pasteStack = new ss.Stack();
            var $enum1 = ss.enumerate(node.childNodes);
            while ($enum1.moveNext()) {
                var child = $enum1.current;
                if (child.nodeName === 'TourStop') {
                    var ts = TourStop._fromXml(this._tour, child);
                    ts.set_id(Guid.newGuid().toString());
                    pasteStack.push(ts);
                }
            }
            ss.clearKeys(this.tourStopList.selectedItems);
            var curIndex = this.tourStopList.selectedItem + pasteStack.count - 1;
            while (pasteStack.count > 0) {
                var ts = pasteStack.pop();
                this._tour.insertTourStop(ts);
                this.tourStopList.selectedItems[curIndex--] = ts;
            }
            this.tourStopList.refresh();
            this.tourEditorUI.clearSelection();
        }
    },

    _copyMenu_Click: function (sender, e) {
        var writer = new XmlTextWriter();
        writer._writeProcessingInstruction('xml', "version='1.0' encoding='UTF-8'");
        writer._writeStartElement('TourStops');
        var $enum1 = ss.enumerate(ss.keys(this.tourStopList.selectedItems));
        while ($enum1.moveNext()) {
            var key = $enum1.current;
            var item = this.tourStopList.selectedItems[key];
            item._saveToXml(writer, true);
        }
        writer._writeEndElement();
        this.tourEditorUI.clipboardType = 'WorldWideTelescope.Slide';
        this.tourEditorUI.clipboardData = writer.body;
    },

    _cutMenu_Click: function (sender, e) {
        Undo.push(new UndoTourSlidelistChange(Language.getLocalizedText(536, 'Cut Slide'), this._tour));
        this._copyMenu_Click(sender, e);
        var $enum1 = ss.enumerate(ss.keys(this.tourStopList.selectedItems));
        while ($enum1.moveNext()) {
            var key = $enum1.current;
            var item = this.tourStopList.selectedItems[key];
            this._tour.removeTourStop(item);
        }
        ss.clearKeys(this.tourStopList.selectedItems);
        this.tourStopList.refresh();
        this.tourEditorUI.clearSelection();
    },

    pauseTour: function () {
        if (this.playing) {
            this.playing = false;
        }
        this.setPlayPauseMode();
    },

    preview_Click: function (sender, e) {
        this.playing = !this.playing;
        if (this.playing && this._tour.get_editMode()) {
            this.get_tour().set_currentTourstopIndex(-1);
        }
        this.setPlayPauseMode();
    },

    setPlayPauseMode: function () {
        if (this._tour.get_editMode()) {
            if (this.playing) {
                if (this._player == null) {
                    this._player = new TourPlayer();
                }
                this._player.set_tour(this._tour);
                globalWWTControl.uiController = this._player;
                this._player.play();
                this.tourStopList.showAddButton = false;
            }
            else {
                globalWWTControl.uiController = this.tourEditorUI;
                if (this._player != null) {
                    this._player.stop(false);
                }
                this._player = null;
                globalWWTControl.set__mover(null);
                this.tourStopList.showAddButton = this._tour.get_editMode();
            }
        } else {
            if (this.playing) {
                if (this._player == null) {
                    this._player = new TourPlayer();
                }
                this._player.set_tour(this._tour);
                globalWWTControl.uiController = this._player;
                this._player.play();
                this.tourStopList.showAddButton = false;
            }
            else {
                globalWWTControl.uiController = null;
                globalRenderContext.freezeView();
                if (this._player != null) {
                    this._player.stop(false);
                }
                this._player = null;
                globalWWTControl.uiController = null;
                globalWWTControl.set__mover(null);
                this.tourStopList.showAddButton = this._tour.get_editMode();
            }
        }
        this.tourStopList.refresh();
    },

    playerTimer_Tick: function (sender, e) {
        if (this.playing) {
            if (this._player != null) {
                if (!TourPlayer.get_playing()) {
                    this.playing = false;
                    this.setPlayPauseMode();
                }
                else {
                    if (this.tourStopList.selectedItem !== this._tour.get_currentTourstopIndex()) {
                        this.tourStopList.selectedItem = this._tour.get_currentTourstopIndex();
                    }
                }
            }
        }
    },

    insertShapeCircle_Click: function (sender, e) {
        this.tourEditorUI.addShape('', 0);
    },

    insertShapeRectangle_Click: function (sender, e) {
        this.tourEditorUI.addShape('', 1);
    },

    insertShapeLine_Click: function (sender, e) {
        this.tourEditorUI.addShape('', 5);
    },

    insertDonut_Click: function (sender, e) {
        this.tourEditorUI.addShape('', 3);
    },

    _addArrow_Click: function (sender, e) {
        this.tourEditorUI.addShape('', 4);
    },

    insertVideo_Click: function (sender, e) { },

    insertAudio_Click: function (sender, e) { },

    insertHyperlink_Click: function (sender, e) { },

    colorPicker_Click: function (sender, e) { },

    tourEditTab_Leave: function (sender, e) { },

    editTourProperties_Click: function (sender, e) { },

    saveTour_Click: function (sender, e) {
        this.save(false);
    },

    save: function (saveAs) {
        return true;
    },

    addVideo_Click: function (sender, e) { },

    addPicture_Click: function (sender, e) { },

    addShape_Click: function (sender, e) { },

    _addOpenRectangle_Click: function (sender, e) {
        this.tourEditorUI.addShape('', 6);
    },

    _addStar_Click: function (sender, e) {
        this.tourEditorUI.addShape('', 2);
    },

    addText_Click: function (sender, e) { },

    preview_EnabledChanged: function (sender, e) {
        if (this.playing) {
        } else {
        }
    },

    preview_MouseEnter: function (sender, e) { },

    preview_MouseLeave: function (sender, e) { },

    preview_MouseUp: function (sender, e) { },

    preview_MouseDown: function (sender, e) { },

    tourStopList_ItemHover: function (sender, e) { },

    refresh: function () { },

    undoStep: function () {
        if (Undo.peekAction()) {
            Undo.stepBack();
            this.tourStopList.refresh();
            this.tourStopList.selectedItem = this._tour.get_currentTourstopIndex();
            this.showSlideStartPosition(this._tour.get_currentTourStop());
            this.refresh();
            OverlayList._updateOverlayList(this._tour.get_currentTourStop(), this.tourEditorUI.selection);
        }
    },

    redoStep: function () {
        if (Undo.peekRedoAction()) {
            Undo.stepForward();
            this.tourStopList.refresh();
            this.tourStopList.selectedItem = this._tour.get_currentTourstopIndex();
            this.showSlideStartPosition(this._tour.get_currentTourStop());
            this.refresh();
            OverlayList._updateOverlayList(this._tour.get_currentTourStop(), this.tourEditorUI.selection);
        }
    },

    tourStopList_ShowEndPosition: function (sender, e) {
        this._showEndSkyPosition_Click(this, new ss.EventArgs());
    },

    tourStopList_ShowStartPosition: function (sender, e) {
        this.showSlideStartPosition(this.get_tour().get_currentTourStop());
        this.tourEditorUI.clearSelection();
    },

    tourStopList_KeyDown: function (sender, e) {
        if (e.ctrlKey) {
            switch (e.keyCode) {
                case 67:
                    this._copyMenu_Click(null, new ss.EventArgs());
                    break;
                case 86:
                    this._pasteMenu_Click(null, new ss.EventArgs());
                    break;
                case 88:
                    this._cutMenu_Click(null, new ss.EventArgs());
                    break;
                case 90:
                    if (Undo.peekAction()) {
                        TourEdit._undoStep();
                    }
                    else {
                        UiTools._beep();
                    }
                    break;
                case 89:
                    if (Undo.peekRedoAction()) {
                        TourEdit._redoStep();
                    }
                    else {
                        UiTools._beep();
                    }
                    break;
            }
        }
        if (e.keyCode === 46) {
            this._deleteMenu_Click(null, new ss.EventArgs());
        }
    },

    _ensureSelectedVisible: function () {
        this.tourStopList.ensureSelectedVisible();
    }
};

registerType("TourEditTab", [TourEditTab, TourEditTab$, null]);
