// importing this solves issues with __awaiter not defined using await in Android HeadlessTask
import 'nativescript-tslib';

import {BackgroundGeolocation} from "./background-geolocation";

import app = require('application');

declare var com: any;

let TSConfig = com.transistorsoft.locationmanager.adapter.TSConfig;
let TSCallback = com.transistorsoft.locationmanager.adapter.callback.TSCallback;
let TSLocationCallback = com.transistorsoft.locationmanager.adapter.callback.TSLocationCallback;
let TSLocation = com.transistorsoft.locationmanager.location.TSLocation;
let TSPlayServicesConnectErrorCallback = com.transistorsoft.locationmanager.adapter.callback.TSPlayServicesConnectErrorCallback;
let TSSyncCallback = com.transistorsoft.locationmanager.adapter.callback.TSSyncCallback;
let TSGetLocationsCallback = com.transistorsoft.locationmanager.adapter.callback.TSGetLocationsCallback;
let TSGetCountCallback = com.transistorsoft.locationmanager.adapter.callback.TSGetCountCallback;
let TSInsertLocationCallback = com.transistorsoft.locationmanager.adapter.callback.TSInsertLocationCallback;
let TSGetGeofencesCallback = com.transistorsoft.locationmanager.adapter.callback.TSGetGeofencesCallback;
let TSGetLogCallback = com.transistorsoft.locationmanager.adapter.callback.TSGetLogCallback;
let TSEmailLogCallback = com.transistorsoft.locationmanager.adapter.callback.TSEmailLogCallback;
let TSActivityChangeCallback = com.transistorsoft.locationmanager.adapter.callback.TSActivityChangeCallback;
let TSHttpResponseCallback = com.transistorsoft.locationmanager.adapter.callback.TSHttpResponseCallback;
let TSGeofenceCallback = com.transistorsoft.locationmanager.adapter.callback.TSGeofenceCallback;
let TSGeofencesChangeCallback = com.transistorsoft.locationmanager.adapter.callback.TSGeofencesChangeCallback;
let TSHeartbeatCallback = com.transistorsoft.locationmanager.adapter.callback.TSHeartbeatCallback;
let TSLocationProviderChangeCallback = com.transistorsoft.locationmanager.adapter.callback.TSLocationProviderChangeCallback;
let TSScheduleCallback = com.transistorsoft.locationmanager.adapter.callback.TSScheduleCallback;
let TSPowerSaveChangeCallback = com.transistorsoft.locationmanager.adapter.callback.TSPowerSaveChangeCallback;
let TSEnabledChangeCallback = com.transistorsoft.locationmanager.adapter.callback.TSEnabledChangeCallback;
let TSConnectivityChangeCallback = com.transistorsoft.locationmanager.adapter.callback.TSConnectivityChangeCallback;
let TSCurrentPositionRequest = com.transistorsoft.locationmanager.location.TSCurrentPositionRequest;
let TSWatchPositionRequest = com.transistorsoft.locationmanager.location.TSWatchPositionRequest;
let TSSensors = com.transistorsoft.locationmanager.util.Sensors;
let TSGeofence = com.transistorsoft.locationmanager.geofence.TSGeofence;
let TSLog = com.transistorsoft.locationmanager.logger.TSLog;

let TAG = "TSLocationnManager";
let REQUEST_ACTION_START = 1;
let REQUEST_ACTION_GET_CURRENT_POSITION = 2;
let REQUEST_ACTION_START_GEOFENCES = 3;
let emptyFn = function() {};

let HEADLESS_JOB_SERVICE = "com.transistorsoft.backgroundgeolocation.HeadlessJobService";

// Inform adapter.BackgroundGeolocation when Activity is destroyed.
app.android.on(app.AndroidApplication.activityDestroyedEvent, function(args) {
  console.log('[BackgroundGeolocation] onActivityDestroyedEvent -', args.activity);
  if (!app.android.startActivity) {
    Api.onActivityDestroyed(args);
  }
});

class Api {
	private static forceReload: boolean;
  private static intent:android.content.Intent = null;
  
  public static onActivityDestroyed(args) {
    com.transistorsoft.locationmanager.adapter.BackgroundGeolocation.getInstance(app.android.context.getApplicationContext()).onActivityDestroy();
    this.intent = null;
  }

  public static addListener(event:any, success:Function, failure?:Function) {
    failure = failure || emptyFn;
    var cb;
    switch (event) {
      case 'location':
        cb = this.createLocationCallback(success, failure);
        this.getAdapter().onLocation(cb);
        break;
      case 'motionchange':
        cb = this.createMotionChangeCallback(success);
        this.getAdapter().onMotionChange(cb);
        break;
      case 'activitychange':
        cb = this.createActivityChangeCallback(success);
        this.getAdapter().onActivityChange(cb);
        break;
      case 'http':
        cb = this.createHttpCallback(success, failure);
        this.getAdapter().onHttp(cb);
        break;
      case 'geofence':
        cb = this.createGeofenceCallback(success);
        this.getAdapter().onGeofence(cb);
        break;
      case 'geofenceschange':
        cb = this.createGeofencesChangeCallback(success);
        this.getAdapter().onGeofencesChange(cb);
        break;
      case 'schedule':
        cb = this.createScheduleCallback(success);
        this.getAdapter().onSchedule(cb);
        break;
      case 'heartbeat':
        cb = this.createHeartbeatCallback(success);
        this.getAdapter().onHeartbeat(cb);
        break;
      case 'providerchange':
        cb = this.createProviderChangeCallback(success);
        this.getAdapter().onLocationProviderChange(cb);
        break;
      case 'powersavechange':
        cb = this.createPowerSaveChangeCallback(success);
        this.getAdapter().onPowerSaveChange(cb);
        break;      
      case 'enabledchange':
        cb = this.createEnabledChangeCallback(success);
        this.getAdapter().onEnabledChange(cb);
        break;
      case 'connectivitychange':
        cb = this.createConnectivityChangeCallback(success);
        this.getAdapter().onConnectivityChange(cb);
        break;
    }
    return cb;
  }

  protected static removeListener(event:string, callback:Function) {
    return new Promise((resolve, reject) => {
      this.getAdapter().removeListener(event, callback);
      resolve();
    });
  }
  
  public static removeListeners(event?:string) {
    return new Promise((resolve, reject) => {
      if (event) {
        this.getAdapter().removeListeners(event);
      } else {
        this.getAdapter().removeListeners();
      }
      resolve();
    });
  }

  /**
  * Configuration Methods
  */
  public static ready(params:any) {
    return new Promise((resolve, reject) => {
      let config = TSConfig.getInstance(this.getContext());
      if (config.isFirstBoot()) {
        config.updateWithJSONObject(new org.json.JSONObject(JSON.stringify(this.applyHeadlessJobService(params))));
      } else if (params.reset === true) {
        config.reset();
        config.updateWithJSONObject(new org.json.JSONObject(JSON.stringify(this.applyHeadlessJobService(params))));
      }
      this.getAdapter().ready(new TSCallback({
        onSuccess: () => { 
          resolve(JSON.parse(config.toJson().toString())) 
        },
        onError: (error:string) => { 
          reject(error) 
        }
      }));
    });
  }

  public static configure(params:any) {
    return new Promise((resolve, reject) => {
      let config = TSConfig.getInstance(this.getContext());
      config.updateWithJSONObject(new org.json.JSONObject(JSON.stringify(this.applyHeadlessJobService(params))));

      this.getAdapter().ready(new TSCallback({
        onSuccess: () => {
          resolve(JSON.parse(config.toJson().toString()));
        },
        onError: (error:string) => {
          reject(error);
        }
      }));
    });
  }

  public static setConfig(params:any) {
    return new Promise((resolve, reject) => {
      let config = TSConfig.getInstance(this.getContext());
      config.updateWithJSONObject(new org.json.JSONObject(JSON.stringify(this.applyHeadlessJobService(params))));      
      resolve(JSON.parse(config.toJson().toString()));
    });
  }

  public static reset(params:any) {
    return new Promise((resolve, reject) => {
      let config = TSConfig.getInstance(this.getContext());
      config.reset();
      config.updateWithJSONObject(new org.json.JSONObject(JSON.stringify(this.applyHeadlessJobService(params))));      
      resolve(JSON.parse(config.toJson().toString()));
    });
  }

  public static getState() {
    return new Promise((resolve, reject) => {
      let config = TSConfig.getInstance(this.getContext());
      resolve(JSON.parse(config.toJson().toString()));
    });
  }

  /**
  * Tracking Methods
  */
	public static start() {
    return new Promise((resolve, reject) => {
      var adapter = this.getAdapter();
      let config = TSConfig.getInstance(this.getContext());
      adapter.start(new TSCallback({
        onSuccess: () => {
          resolve(JSON.parse(config.toJson().toString()));
        },
        onFailure: (error:string) => {
          reject(error);
        }
      }));
    });
	}

  public static stop() {
    return new Promise((resolve, reject) => {      
      let adapter = this.getAdapter();
      let config = TSConfig.getInstance(this.getContext());
      adapter.stop(new TSCallback({
        onSuccess: function() {
          resolve(JSON.parse(config.toJson().toString()));
        },
        onFailure: (error:string) => {
          reject(error);
        }
      }));
    });
  }

  public static changePace(value: boolean) {
    return new Promise((resolve, reject) => {
      let adapter = this.getAdapter();
      adapter.changePace(value, new TSCallback({
        onSuccess: () => {
          resolve();
        },
        onFailure: (error:string) => {
          reject(error);
        }
      }));
    });
  }

  public static startSchedule() {
    return new Promise((resolve, reject) => {
      let config = TSConfig.getInstance(this.getContext());
      if (this.getAdapter().startSchedule()) {
        resolve(JSON.parse(config.toJson().toString()));
      } else {
        reject("Failed to start schedule.  Did you configure a #schedule?");
      }
    });
  }

  public static stopSchedule() {
    return new Promise((resolve, reject) => {
      let config = TSConfig.getInstance(this.getContext());
      this.getAdapter().stopSchedule();
      resolve(JSON.parse(config.toJson().toString()));
    });
  }

  public static startGeofences() {
    return new Promise((resolve, reject) => {
      let config = TSConfig.getInstance(this.getContext());      
      this.getAdapter().startGeofences(new TSCallback({
        onSuccess: () => {
          resolve(JSON.parse(config.toJson().toString()));
        },
        onFailure: (error:string) => {
          reject(error);
        }
      }));
    });
  }

  public static getCurrentPosition(options?:any) {
    return new Promise((resolve, reject) => {
      let builder = new TSCurrentPositionRequest.Builder(this.getContext());

      if (typeof(options.samples) === 'number') {
        builder.setSamples(options.samples);
      }
      if (typeof(options.extras) === 'object') {        
        builder.setExtras(new org.json.JSONObject(JSON.stringify(options.extras)));
      }
      if (typeof(options.persist) === 'boolean') {
        builder.setPersist(options.persist);
      }
      if (typeof(options.timeout) === 'number') {
        builder.setTimeout(options.timeout);
      }
      if (typeof(options.maximumAge) === 'number') {
        builder.setMaximumAge(new java.lang.Long(options.maximumAge));
      }
      if (typeof(options.desiredAccuracy) === 'number') {
        builder.setDesiredAccuracy(options.desiredAccuracy);
      }

      builder.setCallback(new TSLocationCallback({
        onLocation: (tsLocation:any) => {
          resolve(JSON.parse(tsLocation.toJson().toString()));
        },
        onError: (error:any) => {
          reject(error);
        }
      }));
      this.getAdapter().getCurrentPosition(builder.build());
    });
  }

  public static watchPosition(success:Function, failure:Function, options:any) {
    let builder = new TSWatchPositionRequest.Builder(this.getContext());
    if (typeof(options.interval) === 'number') {
      builder.setInterval(new java.lang.Long(options.interval));
    }
    if (typeof(options.extras) === 'object') {        
      builder.setExtras(new org.json.JSONObject(JSON.stringify(options.extras)));
    }
    if (typeof(options.persist) === 'boolean') {
      builder.setPersist(options.persist);
    }    
    if (typeof(options.desiredAccuracy) === 'number') {
      builder.setDesiredAccuracy(options.desiredAccuracy);
    }

    builder.setCallback(new TSLocationCallback({
      onLocation: (tsLocation:any) => {
        success(JSON.parse(tsLocation.toJson().toString()));
      },
      onError: (error:number) => {
        failure(error);
      }
    }));
    this.getAdapter().watchPosition(builder.build());
  }

  public static stopWatchPosition() {
    return new Promise((resolve, reject) => {      
      this.getAdapter().stopWatchPosition(new TSCallback({
        onSuccess: () => {
          resolve();
        },
        onError: (error: string) => {
          reject(error);
        }
      }));
    });
  }

  public static getOdometer() {
    return new Promise((resolve, reject) => {
      resolve(this.getAdapter().getOdometer());
    });
  }

  public static setOdometer(value:number) {
    return new Promise((resolve, reject) => {      
      this.getAdapter().setOdometer(new java.lang.Float(value), new TSLocationCallback({
        onLocation: (tsLocation:any) => {
          resolve(JSON.parse(tsLocation.toJson().toString()));
        },
        onError: function(error:number) {
          reject(error);
        }
      }));
    });
  }
  public static resetOdometer(value:number) {
    return this.setOdometer(0);
  }

  /**
  * HTTP & Persistence Methods
  */
  public static sync() {
    return new Promise((resolve, reject) => {      
      this.getAdapter().sync(new TSSyncCallback({
        onSuccess: function(records:any) {
          let size = records.size();
          let result = [];      
          for (let i=0;i<size;i++) {
            let record = records.get(i);
            result.push(JSON.parse(record.json.toString()));
          }
          resolve(result);
        },
        onFailure: function(error:string) {
          reject(error);
        }
      }));
    });
  }


  public static getLocations() {
    return new Promise((resolve, reject) => {
      this.getAdapter().getLocations(new TSGetLocationsCallback({
        onSuccess: (records:any) => {
          let size = records.size();
          let result = [];      
          for (let i=0;i<size;i++) {
            let record = records.get(i);
            result.push(JSON.parse(record.json.toString()));
          }
          resolve(result);
        },
        onFailure: (error:string) => {
          reject(error);
        }
      }));
    });
  }

  public static getCount() {
    return new Promise((resolve, reject) => {
      this.getAdapter().getCount(new TSGetCountCallback({
        onSuccess: (count:number) => {
          resolve(count);
        },
        onFailure: (error:string) => {
          reject(error);
        }
      }));
    });
  }

  public static insertLocation(data:any) {
    return new Promise((resolve, reject) => {
      let callback = new TSInsertLocationCallback({
        onSuccess: (uuid:string) => {
          resolve(uuid);
        },
        onFailure: (error: string) => {
          reject(error);
        }
      });
      this.getAdapter().insertLocation(new org.json.JSONObject(JSON.stringify(data)), callback);
    });
  }

  // @deprecated
  public static clearDatabase() {
    return this.destroyLocations();
  }

  public static destroyLocations() {
    return new Promise((resolve, reject) => {      
      this.getAdapter().destroyLocations(new TSCallback({
        onSuccess: () => {
          resolve();
        },
        onFailure: (error:string) => {
          reject(error);
        }
      }));
    });
  }

  /**
  * Geofencing Methods
  */
  public static addGeofence(params:any) {
    return new Promise((resolve, reject) => {
      try {
        this.getAdapter().addGeofence(this.buildGeofence(params), new TSCallback({
          onSuccess: () => {
            resolve();
          },
          onFailure: (error:string) => {
            reject(error);
          }
        }));
      } catch (error) {
        reject(error.getMessage());
      }
    });
  }

  public static removeGeofence(identifier:string) {
    return new Promise((resolve, reject) => {
      this.getAdapter().removeGeofence(identifier, new TSCallback({
        onSuccess: () => {
          resolve();
        },
        onFailure: (error:string) => {
          reject(error);
        }
      }));
    });
  }

  public static addGeofences(geofences:Array<any>) {
    return new Promise((resolve, reject) => {
      let list = new java.util.ArrayList();
      for (var n=0,len=geofences.length;n<len;n++) {
        try {
          list.add(this.buildGeofence(geofences[n]));
        } catch (error) {
          reject(error.getMessage());
          return;
        }
      }
      this.getAdapter().addGeofences(list, new TSCallback({
        onSuccess: () => {
          resolve();
        },
        onFailure: (error:string) => {
          reject(error);
        }
      }));
    });
  }

  private static buildGeofence(params:any) {
      let builder = new TSGeofence.Builder();
      builder.setIdentifier(params.identifier);
      builder.setLatitude(params.latitude);
      builder.setLongitude(params.longitude);
      builder.setRadius(params.radius);
      if (typeof(params.notifyOnEntry) === 'boolean') { builder.setNotifyOnEntry(params.notifyOnEntry); }
      if (typeof(params.notifyOnExit) === 'boolean') { builder.setNotifyOnExit(params.notifyOnExit); }
      if (typeof(params.notifyOnDwell) === 'boolean') { builder.setNotifyOnDwell(params.notifyOnDwell); }
      if (typeof(params.loiteringDelay) === 'number') { builder.setLoiteringDelay(params.loiteringDelay); }
      if (typeof(params.extras) === 'object') { builder.setExtras(new org.json.JSONObject(JSON.stringify(params.extras))); }
      
      return builder.build();
  }

  public static removeGeofences(geofences?:Array<string>) {
    return new Promise((resolve, reject) => {
      // Handle case where no geofences are provided (ie: remove all geofences).
      geofences = geofences || [];
      
      let identifiers = new java.util.ArrayList();
      geofences.forEach((identifier) => { identifiers.add(identifier); });
      this.getAdapter().removeGeofences(identifiers, new TSCallback({
        onSuccess: () => {
          resolve();
        },
        onFailure: (error:string) => {
          reject(error);
        }
      }));
    });
  }

  public static getGeofences() {
    return new Promise((resolve, reject) => {
      this.getAdapter().getGeofences(new TSGetGeofencesCallback({
        onSuccess: (records:any) => {
          let size = records.size();
          let result = [];      
          for (let i=0;i<size;i++) {
            let geofence = records.get(i);
            result.push(JSON.parse(geofence.toJson()));
          }
          resolve(result);
        },
        onFailure: (error:string) => {
          reject(error);
        }
      }));
    });
  }

  /**
  * Logging & Debug methods
  */
  public static getLog() {
    return new Promise((resolve, reject) => {
      this.getAdapter().getLog(new TSGetLogCallback({
        onSuccess: (log:string) => {
          resolve(log)
        },
        onFailure: (error:string) => {
          reject(error);
        }
      }));
    });
  }

  public static emailLog(email:string) {
    return new Promise((resolve, reject) => {
      this.getAdapter().emailLog(email, app.android.foregroundActivity, new TSEmailLogCallback({
        onSuccess: () => {
          resolve()
        },
        onFailure: (error:string) => {
          reject(error);
        }
      }));
    });
  }

  public static destroyLog() {
    return new Promise((resolve, reject) => {
      this.getAdapter().destroyLog(new TSCallback({
        onSuccess: () => {
          resolve();
        },
        onFailure: (error:string) => {
          reject(error);
        }
      }));
    });
  }

  public static getSensors() {
    return new Promise((resolve, reject) => {
      let sensors = TSSensors.getInstance(app.android.context);
      let result = {
        "platform": "android",
        "accelerometer": sensors.hasAccelerometer(),
        "magnetometer": sensors.hasMagnetometer(),
        "gyroscope": sensors.hasGyroscope(),
        "significant_motion": sensors.hasSignificantMotion()
      };
      resolve(result);
    });
  }

  public static isPowerSaveMode(success: Function, failure?:Function) {
    return new Promise((resolve, reject) => {
      let isPowerSaveMode = this.getAdapter().isPowerSaveMode();
      resolve(isPowerSaveMode);
    });
  }

  public static startBackgroundTask(success:Function) {
    // Just return 0 for compatibility with iOS API.  Android has no concept of these iOS-only background-tasks.
    return new Promise((resolve, reject) => {
      resolve(0);
    });
  }

  public static finish(taskId:number) {
    // Just an empty function for compatibility with iOS.  Android has no concept of these iOS-only background-tasks.
  }

  public static playSound(soundId) {
    return new Promise((resolve, reject) => {
      this.getAdapter().startTone(soundId);
      resolve();
    });
  }

  public static log(level, msg) {
    TSLog.log(level, msg);
  }  

  private static createLocationCallback(success:Function, failure?:Function) {
    failure = failure || emptyFn;
    return new TSLocationCallback({
      onLocation: (tsLocation:any) => {
        success(JSON.parse(tsLocation.toJson().toString()));
      },
      onError: (error) => {
        failure(error);
      }
    });
  }

  private static createMotionChangeCallback(callback:Function) {
    return new TSLocationCallback({
      onLocation: (tsLocation:any) => {
        let isMoving = tsLocation.getIsMoving();
        callback(isMoving, JSON.parse(tsLocation.toJson().toString()));
      },
      onError: (error:number) => {

      }
    });
  }

  private static createHttpCallback(success:Function, failure?:Function) {
    return new TSHttpResponseCallback({
      onHttpResponse: function(response:any) {
        let params = {
          success: response.isSuccess().booleanValue(),
          status: response.status,
          responseText: response.responseText
        };
        if (response.isSuccess().booleanValue()) {
          success(params);
        } else {
          failure(params);
        }
      }
    });
  } 

  private static createActivityChangeCallback(callback:Function) {
    return new TSActivityChangeCallback({
      onActivityChange: (event:any) => {
        callback(JSON.parse(event.toJson().toString()));
      }
    });
  }

  private static createGeofenceCallback(callback:Function) {
    return new TSGeofenceCallback({
      onGeofence: (event:any) => {
        callback(JSON.parse(event.toJson().toString()));
      }
    });
  }

  private static createGeofencesChangeCallback(callback:Function) {
    return new TSGeofencesChangeCallback({
      onGeofencesChange: (event:any) => {
        callback(JSON.parse(event.toJson().toString()));
      }
    });
  }

  private static createScheduleCallback(callback:Function) {
    return new TSScheduleCallback({
      onSchedule: (event:any) => {
        callback(JSON.parse(event.toJson().toString()));
      }
    })
  }

  private static createProviderChangeCallback(callback:Function) {
    return new TSLocationProviderChangeCallback({
      onLocationProviderChange: (event:any) => {
        callback(JSON.parse(event.toJson().toString()));
      }
    })
  }

  private static createHeartbeatCallback(callback:Function) {
    return new TSHeartbeatCallback({
      onHeartbeat: (event:any) => {
        callback(JSON.parse(event.toJson().toString()));
      }
    })
  }

  private static createPowerSaveChangeCallback(callback:Function) {
    return new TSPowerSaveChangeCallback({
      onPowerSaveChange: (isPowerSaveMode) => {
        callback(isPowerSaveMode);
      }
    });
  }

  private static createEnabledChangeCallback(callback:Function) {
    return new TSEnabledChangeCallback({
      onEnabledChange: (enabled:boolean) => {
        console.log('- enabledchange: ', enabled);
        callback({enabled: enabled});
      }
    });
  }

  private static createConnectivityChangeCallback(callback:Function) {
    return new TSConnectivityChangeCallback({
      onConnectivityChange: (event:any) => {
        callback({connected: event.hasConnection()});
      }
    });
  }

  private static applyHeadlessJobService(params):any {
    params.headlessJobService = HEADLESS_JOB_SERVICE;
    return params;
  }

  private static init() {
    if (!app.android.startActivity || (this.intent !== null)) { 
      return; 
    }
    this.intent = app.android.startActivity.getIntent();

    // Handle Google Play Services errors
    this.getAdapter().onPlayServicesConnectError(new TSPlayServicesConnectErrorCallback({
      onPlayServicesConnectError: (errorCode:number) => {
        this.handleGooglePlayServicesConnectError(errorCode);
      }
    }));
    let config = TSConfig.getInstance(this.getContext());
    config.useCLLocationAccuracy(new java.lang.Boolean(true));
  }

  private static getContext() {
    return app.android.context;
  }

  private static getIntent() {
    let activity = (app.android.startActivity) ? app.android.startActivity : app.android.foregroundActivity;
    return (activity) ? activity.getIntent() : this.intent;
  }

  protected static getAdapter(): any {
    if (!this.intent) {
      this.init();
    }
    return com.transistorsoft.locationmanager.adapter.BackgroundGeolocation.getInstance(app.android.context.getApplicationContext(), this.getIntent());
  }

  private static handleGooglePlayServicesConnectError(errorCode:number) {
    com.google.android.gms.common.GoogleApiAvailability.getInstance().getErrorDialog(app.android.foregroundActivity, errorCode, 1001).show();
  }  

}

BackgroundGeolocation.mountNativeApi(Api);

export {BackgroundGeolocation};


