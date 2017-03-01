import * as application from "application";
import {BackgroundFetch} from "nativescript-background-fetch";

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
	class MyDelegate extends UIResponder implements UIApplicationDelegate {
		public static ObjCProtocols = [UIApplicationDelegate];

	  public applicationPerformFetchWithCompletionHandler(application: UIApplication, completionHandler:any) {

	  	var controller = application.keyWindow.rootViewController;
	  	console.log('********** controller: ', controller);
	  	
	    console.log('- AppDelegate Rx Fetch event');
	    BackgroundFetch.performFetchWithCompletionHandler(completionHandler);
	  }
	}
	application.ios.delegate = MyDelegate;
}

////
// For debugging
//application.start({ moduleName: "./pages/login/login" });

application.start({ moduleName: "./pages/map/map-page" });

