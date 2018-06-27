/*
In NativeScript, the app.ts file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

import "./bundle-config";
import * as application from 'application';

// fonticon setup
import {TNSFontIcon, fonticon} from 'nativescript-fonticon';
TNSFontIcon.debug = false;
TNSFontIcon.paths = {
  'ion': 'css/ionicons.min.css'
};
TNSFontIcon.loadCss();

let resources = application.getResources();
resources['fonticon'] = fonticon;
application.setResources(resources);


// iOS BackgroundFetch Setup
if (application.ios) {
  class MyDelegate extends UIResponder implements UIApplicationDelegate {
    public static ObjCProtocols = [UIApplicationDelegate];

    public applicationPerformFetchWithCompletionHandler(application: UIApplication, completionHandler:any) {
      BackgroundFetch.performFetchWithCompletionHandler(completionHandler, application.applicationState);
    }
  }
  application.ios.delegate = MyDelegate;
}

application.run({ moduleName: 'app-root' });


// Android HeadlessTask Setup
if (application.android) {
    // BackgroundGeolocation Headless Setup
    BackgroundGeolocation.registerHeadlessTask((event, completionHandler) => {
    console.log('[My Headless Task: ', event.name, event.params);
    // Do stuff.
    completionHandler();  // <-- signal completion of your HeadlessTask
  });

  // BackgroundFetch Headless Setup
  BackgroundFetch.registerHeadlessTask(() => {
    console.log('[My Headless BackgroundFetch Task]');
    BackgroundFetch.finish();
  });
}
/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
