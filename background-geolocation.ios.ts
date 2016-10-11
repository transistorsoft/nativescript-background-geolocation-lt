

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

  public static get LOG_LEVEL_OFF():number { return 0;}
  public static get LOG_LEVEL_ERROR():number {return 1;}
  public static get LOG_LEVEL_WARNING():number { return 2;}
  public static get LOG_LEVEL_INFO():number { return 2;}
  public static get LOG_LEVEL_DEBUG():number { return 2;}
  public static get LOG_LEVEL_VERBOSE():number { return 2;}

  public static get DESIRED_ACCURACY_HIGH():number { return 2;}
  public static get DESIRED_ACCURACY_MEDIUM():number { return 2;}
  public static get DESIRED_ACCURACY_LOW():number { return 2;}
  public static get DESIRED_ACCURACY_VERY_LOW():number { return 2;}

  private syncTaskId;

  constructor() {
    super();
  }

  private getLocationManager() {
    if (!this.locationManager) {
      this.locationManager = new TSLocationManager();

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

  public configure(config, success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;

    var locationManager = this.getLocationManager();
    this.syncTaskId = null;
    this.state     = locationManager.configure(config);
    this.isMoving  = this.state.isMoving;
    this.enabled   = this.state.enabled;

    success(this.getJsObjectFromNSDictionary(this.state));
  }

  public setConfig(config:Object, success:any, failure:any) {
    var locationManager = this.getLocationManager();
    success = success || emptyFn;
    failure = failure || emptyFn;
    locationManager.setConfig(config);
    success(locationManager.getState());
  }
  public getState(success:Function) {
    success(this.getJsObjectFromNSDictionary(this.getLocationManager().getState()));
  }
  public on(event:any, success:Function, failure=function(param){}) {
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

  public changePace(value: boolean, success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.locationManager.changePace(value);
    success(value);
  }

  public start(success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getLocationManager().start();
    if (typeof(success) === 'function') {
      success(true);
    }
  }

  public stop(success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getLocationManager().stop();
    if (typeof(success) === 'function') {
      success(true);
    }
  }

  public startSchedule(success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getLocationManager().startSchedule();
    success(true);
  }

  public stopSchedule(success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getLocationManager().stopSchedule();
    if (typeof(success) === 'function') {
      success(true);
    }
  }

  public sync(success=Function, failure:any) {
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

  public getLocations(success:Function, failure:any) {
    failure = failure || emptyFn;
    var rs = this.getLocationManager().getLocations();
    success(rs);
  }

  public destroyLocations(success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getLocationManager().destroyLocations(success, failure);
  }
  public getCount(success: Function) {
    var count = this.getLocationManager().getCount();
    if (typeof(success) === 'function') {
      success(count);
    }
  }

  public clearDatabase(success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    if (this.getLocationManager().clearDatabase()) {
      success(true);
    } else {
      failure(false);
    }
  }

  public insertLocation(data:any, success:any, failure:any) {
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
      success(true);
    } else {
      failure(false);
    }
  }

  public addGeofence(params, success:any, failure:any) {
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

  public addGeofences(geofences:any, success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getLocationManager().addGeofencesSuccessError(geofences, success, failure);
  }

  public removeGeofence(identifier, success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getLocationManager().removeGeofenceSuccessError(identifier, success, failure);
  }

  public getGeofences(success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;

    var geofences = this.getLocationManager().getGeofences();
    var rs = [];

    for (let loop = 0; loop < geofences.count; loop ++) {
      var geofence = geofences.objectAtIndex(loop);
      rs.push({
        identifier: geofence.identifier,
        radius: geofence.radius,
        latitude: geofence.center.latitude,
        longitude: geofence.center.longitude
      });
    }
    success(rs);
  }

  public removeGeofences(success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    var geofences = [];  // <-- TODO provide a set of identifiers to remove.
    this.getLocationManager().removeGeofences(geofences, success, failure);
  }

  public getCurrentPosition(success: Function, failure:any, options:any) {
    this.currentPositionCallbacks.push({
      success: success,
      error: failure || emptyFn
    });
    this.getLocationManager().updateCurrentPosition(options||{});
  }

  public watchPosition(success:Function, failure:any, options:any) {
    console.error('#watchPosition net yet implemented');
    failure('#watchPosition not yet implemented');
  }

  public stopWatchPosition() {
    this.getLocationManager().stopWatchPosition();
  }

  public getOdometer(success=Function, failure:any) {
    success(this.getLocationManager().getOdometer());
  }

  public resetOdometer(success:any) {
    success = success || emptyFn;
    this.getLocationManager().resetOdometer();
    success(true);
  }

  public playSound(soundId:number) {
    this.getLocationManager().playSound(soundId);
  }

  public getLog(success:Function) {
    success(this.getLocationManager().getLog());
  }

  public emailLog(email:string) {
    this.getLocationManager().emailLog(email);
  }

  private onLocation(location, type, isMoving) {
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

  private onMotionChange(location, isMoving) {
    var callbacks   = this.listeners.motionchange;
    var locationData = this.getJsObjectFromNSDictionary(location);
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success(isMoving, locationData);
    }
  }

  private onGeofence(region, location, action) {
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

  private onHttp(statusCode, requestData, responseData, error) {
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

  private onError(type: string, error: any) {
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

  private onHeartbeat(shakeCount:number, motionType:string, location:any) {
    var params = {
      shakes: shakeCount,
      motionType: motionType,
      location: this.getJsObjectFromNSDictionary(location)
    };
    var callbacks = this.listeners.heartbeat;
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success(params);
    }
  }

  private onSyncComplete(locations: any) {
    if (this.syncCallback == null) {
      return;
    }
    this.syncCallback.success(this.getJsArrayFromNSArray(locations));
    this.getLocationManager().stopBackgroundTask(this.syncTaskId);
    this.syncCallback = null;
    this.syncTaskId = null;
  }

  private onActivityChange(activityName) {
    var callbacks   = this.listeners.activitychange;
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success(activityName);
    }  
  }

  private onProviderChange(status:any) {
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

  private onSchedule(schedule: Object) {
    var state = this.locationManager.getState();

    var callbacks = this.listeners.schedule;
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success(state);
    }
  }

  private getJsObjectFromNSDictionary(dictionary:any) {
    let keys = dictionary.allKeys;
    let result = {};
    
    for (let loop = 0; loop < keys.count; loop++) {
        let key = keys[loop];
        let item = dictionary.objectForKey(key);
        
        result[key] = this.getJsObject(item);
    }
    
    return result;
  }

  private getJsArrayFromNSArray(array: any): Array<Object> {
    let result = [];
    
    for (let loop = 0; loop < array.count; loop ++) {
        result.push(this.getJsObject(array.objectAtIndex(loop)));
    }
    
    return result;
  }

  private getJsObject(object: any): any {
    if (object instanceof NSDictionary) {
        return this.getJsObjectFromNSDictionary(object);
    }
    
    if (object instanceof NSArray) {
        return this.getJsArrayFromNSArray(object);
    }    
    return object;
  }  
}