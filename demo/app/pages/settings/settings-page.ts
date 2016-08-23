import { EventData } from "data/observable";
import { Page } from "ui/page";
import { SettingsViewModel } from "./settings-view-model";
import frames = require("ui/frame");

var page;
var bgGeo;
// Event handler for Page "navigatingTo" event attached in main-page.xml
export function navigatingTo(args: EventData) {
  // Get the event sender
  page = <Page>args.object;
  if (!page.bindingContext) {
  	page.bindingContext = new SettingsViewModel();
  }
  bgGeo = args.context;
}

export function onRowClick(args: EventData) {
	var topMost = frames.topmost();
  var navigationEntry = {
    moduleName: "./pages/settings/settings-detail-page",
    animated: true,
    context: {
      setting: args.view.bindingContext,
      bgGeo: bgGeo
    },      
    transition: {
      name: "slide",
      backstackVisible: true
    }
  };
  topMost.navigate(navigationEntry);
}