import { EventData } from "data/observable";
import { Page } from "ui/page";
import { SettingsViewModel } from "./settings-view-model";

var page;
// Event handler for Page "navigatingTo" event attached in main-page.xml
export function navigatingTo(args: EventData) {
    // Get the event sender
    page = <Page>args.object;
    page.bindingContext = new SettingsViewModel();
}
