import { EventData } from "data/observable";
import { Page } from "ui/page";
import { MapModel } from "./map-view-model";
import * as Settings from "application-settings";

var page;
// Event handler for Page "navigatingTo" event attached in main-page.xml
export function navigatingTo(args: EventData) {
    // Get the event sender
    page = <Page>args.object;
    if (!page.bindingContext) {
    	page.bindingContext = new MapModel();
    } else {
    }
}

export function onMapReady(args:any) {
	page.bindingContext.onMapReady(args);
}

export function onCoordinateTapped(args: any) {
	page.bindingContext.onCoordinateTapped(args);
}

export function onCoordinateLongPress(args: any) {
	page.bindingContext.onCoordinateLongPress(args);
}

export function onShapeSelect(args: any) {
	page.bindingContext.onShapeSelect(args);
}