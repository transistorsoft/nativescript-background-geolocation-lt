/*
In NativeScript, the app.ts file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

import "./bundle-config";
import * as app from 'application';
import {BackgroundFetch} from "nativescript-background-fetch";

// fonticon setup
import {TNSFontIcon, fonticon} from 'nativescript-fonticon';
TNSFontIcon.debug = false;
TNSFontIcon.paths = {
  'ion': 'css/ionicons.min.css'
};
TNSFontIcon.loadCss();

let resources = app.getResources();
resources['fonticon'] = fonticon;
app.setResources(resources);

if (app.ios) {
  class MyDelegate extends UIResponder implements UIApplicationDelegate {
    public static ObjCProtocols = [UIApplicationDelegate];

    public applicationPerformFetchWithCompletionHandler(application: UIApplication, completionHandler:any) {
      console.log('- AppDelegate Rx Fetch event');
      BackgroundFetch.performFetchWithCompletionHandler(application, completionHandler);
    }
  }
  app.ios.delegate = MyDelegate;
}


app.start({ moduleName: 'main-page' });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
