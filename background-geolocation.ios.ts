

import {AbstractBackgroundGeolocation} from './background-geolocation.common';

declare var TSLocationManager: any;
declare var NSString: any;
declare var NSDictionary: any;
declare var NSArray: any;
declare var NSUTF8StringEncoding: any;
declare var CLCircularRegion: any;

let TS_LOCATION_TYPE_MOTIONCHANGE   = 0;
let TS_LOCATION_TYPE_CURRENT        = 1;
let TS_LOCATION_TYPE_SAMPLE         = 2;

var emptyFn = function(param:any) {};

export class BackgroundGeolocation extends AbstractBackgroundGeolocation {

  private static syncTaskId;

  /**
  * Configuration Methods
  */
  public static on(event:any, success?:Function, failure?:Function) {
    console.log('#on ', event, typeof(event));

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
      this.listeners[event].push({
        success: success,
        error: failure
      });
    } else {
      this.getLocationManager().addListenerCallback(event, function(event) {
        return success(this.getJsObjectFromNSDictionary(event));
      }.bind(this));
    }
  }

  public static configure(config:Object, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;

    var locationManager = this.getLocationManager();
    this.syncTaskId = null;
    this.state     = locationManager.configure(config);
    this.isMoving  = this.state.isMoving;
    this.enabled   = this.state.enabled;

    success(this.getJsObjectFromNSDictionary(this.state));
  }

  public static setConfig(config:Object, success?:any, failure?:any) {
    var locationManager = this.getLocationManager();
    success = success || emptyFn;
    failure = failure || emptyFn;
    locationManager.setConfig(config);
    success(locationManager.getState());
  }

  public static getState(success:Function) {
    success(this.getJsObjectFromNSDictionary(this.getLocationManager().getState()));
  }
  
  /**
  * Tracking Methods
  */
  public static start(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getLocationManager().start();
    if (success) {
      success(true);
    }
  }

  public static stop(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getLocationManager().stop();
    if (success) {
      success(true);
    }
  }

  public static changePace(value: boolean, success?:any, failure?:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.locationManager.changePace(value);
    success(value);
  }

  public static startSchedule(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getLocationManager().startSchedule();
    success(true);
  }

  public static stopSchedule(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getLocationManager().stopSchedule();
    if (success) {
      success(true);
    }
  }

  public static getCurrentPosition(success: Function, failure?:Function, options?:Object) {
    this.currentPositionCallbacks.push({
      success: success,
      error: failure || emptyFn
    });
    this.getLocationManager().updateCurrentPosition(options||{});
  }

  public static watchPosition(success:Function, failure?:Function, options?:Object) {
    this.watchPositionCallbacks.push({
      success: success,
      error: failure || emptyFn
    });
    this.getLocationManager().watchPosition(options||{});
  }

  public static stopWatchPosition(success?:Function, failure?:Function) {
    this.getLocationManager().stopWatchPosition();
    this.watchPositionCallbacks = [];
    if (success) {
      success();
    }
  }

  public static getOdometer(success:Function, failure?:Function) {
    success(this.getLocationManager().getOdometer());
  }

  public static resetOdometer(success?:Function) {
    success = success || emptyFn;
    this.getLocationManager().resetOdometer();
    success(true);
  }

  /**
  * HTTP & Persistence Methods
  */
  public static sync(success?:Function, failure?:Function) {
    if (this.syncCallback) {
        failure("A sync action is already in progress");
        return;
    }
    var locationManager = this.getLocationManager();
    failure = failure || emptyFn;

    // Important to set these before we execute #sync since this fires a *very fast* async NSNotification event!
    this.syncTaskId = locationManager.createBackgroundTask();
    var locations   = locationManager.sync();
    if (locations == null) {
        locationManager.stopBackgroundTask(this.syncTaskId);
        this.syncCallback = null;
        this.syncTaskId = null;
        failure("Sync failed.  Is there a network connection or previous sync-task pending?");
        return;
    } else {
      this.syncCallback = {
        success: success,
        error: failure || this.emptyFn
      }
    }
  }

  public static getLocations(success:Function, failure?:Function) {
    failure = failure || emptyFn;
    var rs = this.getLocationManager().getLocations();
    success(rs);
  }

  public static getCount(success: Function) {
    success(this.getLocationManager().getCount());
  }

  public static insertLocation(data:any, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    if (!data.timestamp) {
      return failure('Must contain a timestamp');
    } else if (!data.uuid) {
      return failure('Must contain a UUID');
    } else if (!data.latitude) {
      return failure('Must contain a latitude');
    } else if (!data.longitude) {
      return failure('Must contain a longitude');
    }
    if (this.getLocationManager().insertLocation(data)) {
      if (success) { success(true); }
    } else if (failure) {
      failure(false);
    }
  }

  // @deprecated
  public static clearDatabase(success?:Function, failure?:Function) {
    this.destroyLocations(success, failure);
  }

  public static destroyLocations(success?:Function, failure?:Function) {
    if (this.getLocationManager().destroyLocations()) {
      if (success) { success();}
    } else {
      if (failure) { failure();}
    }
  }

  /**
  * Geofencing Methods
  */
  public static addGeofence(params:any, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;

    if (!params.identifier) {
      throw "#addGeofence requires an 'identifier'";
    }
    if (!(params.latitude && params.longitude)) {
        throw "#addGeofence requires a #latitude and #longitude";
    } 
    if (!params.radius) {
        throw "#addGeofence requires a #radius";
    }
    if ( (typeof(params.notifyOnEntry) === 'undefined') && (typeof(params.notifyOnExit) === 'undefined') ) {
        throw "#addGeofence requires at least notifyOnEntry {Boolean} and/or #notifyOnExit {Boolean}";
    }
    if (typeof(params.notifyOnEntry) === 'undefined') {
      params.notifyOnEntry = false;
    }
    if (typeof(params.notifyOnExit) === 'undefined') {
      params.notifyOnEntry = false;
    }
    this.getLocationManager().addGeofenceSuccessError(params, success, failure);
  }

  public static removeGeofence(identifier:string, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getLocationManager().removeGeofenceSuccessError(identifier, success, failure);
  }

  public static addGeofences(geofences:Array<Object>, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getLocationManager().addGeofencesSuccessError(geofences, success, failure);
  }

  public static removeGeofences(geofences?:Array<string>, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    var geofences = geofences || [];
    this.getLocationManager().removeGeofencesSuccessError(geofences, success, failure);
  }

  public static getGeofences(success:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    success(this.getJsArrayFromNSArray(this.getLocationManager().getGeofences()));
  }

  /**
  * Logging & Debug methods
  */
  public static playSound(soundId:number) {
    this.getLocationManager().playSound(soundId);
  }

  public static getLog(success:Function, failure?:Function) {
    success(this.getLocationManager().getLog());
  }

  public static destroyLog(success?:Function, failure?:Function) {
    if (this.getLocationManager().destroyLog()) {
      if (success) {
        success();
      }
    } else if (failure) {
      failure();
    }
  }

  public static emailLog(email:string) {
    this.getLocationManager().emailLog(email);
  }

  /**
  * Private
  */
  private static onLocation(location:Object, type:any, isMoving:boolean) {
    var callbacks = this.listeners.location;
    var locationData = this.getJsObjectFromNSDictionary(location);
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success(locationData);
    }
    if (type != TS_LOCATION_TYPE_SAMPLE && this.currentPositionCallbacks.length) {
      for (var n=0,len=this.currentPositionCallbacks.length;n<len;n++) {
        this.currentPositionCallbacks[n].success(locationData);
      }
      this.currentPositionCallbacks = [];
    }
  }

  private static onMotionChange(location:Object, isMoving:boolean) {
    var callbacks   = this.listeners.motionchange;
    var locationData = this.getJsObjectFromNSDictionary(location);
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success(isMoving, locationData);
    }
  }

  private static onGeofence(region:any, location:Object, action:string) {
    var callbacks   = this.listeners.geofence;
    var locationData = this.getJsObjectFromNSDictionary(location);
    var params = {
      identifier: region.identifier,
      action: action,
      location: locationData
    };
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success(params);
    }
  }

  private static onHttp(statusCode:number, requestData:any, responseData:any, error:any) {
    var callbacks = this.listeners.http;
    var responseText = NSString.alloc().initWithDataEncoding(responseData, NSUTF8StringEncoding);
    var cb;
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success({
        status: statusCode,
        responseText: responseText
      });
    }
  }

  private static onError(type: string, error: any) {
    if (type === 'location') {
      var errorCode = error.code;
      var listeners = this.currentPositionCallbacks;
      if (listeners.length) {
        for (var n=0,len=this.currentPositionCallbacks.length;n<len;n++) {
          listeners[n].error(errorCode);
        }
        this.currentPositionCallbacks = [];
      }
      /* TODO broken
      listeners = this.listeners.location;
      for (var n=0,len=listeners.length;n<len;n++) {
        listeners[n].error[n](errorCode);
      }
      */
    }
  }

  private static onHeartbeat(motionType:string, location:Object) {
    var params = {
      motionType: motionType,
      location: this.getJsObjectFromNSDictionary(location)
    };
    var callbacks = this.listeners.heartbeat;
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success(params);
    }
  }

  private static onSyncComplete(locations:Array<Object>) {
    if (this.syncCallback == null) {
      return;
    }
    this.syncCallback.success(this.getJsArrayFromNSArray(locations));
    this.getLocationManager().stopBackgroundTask(this.syncTaskId);
    this.syncCallback = null;
    this.syncTaskId = null;
  }

  private static onActivityChange(activityName:string) {
    var callbacks   = this.listeners.activitychange;
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success(activityName);
    }
  }

  private static onProviderChange(status:any) {
    var enabled = (status == 3);
    var result = {
      enabled: enabled,
      gps: enabled,
      network: enabled
    };
    var callbacks   = this.listeners.providerchange;
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success(result);
    }
  }

  private static onSchedule(schedule: Object) {
    var state = this.locationManager.getState();

    var callbacks = this.listeners.schedule;
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success(state);
    }
  }

  private static getLocationManager() {
    if (!this.locationManager) {
      this.locationManager = TSLocationManager.sharedInstance();

      this.locationManager.locationChangedBlock   = this.onLocation.bind(this);
      this.locationManager.httpResponseBlock      = this.onHttp.bind(this);
      this.locationManager.motionChangedBlock     = this.onMotionChange.bind(this);
      this.locationManager.geofenceBlock          = this.onGeofence.bind(this);
      this.locationManager.activityChangedBlock   = this.onActivityChange.bind(this);
      this.locationManager.authorizationChangedBlock   = this.onProviderChange.bind(this);
      this.locationManager.errorBlock             = this.onError.bind(this);
      this.locationManager.heartbeatBlock         = this.onHeartbeat.bind(this);
      this.locationManager.syncCompleteBlock      = this.onSyncComplete.bind(this);
      this.locationManager.scheduleBlock          = this.onSchedule.bind(this);
    }
    return this.locationManager;
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