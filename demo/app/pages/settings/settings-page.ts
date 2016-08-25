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
  page.bindingContext = new SettingsViewModel();
  bgGeo = args.context;
}

export function onShow(args: EventData) {
  // Get the event sender
  page = <Page>args.object;
  if (!page.bindingContext) {
    page.bindingContext = new SettingsViewModel();
  }
  bgGeo = args.context;
}

// Seems this is only required for Android
export function onClickBack(args: EventData) {
  frames.topmost().goBack();
}

export function onClickSync() {
  console.log('- onClickSync', bgGeo);
  bgGeo.getCount(function(count) {
    console.log('- Count: ', count);
  });

  bgGeo.sync(function(rs) {
    console.log('- Sync success: ', rs.length, ' records');
  }, function(error) {
    console.log('- Sync error: ', error);
  });
}

export function onClickLogs(args: EventData) {
  // TODO this is broken
  console.log('NOT YET IMPLEMENTED');
  //bgGeo.emailLog('foo@bar.com');
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