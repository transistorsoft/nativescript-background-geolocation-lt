# Change Log
## [1.9.0-beta.3] - 2018-06-29
- [Changed] Remove `repositories` block from `include.gradle`.  This file gets imported into nativescript context which already provides the required `repositories` block.

## [1.9.0-beta.2] - 2018-06-27
- [Fixed] Android Headless mode was not properly configured.

## [1.9.0-beta.1] - 2018-06-27
- [Added] iOS support for HTTP method `PATCH` (Android already supports it).
- [Fixed] iOS geofence exit event not being executed due to a condition where a stationary event occurs while geofence exit events are awaiting their location to be returned.
- [Added] iOS config `disableLocationAuthorizationAlert` for disabling automatic location-authorization alert when location-services are disabled or user changes toggles location access (eg: `Always` -> `WhenInUse`).
- [Fixed] Android was not executing `#getCurrentPosition` `failure` callback.
- [Added] Add new iOS `locationAuthorizationRequest: "Any"` for allowing the plugin to operate in either `Always` or `WhenInUse` without being spammed by location-authorization dialog.
- [Added] Added new initialization method `#ready`, desigend to replace `#configure` (which is now deprectated).  The new `#ready` method operates in the same manner as `#configure` with a crucial difference -- the plugin will only apply the supplied configuration `{}` at the first launch of your app &mdash; thereafter, it will automatically load the last-known config from persistent storage.
- [Added] Add new method `#reset` for resetting the plugin configuration to documented defaults.
- [Added] Refactor Javascript API to use Promises.  Only `#watchPosition` and adding event-listeners with `#on` will not use promises.
- [Fixed] iOS issue not turning of "keepAlive" system when `#stop` method is executed while stop-detection system is engaged.
- [Changed] Refactor native configuration system for both iOS and Android with more traditional Obj-c / Java API.
- [Changed] Create improved Obj-c / Java APIs for location-requests (`#getCurrentPosition`, `#watchPosition`) and geofencing.
- [Added] Added new event `connectivitychange` for detecting network connectivity state-changes.
- [Added] Added new event `enabledchange`, fired with the plugin enabled state changes.  Executing `#start` / `#stop` will cause this event to fire.  This is primarily designed for use with `stopAfterElapsedMinutes`.
- [Added] Android permissions are now handled completely within `tslocationmanager` library rather than within Cordova Activity.
- [Fixed] iOS `emailLog` issues:  sanity check existence of email client, ensure we have reference to topMost `UIViewController`.
- [Added] New Android "Headless" mechanism allowing you provide a simple custom Java class to receive all events from the plugin when your app is terminated (with `stopOnTerminate: false`).  The headless mechanism is enabled with new `@config {Boolean} enableHeadless`.  See the Wiki "Headless Mode" for details.
- [Fixed] iOS `getCurrentPosition` was applying entire options `{}` as `extras`.
- [Fixed] iOS `watchPosition` / `getCurrentPosition` `@option persist` was being ignored when plugin was disabled (ie: `#stop`ped).
- [Fixed] Implement Android `JobScheduler` API for scheduler (where API_LEVEL) allows it.  Will fallback to existing `AlarmManager` implementation where API_LEVEL doesn't allow `JobScheduler`.  This fixes issues scheduler issues with strict new Android 8 background-operation rules.
- [Added] Added new Android `@config {Boolean} allowIdenticalLocations [false]` for overriding the default behaviour of ignoring locations which are identical to the last location.
- [Added] Add iOS `CLFloor` attribute to `location.coordinate` for use in indoor-tracking when required RF hardware is present in the environment (specifies which floor the device is on).
- [Fixed] Rare issue with iOS where **rapidly** toggling executing `start` with `changePace(true)` in the callback followed by `stop`, over and over again, would lock up the main thread.
- [Changed] Android `GEOFENCE_INITIAL_TRIGGER_DWELL` defaulted to `true`.
- [Fixed] iOS bug when providing non-string `#header` values.  Ensure casted to String.
- [Changed] Android minimum required play-services version is `11.2.0` (required for new `play-services` APis.  Anything less and plugin will crash.
- [Changed] Update Android to use new [`FusedLocationProviderClient`](https://developers.google.com/android/reference/com/google/android/gms/location/FusedLocationProviderClient) instead of now-deprectated `FusedLocationProviderAPI`.  It's the same underlying play-services location API -- just with a much simpler, less error-prone interface to implement.
- [Fixed] On Android, when `changePace(true)` is executed while device is currently `still` (and remains `still`), `stopTimeout` timer would never initiate until device movement is detected.
- [Fixed] iOS manual `#sync` was not executing *any* callback if database was empty.

## [1.7.0] - 2017-10-04

- [Added] Build for iOS 11, XCode 9.
- [Added] Implement new `powersavechange` event in addition to `isPowerSaveMode` method for determining if OS "Power saving" mode is enabled.
- [Added] New config `elasticityMultiplier` for controlling the scale of `distanceFilter` elasticity calculation.
- [Fixed] Android bug not firing `schedule` Javascript listeners
- [Fixed] Android crash `onGooglePlayServicesConnectError` when Google Play Services needs to be updated on device.
- [Changed] Refactor Android `onDestroy` mechanism attempting to solve nagging and un-reproducible null pointer exceptions.
- [Fixed] Fixed bug not where `stopAfterElapsedMinutes` is not evaluated when executing `#getCurrentPosition`.
- [Fixed] Modifications for Android O.  For now, `foregroundService: true` will be enforced when running on Android O (api 26).
- [Fixed] Android `stopOnTerminate` was not setting the `enabled` value to `false` when terminated.  This caused the plugin to automatically `#start` the first time the app was booted (it would work correctly every boot thereafter).
- [Changed] iOS `motionchange` position will be fetch by `CLLocationManager#startUpdatingLocation` rather than `#requestLocation`, since `#requestLocation` cannot keep the app alive in the background.  This could cause the app to be suspended when `motionchange` position was requested due to a background-fetch event.
- [Changed] Change Android HTTP layer to use more modern library `OkHttp3` instead of `Volley`.  Some users reported weird issues with some devices on some servers.  `OkHttp` seems to have solved it for them.  `OkHttp` is a much simpler library to use than `Volley`
- [Changed] `play-services-location` dependency pinned to `:11.+` instead of `:+`
- [Added] Javascript API to plugin's logging system.
- [Fixed] Minor issue with iOS flush where multiple threads might create multiple background-tasks, leaving some unfinished.
- [Changed] Refactor iOS/Android core library event-subscription API.
- [Changed] Removed `taskId` supplied to all event-callbacks.  You no longer have to call `bgGeo.finish(taskId)` in your event-callbacks (though the method will still operate as a `noop` for backwards compatibility).  You will now be responsible for creating your own iOS background-tasks using the method `#startBackgroundTask` when performing long-running tasks in your event-callbacks.
- [Added] iOS and Android now support ability to remove single event-listeners with method `#un`
- [Changed] Improve iOS/Android acquisition of `motionchange` location to ensure a recent location is fetched.
- [Changed] Implement `#getSensors` method for both iOS & Android.  Returns an object indicating the presense of *accelerometer*, *gyroscope* and *magnetometer*.  If any of these sensors are missing, the motion-detection system for that device will poor.
- [Changed] The `activitychange` success callback method signature has been changed from `{String} activityName` -> `{Object}` containing both `activityName` as well as `confidence`.  This event only used to fire after the `activityName` changed (eg: `on_foot` -> `in_vehicle`), regardless of `confidence`.  This event will now fire for *any* change in activity, including `confidence` changes.
- [Changed] iOS `emailLog` will gzip the attached log file.
- [Added] Implement new Android config `notificationPriority` for controlling the behaviour of the `foregroundService` notification and notification-bar icon.
- [Fixed] Android was creating a foreground notification even when `foregroundService: false`
- [Changed] Tweak iOS Location Authorization to not show locationAuthorizationAlert if user initially denies location permission.
- [Fixed] Android:  Remove isMoving condition from geofence proximity evaluator.
- [Fixed] iOS 11 fix:  Added new location-authorization string `NSLocationAlwaysAndWhenInUseUsageDescription`.  iOS 11 now requires location-authorization popup to allow user to select either `Always` or `WhenInUse`.
- [Fixed] Android & iOS will ensure old location samples are ignored with `getCurrentPosition` 
- [Fixed] Android `providerchange` event would continue to persist a providerchange location even when plugin was disabled for the case where location-services is disabled by user.
- [Fixed] Don't mutate iOS `url` to lowercase.  Just lowercase the comparison when checking for `301` redirects. 
- [Changed] Android will attempt up to 5 motionchange samples instead of 3.
- [Changed] Android foregroundService notification priority set to `PRIORITY_MIN` so that notification doesn't always appear on top.
- [Fixed] Android plugin was not nullifying the odometer reference location when `#stop` method is executed, resulting in erroneous odometer calculations if plugin was stopped, moved some distance then started again.
- [Added] Android plugin will detect presense of Sensors `ACCELEROMETER`, `GYROSCOPE`, `MAGNETOMETER` and `SIGNIFICANT_MOTION`.  If any of these sensors are missing, the Android `ActivityRecognitionAPI` is considered non-optimal and plugin will add extra intelligence to assist determining when device is moving.
- [Fixed] Bug in broadcast event `GEOFENCE` not being fired when `MainActivity` is terminated (only applies to those using a `BroadcastReceiver`).
- [Fixed] Android scheduler issue when device is rebooted and plugin is currently within a scheduled ON period (fails to start)
- [Fixed] (Android) Fix error calling `stopWatchPosition` before `#configure` callback has executed.  Also add support for executing `#getCurrentPosition` before `#configure` callback has fired.
- [Added] (Android) Listen to LocationResult while stopTimeout is engaged and perform manual motion-detection by checking if location distance from stoppedAtLocation is > stationaryRadius
- [Fixed] Bug in literal schedule parsing for both iOS and Android
- [Fixed] Bug in Android scheduler after app terminated.  Configured schedules were not having their `onTime` and `offTime` zeroed, resulting in incorrect time comparison.
- [Fixed] Bug in Android scheduler after app terminated.  Configured schedules were not having their `SECOND` and `MILLISECOND` zeroed resulting in incorrect time comparison.
- [Added] New config `stopOnStationary` for both iOS and Android.  Allows you to automatically `#stop` tracking when the `stopTimeout` timer elapses.
- [Added] Support for configuring the "Large Icon" (`notificationLargeIcon`) on Android `foregroundService` notification.  `notificationIcon` has now been aliased -> `notificationSmallIcon`.
- [Fixed] iOS timing issue when fetching `motionchange` position after initial `#start` -- since the significant-location-changes API (SLC) is engaged in the `#stop` method and eagerly returns a location ASAP, that first SLC location could sometimes be several minutes old and come from cell-tower triangulation (ie: ~1000m accuracy).  The plugin could mistakenly capture this location as the `motionchange` location instead of waiting for the highest possible accuracy location that was requested.  SLC API will be engaged only after the `motionchange` location has been received. 
- [Fixed] On Android, when adding a *massive* number of geofences (ie: *thousands*), it can take several minutes to perform all `INSERT` queries.  There was a threading issue which could cause the main-thread to be blocked while waiting for the database lock from the geofence queries to be released, resulting in an ANR (app isn't responding) warning.
- [Changed] Changing the Android foreground-service notification is now supported (you no longer need to `#stop` / `#start` the plugin for changes to take effect).
- [Fixed] Improved Android handling of simultaneous `#getCurrentPosition`, `#start`, `#configure` requests when location-services are not yet authorized by the user (the plugin will buffer all these requests and execute them in order once location-services are authorized).
- [Added] New config option `httpTimeout` (milliseconds) for configuring the timeout where the plugin will give up on sending an HTTP request.
- [Fixed] When iOS engages the `stopTimeout` timer, the OS will pause background-execution if there's no work being performed, in spite of `startBackgroundTask`, preventing the `stopTimeout` timer from running.  iOS will now keep location updates running at minimum accuracy during `stopTimeout` to prevent this.
- [Fixed] Ensure iOS background "location" capability is enabled before asking `CLLocationManager` to `setBackgroundLocationEnabled`.
- [Added] Implement ability to provide literal dates to schedule (eg: `2017-06-01 09:00-17:00`) 
- [Added] When Android motion-activity handler detects `stopTimeout` has expired, it will initiate a `motionchange` without waiting for the `stopTimeout` timer to expire (there were cases where the `stopTimeout` timer could be delayed from firing due likely to vendor-based battery-saving software)
- [Fixed] Android `emailLog` method was using old `adb logcat` method of fetching logs rather than fetching from `#getLog`
- [Fixed] iOS has a new hook to execute an HTTP flush when network reachability is detected.  However, it was not checking if `autoSync: true` or state of `autoSyncThreshold`.
- [Added] When iOS detects a network connection with `autoSync: true`, an HTTP flush will be initiated.
- [Fixed] Improve switching between tracking-mode location and geofence.  It's not necessary to call `#stop` before executing `#start` / `#startGeofences`.
- [Fixed] iOS `maximumAge` with `getCurrentPosition` wasn't clearing the callbacks when current-location-age was `<= maximumAge`
- [Fixed] iOS when `#stop` is executed, nullify the odometer reference location.
- [Fixed] iOS issue with `preventSuspend: true`:  When a `motionchange` event with `is_moving: false` occurred, the event was incorrectly set to `heartbeat` instead of `motionchange`.
- [Fixed] Android null pointer exception when using `startOnBoot: true,

## [1.6.0] - 2017-04-25
- [Changed] iOS minimum version is now `8.4`.  Plugin will log an error when used on versions of iOS that don't implement the method `CLLocationManager#requestLocation`
- [Fixed] iOS bug executing `#setConfig` multiple times too quickly can crash the plugin when multiple threads attempt to modify an `NSMutableDictionary`
- [Fixed] Android was rounding `battery_level` to 1 decimal place.
- [Fixed] iOS geofences-only mode was not using significant-location-change events to evaluate geofences within proximity.
- [Changed] iOS now uses `CLLocationManager requestLocation` to request the `motionchange` position, rather than counting samples.  This is a more robust way to get a single location
- [Fixed] iOS crash when providing `null` values in `Object` config options (ie: `#extras`, `#params`, `#headers`, etc)
- [Added] New config option `locationsOrderDirection [ASC|DESC]` for controlling the order that locations are selected from the database (and synced to your server).  Defaults to `ASC`.
- [Added] Support for iOS geofence `DWELL` transitions.
- [Changed] Updated **proguard config** to ignore `com.transistorsoft.**` -- `tslocationmanager.aar` is *already* pro-guarded.
- [Fixed] iOS bug when composing geofence data for peristence.  Sometimes it appended a `location.geofence.location` due to a shared `NSDictionary`
- [Fixed] Android issue with applying default settings the first time an app boots.  If you execute `#getState` before `#configure` is called, `#getState` would return an empty `{}`.
- [Changed] The licensing model of Android now enforces license only for **release** builds.  If an invalid license is configured while runningin **debug** mode, a Toast warning will appear **"BackgroundGeolocation is running in evaluation mode."**, but the plugin *will* work.
- [Fixed] iOS bug with HTTP `401` handling.
- [Added] The Android plugin now broadcasts all its events using the Android `BroadcastReceiver` mechanism.  You're free to implement your own native Android handler to receive and react to these events as you wish.

## [1.5.0] - 2017-03-01
- [Changed] Refactor iOS / Android Settings management
- [Fixed] Android sqlite migration issue; when upgrading from very old version -> latest, the "geofences" table migration could be skipped.
- [Fixed] `#emailLog` now works.
- [Added] HTTP JSON template features.  See [HTTP Features](./docs/http.md).  You can now template your entire JSON request data sent to the server by the plugin's HTTP layer.
- [Changed] **ANDROID BREAKING** `license` is no longer provided to `#configure` -- You will now add it to your `app/App_Resources/Android/AndroidManifest.xml` (see [README](README.md) for details):

```diff
<manifest>
  <application>
+    <meta-data android:name="com.transistorsoft.locationmanager.license" android:value="YOUR LICENSE KEY" />
  </application>
</manifest>
```

- [Fixed] Migrate Android `providerchange` mechanism out of the `Service` (which only runs when the plugin is `#start`ed) to a place where it will be monitored all the time, regardless if the plugin is enabled or not.
- [Fixed] Catch `IllegalStateException` reported when using `#getLog`
- [Changed] With new Android "Doze-mode", override "idle" on `stopTimeout` and `schedule` alarms
- [Changed] Tweak iOS accelerometer-only motion-detection system.
- [Fixed] Location-authorization alert being popped up after a `suspend` event because the plugin always attempts to ensure it has a stationary-region here.  Simply check current authorization-status is not == `Denied`.
- [Fixed] iOS Location Authorization alert is shown multiple time.  Also discovered a bug where the `providerchange` `enabled` value was calculated based upon hard-coded `Always` where it should have compared to the configured `locationAuthorizationRequest`.
- [Added] If plugin's `#stop` method is called, the Location Authorization Alert will be hidden (if currently visible).

## [1.4.0]
- [Fixed] Locale issue when rounding location float attributes (eg: `speed`, `heading`, `odometer`)
- [Added] `removeListeners` method for removing all event-listeners.
- [Added] Ability to provide optional arbitrary meta-data `extras` on geofences.
- [Changed] Location parameters `heading`, `accuracy`, `odometer`, `speed`, `altitude`, `altitudeAccuracy` are now fixed at 2 decimal places.
- [Fixed] Bug reported with `EventBus already registered` error.  Found a few cases where `EventBus.isRegistered` was not being used.
- [Added] Android will attempt to auto-sync on heartbeat events.
- [Changed] permission `android.hardware.location.gps" **android:required="false"**` 
- [Added] Implement `IntentFilter` to capture `MY_PACKAGE_REPLACED`, broadcast when user upgrades the app.  If you've configured `startOnBoot: true, stopOnTerminate: false` and optionally `foreceRelaodOnBoot: true`, the plugin will automatically restart when user upgrades the app.
- [Changed] When adding a geofence (either `#addGeofence` or `#addGeofences`), if a geofence already exists with the provided `identifier`, the plugin will first destroy the existing one before creating the new one.
- [Changed] When iOS Scheduler is engaged and a scheduled OFF event occurs, the plugin will continue to monitor significant-changes, since background-fetch events alone cannot be counted on.  This will guarantee the plugin evaluates the schedule each time the device moves ~ 1km.  This will have little impact on power consumption, since these sig.change events will not be persisted or `POST`ed, nor will they even be provided to Javascript.
- [Changed] Android Scheduler will `setExact` Alarm triggers (only works for API `>= KITKAT` or if OEM's OS doesn't override it (ie: Samsung)).
- [Fixed] iOS Scheduler was not listening to `BackgroundFetch` events while plugin was disabled, preventing schedule evaluation from fetch-events (user would have to open the app for scheduler to evaluate).
- [Fixed] Android Use more precise Alarm mechanism for `stopTimeout`
- [Fixed] Improve odometer accuracy.  Introduce `desiredOdometerAccuracy` for setting a threshold of location accuracy for calculating odometer.  Any location having `accuracy > desiredOdometerAccuracy` will not be used for odometer calculation.
- [Fixed] When configured with a schedule, the Schedule parser wasn't ordering the schedule entries by start-time.
- [Fixed] Had a report of null-pointer exception when processing an HTTP error response.  I could not reproduce the issue but find a case where accessing a `String` could produce a NPE.

## [1.3.3] - 2016-12-07
- [Fixed] Bug in `setOdometer` callback.  Add permission check on `setOdometer`Fixes issue #42

## [1.3.2] - 2016-12-05
- [Fixed] `http` event `success` callback receives `{}` but `error` receives `String` (issue #36).
- [Changed] Add ability to set odometer to any arbitrary value.  Before, odometer could only be reset to `0` via `resetOdometer`.  The plugin now uses `setOdometer(Float, successFn, failureFn`.  `resetOdometer` is now just an alias for `setOdometer(0)`.  `setOdometer` will now internally perform a `#getCurrentPosition`, so it can know the exact location where the odometer was set at.  As a result, using `#setOdometer` is exactly like performing a `#getCurrentPosition` and the `success` / `failure` callbacks use the same method-signature, where the `success` callback is provided the `location`.
- [Added] Added ability to create your own arbitrary **background tasks** with new `#startBackgroundTask` method.  Some of the plugin's methods receive a `taskId` which you've had to call `bgGeo.finish(taskId)` upon.  These automatically created `taskId` will soon be removed.  It will be **up to you** to create your own as desired, when you need to perform any long-running task in any of the plugin's callbacks.  `#finish` operates in the same manner as before.

## [1.3.1] - 2016-11-30

## [1.3.0] - 2016-11-23
- [Fixed] `stopWatchPostion` callbacks not being called.
- [Fixed] Bug with Android geofences not posting `event: geofence` and the actual `geofence` data was missing (The data sent to Javascript callback was ok, just the data sent to HTTP.
- [Fixed] Logic bug in `TSGeofenceManager`; was not performing geospatial query when changing state from **MOVING -> STATIONARY**.
- [Added] Geofences-only mode for both iOS and Android **BETA**.  Start geofences-only mode with method `#startGeofences`.
- [Changed] Add some intelligence to iOS motion-detection system:  Use a Timer of `activityRecognitionInterval` seconds before engaging location-services after motion is detected.  This helps to reduce false-positives, particularly when using `preventSuspend` while walking around one's house or office.
- [Changed] Add more intelligence to iOS motion-detection system:  The plugin will be **eager** to engage the stop-detection, as soon as it detects `still`, regardless of confidence.  When the plugin is currently in the **moving** state and detects `still`, it will engage a timer of `activityRecognitionInterval` milliseconds -- when this timer expires and the motion-detector still reports `still`, the stop-detection system will be engaged.  If any *moving* type activity occurs during this time, the timer will be cancelled.
- [Fixed] Bug in Android Scheduler, failing to `startOnBoot`.  Issue #985
- [Added] `#removeListeners` method.  Removes all listeners registered with plugin via `#on` method.
- [Changed] With `preventSuspend: true`, the plugin will no longer immediately engage location-services as soon as it sees a "moving"-type motion-activity:  it will now calculate if the current position is beyond stationary geofence. This helps reduce false-positives engaging location-services while simply walking around one's home or office.
- [Fixed] iOS `batchSync`: When only 1 record in batch, iOS fails to pack the records in a JSON `location: []`, appending to a `location: {}` instead.
- [Fixed] Android was only handling the first geofence event when multiple geofences fire simultaneously.
- [Changed] The plugin will ignore `autoSyncThreshold` when a `motionchange` event occurs.
- [Fixed] Fixed ui-blocking issue when plugin boots with locations in its database with `autoSync: true`.  Found a case where the plugin was executing HTTP Service on the UI thread.
- [Fixed] Return current `state {Object}` in callback to `setConfig`.
- [Fixed] iOS Scheduler puked when provided with a `null` or `[]` schedule.
- [Changed] iOS Scheduler behaviour changed to match Android, where `#stopSchedule` does **not** execute `#stop` on the plugin itself.
- [Fixed] FMDB [has issues](https://github.com/ccgus/fmdb/pull/180) binding array arguments (eg: DELETE FROM locations WHERE id IN(?)).  Solution is to simply compose the query string with concatenation.  Sanitization isn't required here anyway, since the ids come directly from my own query.

## [1.2.5] - 2016-10-31
- [Fixed] Issue compiling demo with `typescript@2.x`
- [Fixed] Remove Android deprecation issues with `AndroidManifest.xml`
- [Changed] Refactor Android scheduler to no use a Service.

## [1.2.4] - 2016-10-27
- [Fixed] Bug in Android `#insertLocation` (Reported in issue #23)
- [Fixed] iOS geofencing issue where multiple geofences trigger simultaneously, only the last geofence event would be transmitted to the client and persisted to database.
- [Added] iOS can now initial-trigger a geofence when device is already within the newly added geofence.  Android has always had this behavour by default.  This behaviour is controlled with new `@config {Integer meters} geofenceInitialTriggerEntry [true]`.
- [Fixed] Android had a bug when Activity terminated with `stopOnTerminate: true`

## [1.2.3] - 2016-10-20
- [Changed] Implement database-logging for Android.  Both iOS and Android now send logs to the database.

## [1.2.2] - 2016-10-16
- [Changed] Remove `nativescript-background-fetch` from dependencies.  Users will have to manually `tns plugin add nativescript-background-fetch`, since `tns plugin add nativescript-background-geolocation-lt` doesn't add `background-fetch` the the root `node_modules` folder.  This fixes the problem referencing background-fetch's .podspec file.

## [1.2.1] - 2016-10-14
- [Changed] Refactor typescript API.  `BackgroundGeolocation` API is all static methods now -- You no longer create an instance of `BackgroundGeolocation`
**OLD**
```Javascript
var bgGeo = new BackgroundGeolocation();
bgGeo.configure(config, callback);

```
**NEW**
```Javascript
BackgroundGeolocation.configure(config, callback);
```

This will make interacting with the plugin throughout your views **much** easier, since views are destroyed when navigated away from.

- [Fixed] `package.json` now references a definitions file.  This should solve issue with error reported in issue #18:
```
JS ERROR Error: Could not find module 'nativescript-background-geolocation-lt'
```

## [1.2.0] - 2016-10-11
- [Changed] Refactor iOS Logging system to use popular CocoaLumberjack library.  iOS logs are now stored in the database!  By default, logs are stored for 3 days, but is configurable with `logMaxDays`.  Logs can now be filtered by logLevel:

| logLevel | Label |
|---|---|
|`0`|`LOG_LEVEL_OFF`|
|`1`|`LOG_LEVEL_ERROR`|
|`2`|`LOG_LEVEL_WARNING`|
|`3`|`LOG_LEVEL_INFO`|
|`4`|`LOG_LEVEL_DEBUG`|
|`5`|`LOG_LEVEL_VERBOSE`|

`#getLog`, `#emailLog` operate in the same manner as before.

- [Fixed] If user declines "Motion Activity" permission, plugin failed to detect this authorization failure and fallback to the accelerometer-based motion-detection system.

- [Changed] Refactored Geolocation system.  The plugin is no longer bound by native platform limits on number of geofences which can be monitored (iOS: 20; Android: 100).  You may now monitor infinite geofences.  The plugin now stores geofences in its SQLite db and performs a geospatial query, activating only those geofences in proximity of the device (@config #geofenceProximityRadius, @event `geofenceschange`).  See the new [Geofencing Guide](./docs/geofencing.md)

## [1.1.1] - 2016-09-25
- [Fixed] Bugs in preventSuspend during background-fetch event

## [1.1.0]
- [Changed] Upgrade to nativescript-2.3.0
- [Fixed] Bug in prevent-suspend where the plugin failed to re-start its prevent-suspend timer if no MotionActivity event occurred during that interval.  Prevent-suspend system should now operate completely independently of MotionDetector.
- [Fixed] `#stop` method wasn't calling `stopMonitoringSignificantChanges`, resulting in location-services icon failing to toggle OFF.
- [Fixed] Issue where iOS crashes when configured with null url.
- [Added] iOS `watchPosition` mechanism.
- [Changed] Refactored iOS motion-detection system.  Improved iOS motion-triggering when using `CMMotionActivityManager` (ie: when not using `disableMotionActivityUpdates: true`).  iOS can now trigger out of stationary-mode just like android, where it sees a 'moving-type' motion-activity (eg: 'on_foot', 'in_vehicle', etc).  Note: this will still occur only when your app isn't suspended (eg: app is in foreground, `preventSuspend: true`, or `#watchPosition` is engaged).
- [Changed] Refactored iOS "prevent suspend" system to be more robust.
- [Fixed] iOS locations sent to Javascript client had a different `uuid` than the one persisted to database (and synced to server).
-[Added] new iOS 10 .plist required key for accelerometer updates `NSMmotionUsageDescription` to `config.xml`.
- [Added] New required android permission `<uses-feature android:name="android.hardware.location.gps" />`.
- [Fixed] `removeGeofences` was removing stationary-region.  This would prevent stationary-exit if called while device is in stationary-mode
- [Fixed] Android pukes when it receives an empty schedule `[]`.
- [Fixed] Android when configured with `batchSync: true, autoSync: true` was failing because the plugin automatically tweaked `autoSync: false` but failed to reset it to the configured value.  This behaviour was obsolete and has been removed.
- [Added] Add new config `@param {Integer} autoSyncThreshold [0]`.  Allows you to specify a minimum number of persisted records to trigger an auto-sync action.
- [Fixed] Issue #837.  Android `SimpleDateFormat` used for rendering location timestamp was not being used in a thread-safe manner, resulting in corrupted timestamps for some
- [Fixed] Issue #804, null pointer exeception on mGoogleApiClient
- [Fixed] Issue #806.  PlayServices connect error event was fired before listeners arrive; Dialog to fix problem was never shown.
- [Changed] Removed `app-compat` from Gradle dependencies.
- [Changed] Fire http error callback when HTTP request is not 200ish (ie: 200, 201, 204).  Fixes issue #819.  Contradicts #774.
- [Changed] Remove `play-services:app-compat-v7` from Gradle dependencies
- [Fixed] Android heartbeat location wasn't having its meta-data updated (ie: `event: 'heartbeat', battery:<current-data>, uuid: <new uuid>`)
- [Changed] Reduce Android `minimumActivityRecognitionConfidence` default from `80` to `75` (issue #825)
- [Changed] Android will ask for location-permission when `#configure` is executed, rather than waiting for `#start`.
- [Changeed] Android will catch `java.lang.SecurityException` when attempting to request location-updates without "Location Permission"

## [1.0.4] - 2016-08-01
- Fix bug in Demo

## [1.0.3] - 2016-08-01
- Android & iOS are both working well and nearly ready for action.

## [1.0.2]

## [1.0.1]

## [1.0.0]

