import * as application from "application";

if(application.ios) {
  GMSServices.provideAPIKey("AIzaSyAttgr9w-Wwu4TWkeMAPsYwaYvH2ibSPjQ");
}

// fonticon setup
import {TNSFontIcon, fonticon} from 'nativescript-fonticon';
TNSFontIcon.debug = false;
TNSFontIcon.paths = {
  'ion': 'css/ionicons.min.css'
};
TNSFontIcon.loadCss();
application.resources['fonticon'] = fonticon;

if (application.ios) {
	class MyDelegate extends UIResponder {
		public static ObjCProtocols = [UIApplicationDelegate];

	  public applicationPerformFetchWithCompletionHandler(application: UIApplication, completionHandler:any) {
	    console.log('- AppDelegate Rx Fetch event');
	    var fetchManager = TSBackgroundFetch.sharedInstance();
	    fetchManager.performFetchWithCompletionHandler(completionHandler);
	  }
	}
	application.ios.delegate = MyDelegate;
}

application.start({ moduleName: "./pages/map/map-page" });
