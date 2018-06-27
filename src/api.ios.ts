
import {BackgroundGeolocation} from "./background-geolocation";

import * as utils from "utils/utils";

declare var TSLocationManager: any;
declare var TSConfig: any;
declare var NSString: any;
declare var NSDictionary: any;
declare var NSArray: any;
declare var NSUTF8StringEncoding: any;
declare var CLCircularRegion: any;
declare var UIApplication: any;
declare var CLAuthorizationStatus: any;
declare var TSCurrentPositionRequest: any;
declare var TSWatchPositionRequest: any;
declare var TSGeofence: any;

let TS_LOCATION_TYPE_MOTIONCHANGE   = 0;
let TS_LOCATION_TYPE_CURRENT        = 1;
let TS_LOCATION_TYPE_SAMPLE         = 2;

let emptyFn = () => {};

class Api {

  private static adapter:any; 

  /**
  * Configuration Methods
  */
  public static addListener(event:any, success:Function, failure?:Function) {
    let callback;
    failure = failure || emptyFn;
    switch (event) {
      case 'location':
        callback = (tsLocation:any) => {
          let location = this.getJsObjectFromNSDictionary(tsLocation.toDictionary());
          success(location);
        };
        this.getAdapter().onLocationFailure(callback, failure);
        break;
      case 'motionchange':
        callback = (tsLocation:any) => {
          let location = this.getJsObjectFromNSDictionary(tsLocation.toDictionary());
          let isMoving = tsLocation.isMoving;
          success(isMoving, location);
        };
        this.getAdapter().onMotionChange(callback);
        break;
      case 'activitychange':
        callback = (event:any) => {
          let params = {activity: event.activity, confidence: event.confidence};
          success(params);
        }
        this.getAdapter().onActivityChange(callback);
        break;
      case 'heartbeat':
        callback = (event:any) => {
          let location = this.getJsObjectFromNSDictionary(event.location.toDictionary());
          let params = {location: location};
          success(params);
        };
        this.getAdapter().onHeartbeat(callback);
        break;
      case 'geofence':
        callback = (event:any) => {
          let params = event.toDictionary().mutableCopy();
          params.setObjectForKey(event.location.toDictionary(), "location");
          success(this.getJsObjectFromNSDictionary(params));
        };
        this.getAdapter().onGeofence(callback);
        break;
      case 'geofenceschange':
        callback = (event:any) => {
          let params = this.getJsObjectFromNSDictionary(event.toDictionary());
          success(params);
        };
        this.getAdapter().onGeofencesChange(callback);
        break;
      case 'http':
        callback = (event:any) => {
          let params = {
            "success": event.isSuccess, 
            "status": event.statusCode, 
            "responseText": event.responseText
          };
          if (event.isSuccess) {
            success(params);
          } else {
            failure(params);
          }
        };
        this.getAdapter().onHttp(callback);
        break;
      case 'providerchange':
        callback = (event:any) => {
          let params = this.getJsObjectFromNSDictionary(event.toDictionary());
          success(params);
        };
        this.getAdapter().onProviderChange(callback);
        break;
      case 'schedule':
        callback = (event:any) => {
          let state = this.getJsObjectFromNSDictionary(event.state);
          success(state);
        };
        this.getAdapter().onSchedule(callback);
        break;
      case 'powersavechange':
        callback = (event:any) => {
          success(event.isPowerSaveMode);
        };
        this.getAdapter().onPowerSaveChange(callback);
        break;
      case 'enabledchange':
        callback = (event:any) => {
          let params = {
            enabled: event.enabled
          };
          success(params);
        };
        this.getAdapter().onEnabledChange(callback);
        break;
      case 'connectivitychange':
        callback = (event:any) => {
          let params = {
            connected: event.hasConnection
          };
          success(params);
        }
        this.getAdapter().onConnectivityChange(callback);
        break;
    }
    return callback;
  }     

  public static removeListener(event:string, callback:Function) {
    return new Promise((resolve, reject) => {
      this.getAdapter().removeListenerCallback(event, callback);
      // It's not possible to remove single event-listener with NativeScript since the native block is wrapped in a Javascript function
      reject("BackgroundGeolocation#removeListener - Unfortunately it's not possible to remove a single event-listener with NativeScript.  You can only remove ALL listeners for a particular event, eg: removeListeners('location')");
    });
  }

  public static removeListeners(event?:string) {
    return new Promise((resolve, reject) => {
      if (event) {
        this.getAdapter().removeListenersForEvent(event);
      } else {
        this.getAdapter().removeListeners();
      }
      resolve();
    });    
  }

  public static ready(params:any) {
    return new Promise((resolve, reject) => {
      let config = TSConfig.sharedInstance();
      if (config.isFirstBoot) {
        config.updateWithDictionary(params);
      } else if (params.reset === true) {
        config.reset();
        config.updateWithDictionary(params);
      }
      let locationManager = this.getAdapter();
      locationManager.ready();
      resolve(this.getJsObjectFromNSDictionary(config.toDictionary()));
    });
  }

  public static configure(params:any) {
    return new Promise((resolve, reject) => {
      let config = TSConfig.sharedInstance();    
      let locationManager = this.getAdapter();
      locationManager.configure(params);
      resolve(this.getJsObjectFromNSDictionary(config.toDictionary()));
    });
  }

  public static setConfig(params:any) {
    return new Promise((resolve, reject) => {
      let config = TSConfig.sharedInstance();
      config.updateWithDictionary(params);
      resolve(this.getJsObjectFromNSDictionary(config.toDictionary()));
    });    
  }

  public static reset(params:any) {
    return new Promise((resolve, reject) => {
      let config = TSConfig.sharedInstance();
      config.reset();
      config.updateWithDictionary(params);      
      resolve(this.getJsObjectFromNSDictionary(config.toDictionary()));
    });
  }
  
  public static getState() {
    return new Promise((resolve, reject) => {
      let config = TSConfig.sharedInstance();
      resolve(this.getJsObjectFromNSDictionary(config.toDictionary()));
    });    
  }

  /**
  * Tracking Methods
  */
  public static start() {
    return new Promise((resolve, reject) => {
      this.getAdapter().start();
      let config = TSConfig.sharedInstance();
      resolve(this.getJsObjectFromNSDictionary(config.toDictionary()));
    });
  }

  public static stop(success?:Function, failure?:Function) {
    return new Promise((resolve, reject) => {
      this.getAdapter().stop();
      let config = TSConfig.sharedInstance();
      resolve(this.getJsObjectFromNSDictionary(config.toDictionary()));
    });
  }

  public static startGeofences(success?:Function, failure?:Function) {
    return new Promise((resolve, reject) => {
      this.getAdapter().startGeofences();
      let config = TSConfig.sharedInstance();
      resolve(this.getJsObjectFromNSDictionary(config.toDictionary()));
    });
  }

  public static changePace(value: boolean, success?:any, failure?:any) {
    return new Promise((resolve, reject) => {
      this.getAdapter().changePace(value);
      resolve(value);
    });
  }

  public static startSchedule(success?:Function, failure?:Function) {
    return new Promise((resolve, reject) => {
      this.getAdapter().startSchedule();
      let config = TSConfig.sharedInstance();
      resolve(this.getJsObjectFromNSDictionary(config.toDictionary()));
    });
  }

  public static stopSchedule(success?:Function, failure?:Function) {
    return new Promise((resolve, reject) => {
      this.getAdapter().stopSchedule();
      let config = TSConfig.sharedInstance();
      resolve(this.getJsObjectFromNSDictionary(config.toDictionary()));
    });
  }

  public static getCurrentPosition(options:any) {
    return new Promise((resolve, reject) => {
      let request = new TSCurrentPositionRequest();
      request.success = (tsLocation:any) => {
        resolve(this.getJsObjectFromNSDictionary(tsLocation.toDictionary()));
      };
      request.failure = (error) => {
        reject(error);
      };

      if (typeof(options.timeout) === 'number') {
        request.timeout = options.timeout;
      }
      if (typeof(options.maximumAge) === 'number') {
        request.maximumAge = options.maximumAge;
      }
      if (typeof(options.persist) === 'boolean') {
        request.persist = options.persist;
      }
      if (typeof(options.samples) === 'number') {
        request.samples = options.samples;
      }
      if (typeof(options.desiredAccuracy) === 'number') {
        request.desiredAccuracy = options.desiredAccuracy;
      }
      if (typeof(options.extras) === 'object') {
        request.extras = options.extras;
      }
      this.getAdapter().getCurrentPosition(request);
    });    
  }

  public static watchPosition(success:Function, failure:Function, options:any) {
    let request = new TSWatchPositionRequest();
    request.success = (tsLocation:any) => {
      success(this.getJsObjectFromNSDictionary(tsLocation.toDictionary()));
    };
    request.failure = (error) => {
      failure(error);
    };
    if (typeof(options.interval) === 'number') {
      request.interval = options.interval;
    }
    if (typeof(options.desiredAccuracy) === 'number') {
      request.desiredAccuracy = options.desiredAccuracy;
    }      
    if (typeof(options.persist) === 'boolean') {
      request.persist = options.persist;
    }
    if (typeof(options.extras) === 'object') {
      request.extras = options.extras;
    }
    if (typeof(options.timeout) === 'number') {
      request.timeout = options.timeout;
    }
    this.getAdapter().watchPosition(request);
  }

  public static stopWatchPosition(success?:Function, failure?:Function) {
    return new Promise((resolve, reject) => {
      this.getAdapter().stopWatchPosition();
      resolve(true);
    });    
  }

  public static getOdometer() {
    return new Promise((resolve, reject) => {
      resolve(this.getAdapter().getOdometer());
    });    
  }

  public static setOdometer(value:number) {
    return new Promise((resolve, reject) => {
      let request = new TSCurrentPositionRequest();
      request.success = (tsLocation:any) => {
        resolve(this.getJsObjectFromNSDictionary(tsLocation.toDictionary()));
      }
      request.failure = (error) => { reject(error) }
      this.getAdapter().setOdometerRequest(value, request);            
    });    
  }
  public static resetOdometer() {
    return this.setOdometer(0);
  }
  /**
  * HTTP & Persistence Methods
  */
  public static sync() {
    return new Promise((resolve, reject) => {
      this.getAdapter().syncFailure((records) => {
        resolve(this.getJsArrayFromNSArray(records));
      }, (error:any) => {
        reject(error.code);
      });
    });    
  }

  public static getLocations(success:Function, failure?:Function) {
    return new Promise((resolve, reject) => {
      this.getAdapter().getLocationsFailure((rs:any) => {
        resolve(this.getJsArrayFromNSArray(rs));
      }, (error:any) => {
        reject(error);
      });
    });
  }

  public static getCount(success: Function) {
    return new Promise((resolve, reject) => {
      resolve(this.getAdapter().getCount());
    });    
  }

  public static insertLocation(data:any) {
    return new Promise((resolve, reject) => {
      this.getAdapter().insertLocationSuccessFailure(data, (uuid:string) => {
        resolve(uuid);
      }, (error:string) => {
        reject(error);
      });
    });
  }

  // @deprecated
  public static clearDatabase() {
    return this.destroyLocations();
  }

  public static destroyLocations() {
    return new Promise((resolve, reject) => {
      this.getAdapter().destroyLocationsFailure(() => {
        resolve();
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
  * Geofencing Methods
  */
  public static addGeofence(params:any) {
    return new Promise((resolve, reject) => {
      let success = () => { resolve() }
      let failure = (error) => { reject(error) }
      let geofence = this.buildGeofence(params);
      if (geofence) {
        this.getAdapter().addGeofenceSuccessFailure(geofence, success, failure);
      } else {
        reject('Invalid geofence data');
      }
    });
  }

  public static removeGeofence(identifier:string) {
    return new Promise((resolve, reject) => {
      let success = () => { resolve() }
      let failure = (error) => { reject(error) }
      this.getAdapter().removeGeofenceSuccessFailure(identifier, success, failure);
    });
  }

  public static addGeofences(geofences?:Array<any>) {
    return new Promise((resolve, reject) => {
      let rs = [];
      for (let n=0,len=geofences.length;n<len;n++) {
        let geofence = this.buildGeofence(geofences[n]);
        if (geofence != null) {
          rs.push(geofence);
        } else {
          reject('Invalid geofence data: ' + JSON.stringify(geofences[n]));
          return;
        }
      }
      let success = () => { resolve() }
      let failure = (error) => { reject(error) }
      this.getAdapter().addGeofencesSuccessFailure(rs, success, failure);
    });
  }

  public static removeGeofences(geofences?:Array<string>) {
    return new Promise((resolve, reject) => {
      let success = () => { resolve() }
      let failure = (error) => { reject(error) }
      this.getAdapter().removeGeofencesSuccessFailure(geofences, success, failure);
    });
  }

  public static getGeofences() {
    return new Promise((resolve, reject) => {
      this.getAdapter().getGeofencesFailure((geofences:any) => {
        let rs = [];
        for (let loop = 0; loop < geofences.count; loop ++) {
          let geofence = geofences.objectAtIndex(loop);
          rs.push(this.getJsObjectFromNSDictionary(geofence.toDictionary()));
        }
        resolve(rs);
      }, (error:string) => {
        reject(error);
      });
    });
  }

  public static startBackgroundTask() {
    return new Promise((resolve, reject) => {
      resolve(this.getAdapter().createBackgroundTask());
    });
  }

  public static finish(taskId:number) {
    return new Promise((resolve, reject) => {
      this.getAdapter().stopBackgroundTask(taskId);
      resolve();
    });
  }

  /**
  * Logging & Debug methods
  */
  public static playSound(soundId:number) {
    return new Promise((resolve, reject) => {
      this.getAdapter().playSound(soundId);
      resolve();
    });
  }

  public static getLog() {
    return new Promise((resolve, reject) => {
      let success = (log) => { resolve(log) }
      let failure = (error) => { reject(error) }
      this.getAdapter().getLogFailure(success, failure);
    });
  }

  public static destroyLog() {
    return new Promise((resolve, reject) => {
      if (this.getAdapter().destroyLog()) {
        resolve();
      } else {
        reject();
      }
    });
  }

  public static emailLog(email:string) {    
    return new Promise((resolve, reject) => {
      let success = () => { resolve() }
      let failure = (error) => { reject(error) }
      this.getAdapter().emailLogSuccessFailure(email, success, failure);
    });
    
  }

  public static getSensors() {
    return new Promise((resolve, reject) => {
      let adapter = this.getAdapter();
      let result = {
        "platform": "ios",
        "accelerometer": adapter.isAccelerometerAvailable(),
        "gyroscope": adapter.isGyroAvailable(),
        "magnetometer": adapter.isMagnetometerAvailable(),      
        "motion_hardware": adapter.isMotionHardwareAvailable()
      };
      resolve(result);
    });
  }

  public static isPowerSaveMode(success: Function, failure?:Function) {
    return new Promise((resolve, reject) => {
      resolve(this.getAdapter().isPowerSaveMode());
    });
  }

  public static log(level, msg) {
    this.getAdapter().logMessage(level, msg);
  }

  /**
  * Private
  */
  private static buildGeofence(params:any) {
    if (!params.identifier || !params.radius || !params.latitude || !params.longitude) {
      return null;
    }
    let geofence = new TSGeofence();
    geofence.identifier = params.identifier;
    geofence.radius = params.radius;
    geofence.latitude = params.latitude;
    geofence.longitude = params.longitude;
    if (typeof(params.notifyOnEntry) === 'boolean') {
      geofence.notifyOnEntry = params.notifyOnEntry;
    }
    if (typeof(params.notifyOnExit) === 'boolean') {
      geofence.notifyOnExit = params.notifyOnExit;
    }
    if (typeof(params.notifyOnDwell) === 'boolean') {
      geofence.notifyOnDwell = params.notifyOnDwell;
    }
    if (typeof(params.loiteringDelay) === 'number') {
      geofence.loiteringDelay = params.loiteringDelay;
    }
    if (typeof(params.extras) === 'object') {
      geofence.extras = params.extras;
    }
    return geofence;
  }

  private static getAdapter() {
    if (!this.adapter) {
      let app = utils.ios.getter(UIApplication, UIApplication.sharedApplication);
      this.adapter = TSLocationManager.sharedInstance();
      this.adapter.viewController = app.keyWindow.rootViewController;      
    }
    return this.adapter;
  }

  private static getJsObjectFromNSDictionary(dictionary:any) {
    let keys = dictionary.allKeys;
    let result = {};

    for (let loop = 0; loop < keys.count; loop++) {
        let key = keys[loop];
        let item = dictionary.objectForKey(key);

        result[key] = this.getJsObject(item);
    }
    return result;
  }

  private static getJsArrayFromNSArray(array: any): Array<Object> {
    let result = [];

    for (let loop = 0; loop < array.count; loop ++) {
        result.push(this.getJsObject(array.objectAtIndex(loop)));
    }
    return result;
  }

  private static getJsObject(object: any): any {
    if (object instanceof NSDictionary) {
        return this.getJsObjectFromNSDictionary(object);
    }
    if (object instanceof NSArray) {
        return this.getJsArrayFromNSArray(object);
    }
    return object;
  }
}

BackgroundGeolocation.mountNativeApi(Api);


export {BackgroundGeolocation};

