Background Geolocation for NativeScript &middot;
==============================================================================

[![](https://dl.dropboxusercontent.com/s/nm4s5ltlug63vv8/logo-150-print.png?dl=1)](https://www.transistorsoft.com)

-------------------------------------------------------------------------------

The *most* sophisticated background **location-tracking & geofencing** module with battery-conscious motion-detection intelligence for **iOS** and **Android**.

The plugin's [Philosophy of Operation](../../wiki/Philosophy-of-Operation) is to use **motion-detection** APIs (using accelerometer, gyroscope and magnetometer) to detect when the device is *moving* and *stationary*.  

- When the device is detected to be **moving**, the plugin will *automatically* start recording a location according to the configured `distanceFilter` (meters).  

- When the device is detected be **stationary**, the plugin will automatically turn off location-services to conserve energy.

Also available for [Cordova](https://github.com/transistorsoft/cordova-background-geolocation-lt), [ReactNative](https://github.com/transistorsoft/react-native-background-geolocation-lt) and [pure native apps](https://github.com/transistorsoft/background-geolocation-lt).

----------------------------------------------------------------------------

[![Google Play](https://dl.dropboxusercontent.com/s/80rf906x0fheb26/google-play-icon.png?dl=1)](https://play.google.com/store/apps/details?id=com.transistorsoft.backgroundgeolocation.react)

![Home](https://dl.dropboxusercontent.com/s/wa43w1n3xhkjn0i/home-framed-350.png?dl=1)
![Settings](https://dl.dropboxusercontent.com/s/8oad228siog49kt/settings-framed-350.png?dl=1)

# Contents
- ### :books: [API Documentation](./docs/README.md)
  - :wrench: [Configuration Options](./docs/README.md#wrench-configuration-options-1)
  - :zap: [Events](./docs/README.md#zap-events-1)
  - :small_blue_diamond: [Methods](./docs/README.md#large_blue_diamond-methods)        
- ### [Installing the Plugin](#large_blue_diamond-installing-the-plugin)
- ### [Setup Guides](#large_blue_diamond-setup-guides)
- ### [Configure your License](#large_blue_diamond-configure-your-license)
- ### [Android SDK Setup](#large_blue_diamond-android-sdk)
- ### [Using the plugin](#large_blue_diamond-using-the-plugin)
- ### [Example](#large_blue_diamond-example)
- ### [Debugging](../../wiki/Debugging)
- ### [Demo Application](#large_blue_diamond-demo-application)
- ### [Testing Server](#large_blue_diamond-simple-testing-server)


## :large_blue_diamond: Installing the Plugin

#### From npm 
Install the following two plugins:
```bash
$ tns plugin add nativescript-background-geolocation-lt
```

#### From master (latest, greatest.)

In order to install from Github repo, you must first clone the repo to your local machine and compile the Javascript files (the github repo contains no compiled .js files; they're purposely `.gitignore`d)
```
$ git clone https://github.com/transistorsoft/nativescript-background-geolocation-lt.git
$ cd nativescript-background-geolocation-lt
$ npm install
$ tsc
```

The plugin is compiled and ready to be added to your app:
```
$ tns plugin add /path/to/nativescript-background-geolocation-lt
```

## :large_blue_diamond: Setup Guides

### iOS Setup

Since iOS is more strict with apps running in the background, this plugin requires you install [nativescript-background-fetch](https://github.com/transistorsoft/nativescript-background-fetch) (also created by [Transistor Software](http://transistorsoft.com)).  This plugin automatically awakens a suspended app in the background, providing *exactly* 30s of running-time.  Actually implementing **`background-fetch`** in your application code is **optional** -- `background-geolocation` uses it automatically under-the-hood for its own purposes.  However, you **must** perform the plugin's [setup process](https://github.com/transistorsoft/nativescript-background-fetch#setup) in your **`app.ts`**:

**`app.ts`**
```diff

import * as app from 'application';

+import {BackgroundFetch} from "nativescript-background-fetch";

+if (app.ios) {
+  class MyDelegate extends UIResponder implements UIApplicationDelegate {
+    public static ObjCProtocols = [UIApplicationDelegate];

+    public applicationPerformFetchWithCompletionHandler(application: UIApplication, completionHandler:any) {
+      BackgroundFetch.performFetchWithCompletionHandler(completionHandler, application.applicationState);
+    }
+  }
+  app.ios.delegate = MyDelegate;
+}

app.start({ moduleName: 'main-page' });
```

**NOTE** If your build fails with the following errors:
```
app/app.ts(6,28): error TS2304: Cannot find name 'UIResponder'.
app/app.ts(6,51): error TS2304: Cannot find name 'UIApplicationDelegate'.
app/app.ts(7,36): error TS2304: Cannot find name 'UIApplicationDelegate'.
```

This is because your app hasn't loaded the ios platform-declarations.

```bash
$ npm install --save-dev tns-platform-declarations
```

Add the following to the file **`references.d.ts`** in the root of your application (create the file if it doesn't yet exist):

```
/// <reference path="./node_modules/tns-platform-declarations/ios.d.ts" />
/// <reference path="./node_modules/tns-platform-declarations/android.d.ts" />
```


```diff
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "es5",
        "sourceMap": true,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "noEmitHelpers": true,
+        "noEmitOnError": false
    },
    "exclude": [
        "node_modules",
        "platforms"
    ]
}
```

### Android Setup

#### Google Play Services

Since this plugin uses Google Play Services Location, it's very common to have Android build conflicts with *other* plugins using Play Services Location (`com.google.android.gms:play-services-location`) / Android Support libraries (`com.android.support:appcompat-v7`). The key to solving build issues is to ensure that *all* plugins are aligned to the same play-services-location version (eg: `16.0.0`) and support-library versions (eg: `26.1.0`).

You can specify your desired `play-services-location` version in the file:
**`app/App_Resources/Android/app.gradle`**

```gradle
project.ext {
  googlePlayServicesLocationVersion = "16.0.0"
  supportVersion = "27.0.1"
}
```

:exclamation: The plugin requires a minimum play-services version of **`11.2.0`**.  


## :large_blue_diamond: Configure your license

A [License](http://www.transistorsoft.com/shop/products/nativescript-background-geolocation)) is required to unlock Android for `RELEASE` builds.  Without a license key, the plugin will only work for `DEBUG` builds.

Edit the file **`app/App_Resources/Android/App_Resources/AndroidManifest.xml`**.  Copy the following `<meta-data />` tag containing your **YOUR LICENSE KEY** within the `<application>` element:

```diff
<manifest>
  <application>
+    <meta-data android:name="com.transistorsoft.locationmanager.license" android:value="YOUR LICENSE KEY" />
  </application>
</manifest>
```


## :large_blue_diamond: Android SDK

If building from your local machine (as you should be), ensure you have the following items installed or updated in Android SDK Manager
#### SDK Tools
![](https://dl.dropboxusercontent.com/s/qdscbas4krc27c4/android-sdk-tools.png?dl=1)
#### SDK Platforms
![](https://dl.dropboxusercontent.com/s/qetghugog00puz2/android-sdk-platforms.png?dl=1)


## :large_blue_diamond: Demo Application

The plugin hosts its own demo app in the `/demo` folder.  Install it like this:
```Bash
$ git clone https://github.com/transistorsoft/nativescript-background-geolocation-lt.git
$ cd nativescript-background-geolocation-lt
$ npm install
$ npm run setup

$ cd src
$ npm run demo.android
or
$ npm run demo.ios
```

Simulating the location with `City Drive` works well:
![](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/simulate-location.png)

## :large_blue_diamond: Using the plugin ##

```javascript
import BackgroundGeolocation from "nativescript-background-geolocation-lt";
```

## :large_blue_diamond: Example

```Javascript
import {BackgroundGeolocation} from "nativescript-background-geolocation-lt";

export class HelloWorldModel extends observable.Observable {

  private _state: any:

  constructor() {
    super();

    // 1. Listen to events
    BackgroundGeolocation.on("location", this.onLocation.bind(this));
    BackgroundGeolocation.on("motionchange", this.onMotionChange.bind(this));
    BackgroundGeolocation.on("http", this.onHttp.bind(this));
    BackgroundGeolocation.on("heartbeat", this.onHeartbeat.bind(this));
    BackgroundGeolocation.on("schedule", this.onSchedule.bind(this));
    BackgroundGeolocation.on("error", this.onError.bind(this));

    // 2. Configure it.
    BackgroundGeolocation.ready({
      debug: true,
      desiredAccuracy: 0,
      stationaryRadius: 25,
      distanceFilter: 50,
      activityRecognitionInterval: 10000,
      url: 'http://localhost:8080/locations',
      autoSync: true
    }, (state) => {
      // 3. Plugin is now ready to use.
      if (!state.enabled) {
        BackgroundGeolocation.start();
      }
    });
    // NOTE:  Do not execute *any* method which access location-services until
    //  the callback to #configure method executes:

  }
```

:information_source: **NOTE:** The configuration **`{}`** provided to the `#ready` method is applied **only** when your app is **first booted** &mdash; for every launch thereafter, the plugin will automatically load the last known configuration from persistant storage.  If you wish to **force** the `#ready` method to *always* apply the supplied config `{}`, you can specify **`reset: true`**

```javascript
BackgroundGeolocation.ready({
  reset: true,  // <-- true to always apply the supplied config
  distanceFilter: 10
}, (state) => {
  console.log('- BackgroundGeolocation is ready: ', state);
});
```

:warning: Do not execute *any* API method which will require accessing location-services until the callback to **`#ready*` executes (eg: `#getCurrentPosition`, `#watchPosition`, `#start`).

### Promise API

The `BackgroundGeolocation` Javascript API supports [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) for *nearly* every method (the exceptions are **`#watchPosition`** and adding event-listeners via **`#on`** method.  For more information, see the [API Documentation](docs/README.md#large_blue_diamond-methods)

```javascript
// Traditional API still works:
BackgroundGeolocation.ready({desiredAccuracy: 0, distanceFilter: 50}).then(state => {
  console.log('- BackgroundGeolocation is ready: ', state);
}).catch(error => {
  console.log('- BackgroundGeolocation error: ', error);
});
```


## :large_blue_diamond: [Simple Testing Server](https://github.com/transistorsoft/background-geolocation-console)

A simple Node-based [web-application](https://github.com/transistorsoft/background-geolocation-console) with SQLite database is available for field-testing and performance analysis.  If you're familiar with Node, you can have this server up-and-running in about **one minute**.

![](https://dl.dropboxusercontent.com/s/px5rzz7wybkv8fs/background-geolocation-console-map.png?dl=1)

![](https://dl.dropboxusercontent.com/s/tiy5b2oivt0np2y/background-geolocation-console-grid.png?dl=1)


## Licence ##
```
nativescript-background-geolocation
Copyright (c) 2015, Transistor Software (9224-2932 Quebec Inc)
All rights reserved.
sales@transistorsoft.com
http://transistorsoft.com
```

1. Preamble:  This Agreement governs the relationship between YOU OR THE ORGANIZATION ON WHOSE BEHALF YOU ARE ENTERING INTO THIS AGREEMENT (hereinafter: Licensee) and Transistor Software, a LICENSOR AFFILIATION whose principal place of business is Montreal, Quebec, Canada (Hereinafter: Licensor). This Agreement sets the terms, rights, restrictions and obligations on using [{software}] (hereinafter: The Software) created and owned by Licensor, as detailed herein

2. License Grant: Licensor hereby grants Licensee a Personal, Non-assignable &amp; non-transferable, Commercial, Royalty free, Including the rights to create but not distribute derivative works, Non-exclusive license, all with accordance with the terms set forth and other legal restrictions set forth in 3rd party software used while running Software.

	2.1 Limited: Licensee may use Software for the purpose of:
		- Running Software on Licensee's Website[s] and Server[s];
		- Allowing 3rd Parties to run Software on Licensee's Website[s] and Server[s];
		- Publishing Software&rsquo;s output to Licensee and 3rd Parties;
		- Distribute verbatim copies of Software's output (including compiled binaries);
		- Modify Software to suit Licensee&rsquo;s needs and specifications.

	2.2 Binary Restricted: Licensee may sublicense Software as a part of a larger work containing more than Software, distributed solely in Object or Binary form under a personal, non-sublicensable, limited license. Such redistribution shall be limited to unlimited codebases.</li><li>

	2.3 Non Assignable &amp; Non-Transferable: Licensee may not assign or transfer his rights and duties under this license.

	2.4 Commercial, Royalty Free: Licensee may use Software for any purpose, including paid-services, without any royalties

	2.5 Including the Right to Create Derivative Works: </strong>Licensee may create derivative works based on Software, including amending Software&rsquo;s source code, modifying it, integrating it into a larger work or removing portions of Software, as long as no distribution of the derivative works is made.

3. Term & Termination:  The Term of this license shall be until terminated. Licensor may terminate this Agreement, including Licensee's license in the case where Licensee : 

	3.1 became insolvent or otherwise entered into any liquidation process; or

	3.2 exported The Software to any jurisdiction where licensor may not enforce his rights under this agreements in; or

	3.3 Licensee was in breach of any of this license's terms and conditions and such breach was not cured, immediately upon notification; or

	3.4 Licensee in breach of any of the terms of clause 2 to this license; or

	3.5 Licensee otherwise entered into any arrangement which caused Licensor to be unable to enforce his rights under this License.

4. Payment: In consideration of the License granted under clause 2, Licensee shall pay Licensor a FEE, via Credit-Card, PayPal or any other mean which Licensor may deem adequate. Failure to perform payment shall construe as material breach of this Agreement.

5. Upgrades, Updates and Fixes: Licensor may provide Licensee, from time to time, with Upgrades,  Updates or Fixes, as detailed herein and according to his sole discretion. Licensee hereby warrants to keep The Software up-to-date and install all relevant updates and fixes, and may, at his sole discretion, purchase upgrades, according to the rates set by Licensor. Licensor shall provide any update or Fix free of charge; however, nothing in this Agreement shall require Licensor to provide Updates or Fixes.

	5.1 Upgrades: for the purpose of this license, an Upgrade  shall be a material amendment in The Software, which contains new features   and or major performance improvements and shall be marked as a new version number. For example, should Licensee purchase The Software under   version 1.X.X, an upgrade shall commence under number 2.0.0.

	5.2 Updates: for the purpose of this license, an update shall be a minor amendment   in The Software, which may contain new features or minor improvements and   shall be marked as a new sub-version number. For example, should   Licensee purchase The Software under version 1.1.X, an upgrade shall   commence under number 1.2.0.

	5.3 Fix: for the purpose of this license, a fix shall be a minor amendment in   The Software, intended to remove bugs or alter minor features which impair   the The Software's functionality. A fix shall be marked as a new   sub-sub-version number. For example, should Licensee purchase Software   under version 1.1.1, an upgrade shall commence under number 1.1.2.

6. Support: Software is provided under an AS-IS basis and without any support, updates or maintenance. Nothing in this Agreement shall require Licensor to provide Licensee with support or fixes to any bug, failure, mis-performance or other defect in The Software.

	6.1 Bug Notification: Licensee may provide Licensor of details regarding any bug, defect or   failure in The Software promptly and with no delay from such event;  Licensee  shall comply with Licensor's request for information regarding  bugs,  defects or failures and furnish him with information,  screenshots and  try to reproduce such bugs, defects or failures.

	6.2 Feature Request: Licensee may request additional features in Software, provided, however, that (i) Licensee shall waive any claim or right in such feature should feature be developed by Licensor; (ii) Licensee shall be prohibited from developing the feature, or disclose such feature   request, or feature, to any 3rd party directly competing with Licensor or any 3rd party which may be, following the development of such feature, in direct competition with Licensor; (iii) Licensee warrants that feature does not infringe any 3rd party patent, trademark, trade-secret or any other intellectual property right; and (iv) Licensee developed, envisioned or created the feature solely by himself.

7. Liability: To the extent permitted under Law, The Software is provided under an   AS-IS basis. Licensor shall never, and without any limit, be liable for   any damage, cost, expense or any other payment incurred by Licensee as a   result of Software&rsquo;s actions, failure, bugs and/or any other  interaction  between The Software &nbsp;and Licensee&rsquo;s end-equipment, computers,  other  software or any 3rd party, end-equipment, computer or  services. Moreover, Licensor shall never be liable for any defect in  source code  written by Licensee when relying on The Software or using The Software&rsquo;s source  code.

8. Warranty: 

	8.1 Intellectual Property:  Licensor   hereby warrants that The Software does not violate or infringe any 3rd   party claims in regards to intellectual property, patents and/or   trademarks and that to the best of its knowledge no legal action has   been taken against it for any infringement or violation of any 3rd party   intellectual property rights.

	8.2 No-Warranty: The Software is provided without any warranty; Licensor hereby disclaims   any warranty that The Software shall be error free, without defects or code   which may cause damage to Licensee&rsquo;s computers or to Licensee, and  that  Software shall be functional. Licensee shall be solely liable to  any  damage, defect or loss incurred as a result of operating software  and  undertake the risks contained in running The Software on License&rsquo;s  Server[s]  and Website[s].

	8.3 Prior Inspection:  Licensee hereby states that he inspected The Software thoroughly and found   it satisfactory and adequate to his needs, that it does not interfere   with his regular operation and that it does meet the standards and  scope  of his computer systems and architecture. Licensee found that  The Software  interacts with his development, website and server environment  and that  it does not infringe any of End User License Agreement of any  software  Licensee may use in performing his services. Licensee hereby  waives any  claims regarding The Software's incompatibility, performance,  results and  features, and warrants that he inspected the The Software.</p>

9. No Refunds:  Licensee warrants that he inspected The Software according to clause 7(c)   and that it is adequate to his needs. Accordingly, as The Software is   intangible goods, Licensee shall not be, ever, entitled to any refund,   rebate, compensation or restitution for any reason whatsoever, even if   The Software contains material flaws.

10. Indemnification:  Licensee hereby warrants to hold Licensor harmless and indemnify Licensor for any lawsuit brought against it in regards to Licensee&rsquo;s use   of The Software in means that violate, breach or otherwise circumvent this   license, Licensor's intellectual property rights or Licensor's title  in  The Software. Licensor shall promptly notify Licensee in case of such  legal  action and request Licensee's consent prior to any settlement in relation to such lawsuit or claim.

11. Governing Law, Jurisdiction:  Licensee hereby agrees not to initiate class-action lawsuits against Licensor in relation to this license and to compensate Licensor for any legal fees, cost or attorney fees should any claim brought by Licensee against Licensor be denied, in part or in full.


