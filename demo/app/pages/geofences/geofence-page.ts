import { EventData, Observable} from "data/observable";
import { Page } from "ui/page";
import frames = require("ui/frame");
import {GeofenceViewModel} from "./geofence-view-model";
import {BackgroundGeolocation} from "nativescript-background-geolocation-lt";
import Platform = require('platform');

var page;
var bgGeo;
var position;
var geofence;
var model;

// Event handler for Page "navigatingTo" event attached in main-page.xml
export function onShow(args: any) {
    // Get the event sender
    page = <Page>args.object;
    model = new GeofenceViewModel();
    page.bindingContext = model;

    bgGeo = args.context.backgroundGeolocation;

    // Play a UI sound when opening.
    var os = Platform.device.os;
    var soundId = (os.toUpperCase() == 'ANDROID') ? 27 : 1113;
    bgGeo.playSound(soundId);

    if (args.context.position) {
    	position = args.context.position;
    	model.set('action', 'new');
    } else if (args.context.geofence) {
    	geofence = args.context.geofence;
    	model.set('action', 'edit');
    	model.set('identifier', geofence.identifier);
    	model.set('radius', geofence.radius);
    }
}

export function onCancel(args: EventData) {
	page.closeModal();
}

export function onRemove(args: EventData) {
	bgGeo.removeGeofence(geofence.identifier, function() {
		console.log('- remove geofence success: ', geofence.identifier);
		page.closeModal(true);
	}, function(error) {
		console.log('- remove geofence failure: ', geofence.identifier);
		page.closeModal(false);
	});
}

export function onDone(args: EventData) {
	var model = page.bindingContext;
	if (!position) {
		page.closeModal(false);
		return;
	}
	bgGeo.addGeofence({
		identifier: model.identifier,
		notifyOnEntry: model.notifyOnEntry,
		notifyOnExit: model.notifyOnExit,
		notifyOnDwell: model.notifyOnDwell,
		loiteringDelay: model.loiteringDelay,
		radius: model.radius,
		latitude: position.latitude,
		longitude: position.longitude
	}, function() {
		page.closeModal(model);
	});	
}
