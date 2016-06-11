import application = require("application");

if(application.ios) {
  GMSServices.provideAPIKey("AIzaSyAeLPdkfLFWLFStQDxr4gZM6thzQXJHTx0");
}

// fonticon setup
import {TNSFontIcon, fonticon} from 'nativescript-fonticon';
TNSFontIcon.debug = false;
TNSFontIcon.paths = {
  'ion': 'css/ionicons.min.css'
};
TNSFontIcon.loadCss();
application.resources['fonticon'] = fonticon;

application.start({ moduleName: "main-page" });
