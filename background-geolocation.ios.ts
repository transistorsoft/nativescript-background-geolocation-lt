import {AbstractBackgroundGeolocation} from './background-geolocation.common';

declare var TSLocationManager: any;
declare var NSString: any;
declare var NSUTF8StringEncoding: any;
declare var NSError: any;

let TS_LOCATION_TYPE_MOTIONCHANGE   = 0;
let TS_LOCATION_TYPE_CURRENT        = 1;
let TS_LOCATION_TYPE_SAMPLE         = 2;

var emptyFn = function(param:any) {};

export class BackgroundGeolocation extends AbstractBackgroundGeolocation {

  constructor() {
    super();
  }

	public configure(config, success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;

    if (!this.locationManager) {
      this.locationManager = new TSLocationManager();

      this.locationManager.locationChangedBlock   = this.onLocation.bind(this);
      this.locationManager.httpResponseBlock      = this.onHttp.bind(this);
      this.locationManager.motionChangedBlock     = this.onMotionChange.bind(this);
      this.locationManager.activityChangedBlock   = this.onActivityChange.bind(this);
      this.locationManager.authorizationChangedBlock   = this.onProviderChange.bind(this);
      this.locationManager.errorBlock             = this.onError.bind(this);
      this.locationManager.heartbeatBlock         = this.onHeartbeat.bind(this);
      this.locationManager.syncCompleteBlock      = this.onSyncComplete.bind(this);
      this.locationManager.scheduleBlock          = this.onSchedule.bind(this);
    }
    this.state     = this.locationManager.configure(config);
    this.isMoving  = this.state.isMoving;
    this.enabled   = this.state.enabled;
    
    success(this.state);
	}

  public setConfig(config:Object, success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.locationManager.setConfig(config);
    success(this.locationManager.getState());
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
    if (!this.listeners[event]) {
      throw "Invalid event: " + event;
    }
    this.listeners[event].push({
      success: success,
      error: failure
    });
  }

	public changePace(value: boolean, success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
		console.log('ChangePace')
    this.locationManager.changePace(value);
    success(value);
	}

	public start(success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
		console.log('Start');
    this.locationManager.start();
    if (typeof(success) === 'function') {
      success(true);
    }
	}

	public stop(success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
		console.log('Stop');
    this.locationManager.stop();
    if (typeof(success) === 'function') {
      success(true);
    }
	}

  public startSchedule(success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    console.log('Start');
    this.locationManager.startSchedule();
    success(true);
  }

  public stopSchedule(success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    console.log('Start');
    this.locationManager.stopSchedule();
    if (typeof(success) === 'function') {
      success(true);
    }
  }

  public sync(success=Function, failure:any) {
    failure = failure || emptyFn;
    this.syncCallback = {
      success: success,
      error: failure || this.emptyFn
    }
  }

  public getLocations(success:Function, failure:any) {
    failure = failure || emptyFn;
    var rs = this.locationManager.getLocations();
    success(rs);
  }

  public getCount(success: Function) {
    var count = this.locationManager.getCount();
    if (typeof(success) === 'function') {
      success(count);
    }
  }

  public clearDatabase(success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    if (this.locationManager.clearDatabase()) {
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
    if (this.locationManager.insertLocation(data)) {
      success(true);
    } else {
      failure(false);
    }
  }

  public addGeofence(geofence, success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.locationManager.addGeofenceIdentifierRadiusLatitudeLongitudeNotifyOnEntryNotifyOnExit(
      geofence.identifier,
      geofence.radius,
      geofence.latitude,
      geofence.longitude,
      geofence.notifyOnEntry || true,
      geofence.notifyOnExit || true
    );
    success(geofence.identifier);
  }
  public addGeofences(geofences:any, success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.locationManager.addGeofences(geofences);
    success(true);
  }
  public removeGeofence(identifier, success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    if (this.locationManager.removeGeofence(identifier)) {
      success(true);
    } else {
      failure(false);
    }
  }
  public getGeofences(success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    var rs = this.locationManager.getGeofences();
    success(rs);
  }
  public removeGeofences(success:any, failure:any) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    if (this.locationManager.removeGeofences()) {
      success(true);
    } else {
      failure(false);
    }
  }

  public getCurrentPosition(success: Function, failure:any, options:any) {
    this.currentPositionCallbacks.push({
      success: success,
      error: failure || emptyFn
    });
    this.locationManager.updateCurrentPosition(options||{});
  }

  public watchPosition(success:Function, failure:any, options:any) {
    console.error('#watchPosition net yet implemented');
    failure('#watchPosition not yet implemented');
  }
  
  public stopWatchPosition() {
    this.locationManager.stopWatchPosition();
  }

  public getOdometer(success=Function, failure:any) {
    success(this.locationManager.getOdometer());
  }

  public resetOdometer(success:any) {
    success = success || emptyFn;
    this.locationManager.resetOdometer();
    success(true);
  }

  public playSound(soundId:number) {
    this.locationManager.playSound(soundId);
  }

  public getLog(success:Function) {
    success(this.locationManager.getLog());
  }

  public emailLog(email:string) {
    this.locationManager.emailLog(email);
  }

  private onLocation(location, type, isMoving) {
    var callbacks = this.listeners.location;
    var locationData = this.locationToObject(this.locationManager.locationToDictionaryType(location, type));
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
    var locationData = this.locationToObject(this.locationManager.locationToDictionary(location));
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success(isMoving, locationData);
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
      listeners = this.listeners.location;
      for (var n=0,len=listeners.length;n<len;n++) {
        listeners[n].error[n](errorCode);
      }
    }
  }

  private onHeartbeat(shakeCount:number, motionType:string, location:any) {
    var params = {
      shakes: shakeCount,
      motionType: motionType,
      location: this.locationToObject(location)
    }
    var callbacks = this.listeners.heartbeat;
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success(params);
    }
  }

  private onSyncComplete(locations: any) {
    if (this.syncCallback == null) {
      return;
    }
    this.syncCallback(locations);
    this.syncCallback = null;
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
    console.log('********************* onProviderChange: ', result);
    var callbacks   = this.listeners.providerchange;
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success(result);
    }  
  }

  private onSchedule(schedule: Object) {
    var state = this.locationManager.getState();

    var callbacks = this.listeners.heartbeat;
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n].success(state);
    }
  }

  private toObject(object) {
    return JSON.parse(JSON.stringify(object));
  }

  private locationToObject(location) {
    var coords    = location.objectForKey("coords");
    var activity  = location.objectForKey("activity");
    var battery   = location.objectForKey("battery");
    var event     = location.objectForKey("event");
    var sample    = location.objectForKey("sample");
    var heartbeat = location.objectForKey("is_heartbeat");

    return {
      coords: {
        speed: coords.objectForKey("speed"),
        longitude: coords.objectForKey("longitude"),
        latitude: coords.objectForKey("latitude"),
        accuracy: coords.objectForKey("accuracy"),
        heading: coords.objectForKey("heading"),
        altitude: coords.objectForKey("altitude"),
        altitudeAccuracy: coords.objectForKey("altitudeAccuracy")
      },
      activity: {
        type: activity.objectForKey("type"),
        confidence: activity.objectForKey("confidence")
      },
      battery: {
        level: battery.objectForKey("level"),
        is_charging: battery.objectForKey("is_charging")
      },
      event: event || undefined,
      sample: sample || undefined,
      is_moving: location.objectForKey("is_moving"),
      is_heartbeat: heartbeat || undefined,
      uuid: location.objectForKey("uuid"),
      odometer: location.objectForKey("odometer"),
      timestamp: location.objectForKey("timestamp")
    };
  }
}