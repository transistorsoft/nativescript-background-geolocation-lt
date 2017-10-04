
import {AbstractBackgroundGeolocation, Logger} from './background-geolocation.common';

import * as utils from "utils/utils";

declare var TSLocationManager: any;
declare var NSString: any;
declare var NSDictionary: any;
declare var NSArray: any;
declare var NSUTF8StringEncoding: any;
declare var CLCircularRegion: any;
declare var UIApplication: any;
declare var CLAuthorizationStatus: any;

let TS_LOCATION_TYPE_MOTIONCHANGE   = 0;
let TS_LOCATION_TYPE_CURRENT        = 1;
let TS_LOCATION_TYPE_SAMPLE         = 2;

var emptyFn = function(param:any) {};

export class BackgroundGeolocation extends AbstractBackgroundGeolocation {

  private static syncTaskId;

  /**
  * Configuration Methods
  */
  public static addListener(event:any, success?:Function, failure?:Function) {
    // Handle {Object} form #on({foo: fooHandler, bar: barHandler});
    if (typeof(event) === 'object') {
      var listener, key;
      for (key in event) {
        this.on(key, event[key]);
      }
      return;
    }
    if (this.events.indexOf(event) < 0) {
      throw "Invalid event: " + event;
    }
    if (typeof(this.listeners[event]) === 'object') {
      let callback;
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
            let params = {"status": event.statusCode, "responseText": event.responseText};
            let callback = (event.isSuccess) ? success : failure;
            success(params);
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
      }
      if (callback) {
        this.registerCallback(event, success, callback);
      }
    } else {
      console.warn('FAiled to find this.events.indexOf: ', event);
    }    
  }     

  protected static removeNativeListener(event:string, callback:Function) {
    this.getAdapter().removeListenerCallback(event, callback);
  }

  public static configure(config:Object, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;

    var locationManager = this.getAdapter();
    this.syncTaskId = null;
    this.state     = locationManager.configure(config);
    this.isMoving  = this.state.isMoving;
    this.enabled   = this.state.enabled;

    success(this.getJsObjectFromNSDictionary(this.state));
  }

  public static setConfig(config:Object, success?:any, failure?:any) {
    var locationManager = this.getAdapter();
    success = success || emptyFn;
    failure = failure || emptyFn;
    locationManager.setConfig(config);
    this.getState(success);
  }

  public static getState(success:Function) {
    success(this.getJsObjectFromNSDictionary(this.getAdapter().getState()));
  }

  /**
  * Tracking Methods
  */
  public static start(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getAdapter().start();
    this.getState(success);
  }

  public static stop(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getAdapter().stop();
    this.getState(success);
  }

  public static startGeofences(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    let adapter = this.getAdapter();
    adapter.startGeofences();
    this.getState(success);
  }

  public static changePace(value: boolean, success?:any, failure?:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getAdapter().changePace(value);
    success(value);
  }

  public static startSchedule(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getAdapter().startSchedule();
    this.getState(success);
  }

  public static stopSchedule(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getAdapter().stopSchedule();
    this.getState(success);
  }

  public static getCurrentPosition(success: Function, failure?:Function, options?:Object) {
    failure = failure || emptyFn;
    this.getAdapter().getCurrentPositionSuccessFailure(options||{}, (tsLocation:any) => {
      success(this.getJsObjectFromNSDictionary(tsLocation.toDictionary()));
    }, (error:any) => {
      failure(error.code);
    });
  }

  public static watchPosition(success:Function, failure?:Function, options?:Object) {
    failure = failure || emptyFn;
    this.getAdapter().watchPositionSuccessFailure(options||{}, (tsLocation:any) => {
      success(this.getJsObjectFromNSDictionary(tsLocation.toDictionary()));
    }, (error:any) => {
      failure(error.code);
    });
  }

  public static stopWatchPosition(success?:Function, failure?:Function) {
    this.getAdapter().stopWatchPosition();
    if (success) {
      success(true);
    }
  }

  public static getOdometer(success:Function, failure?:Function) {
    success(this.getAdapter().getOdometer());
  }

  public static setOdometer(value:number, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getAdapter().setOdometerSuccessFailure(value, (tsLocation:any) => {
      success(this.getJsObjectFromNSDictionary(tsLocation.toDictionary()));
    }, (error:any) => {
      failure(error.code);
    });
  }
  public static resetOdometer(success?:Function, failure?:Function) {
    this.setOdometer(0, success, failure);
  }
  /**
  * HTTP & Persistence Methods
  */
  public static sync(success?:Function, failure?:Function) {    
    failure = failure || emptyFn;

    this.getAdapter().syncFailure((records) => {
      success(this.getJsArrayFromNSArray(records));
    }, (error:any) => {
      failure(error.code);
    });
  }

  public static getLocations(success:Function, failure?:Function) {
    failure = failure || emptyFn;

    this.getAdapter().getLocationsFailure((rs:any) => {
      success(this.getJsArrayFromNSArray(rs));
    }, failure);
  }

  public static getCount(success: Function) {
    success(this.getAdapter().getCount());
  }

  public static insertLocation(data:any, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;

    this.getAdapter().insertLocationSuccessFailure(data, (uuid:string) => {
      success(uuid);
    }, (error:string) => {
      failure(error);
    })
  }

  // @deprecated
  public static clearDatabase(success?:Function, failure?:Function) {
    this.destroyLocations(success, failure);
  }

  public static destroyLocations(success?:Function, failure?:Function) {
    failure = failure || emptyFn;
    this.getAdapter().destroyLocationsFailure(success, failure);
  }

  /**
  * Geofencing Methods
  */
  public static addGeofence(params:any, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;    
    this.getAdapter().addGeofenceSuccessFailure(params, success, failure);
  }

  public static removeGeofence(identifier:string, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getAdapter().removeGeofenceSuccessFailure(identifier, success, failure);
  }

  public static addGeofences(geofences?:Array<Object>, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getAdapter().addGeofencesSuccessFailure(geofences, success, failure);
  }

  public static removeGeofences(geofences?:Array<string>, success?:Function, failure?:Function) {
    if (typeof(geofences) === 'function') {
      failure = success;
      success = geofences;
      geofences = [];
    }
    geofences = geofences || [];
    success = success || emptyFn;
    failure = failure || emptyFn;

    this.getAdapter().removeGeofencesSuccessFailure(geofences, success, failure);
  }

  public static getGeofences(success:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getAdapter().getGeofencesFailure((geofences:any) => {
      success(this.getJsArrayFromNSArray(geofences));
    }, (error:string) => {
      failure(error);
    });
  }

  public static startBackgroundTask(success:Function) {
    success(this.getAdapter().createBackgroundTask());
  }

  public static finish(taskId:number) {
    this.getAdapter().stopBackgroundTask(taskId);
  }

  /**
  * Logging & Debug methods
  */
  public static playSound(soundId:number) {
    this.getAdapter().playSound(soundId);
  }

  public static getLog(success:Function, failure?:Function) {
    this.getAdapter().getLogFailure(success, failure);
  }

  public static destroyLog(success?:Function, failure?:Function) {
    if (this.getAdapter().destroyLog()) {
      if (success) {
        success();
      }
    } else if (failure) {
      failure();
    }
  }

  public static emailLog(email:string, success?:Function, failure?:Function) {    
    success = success || emptyFn;
    failure = failure || emptyFn;

    let app = utils.ios.getter(UIApplication, UIApplication.sharedApplication);
    
    this.getAdapter().emailLogSuccessFailure(email, success, failure);    
  }

  public static getSensors(success:Function, failure?:Function) {
    failure = failure || emptyFn;
    let adapter = this.getAdapter();
    let result = {
      "platform": "ios",
      "accelerometer": adapter.isAccelerometerAvailable(),
      "gyroscope": adapter.isGyroAvailable(),
      "magnetometer": adapter.isMagnetometerAvailable(),      
      "motion_hardware": adapter.isMotionHardwareAvailable()
    };
    success(result);
  }

  public static isPowerSaveMode(success: Function, failure?:Function) {
    let isPowerSaveMode = this.getAdapter().isPowerSaveMode();
    success(isPowerSaveMode);
  }

  /**
  * Private
  */    
  
  protected static getAdapter() {
    if (!this.adapter) {
      let app = utils.ios.getter(UIApplication, UIApplication.sharedApplication);
      this.adapter = TSLocationManager.sharedInstance();
      this.adapter.viewController = app.keyWindow.rootViewController;
      this.logger = new Logger(this.adapter);
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