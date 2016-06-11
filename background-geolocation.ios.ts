import {AbstractBackgroundGeolocation} from './background-geolocation.common';

declare var TSLocationManager: any;
declare var NSString: any;
declare var NSUTF8StringEncoding: any;
declare var NSError: any;

let TS_LOCATION_TYPE_MOTIONCHANGE   = 0;
let TS_LOCATION_TYPE_CURRENT        = 1;
let TS_LOCATION_TYPE_SAMPLE         = 2;

export class BackgroundGeolocation extends AbstractBackgroundGeolocation {

  constructor() {
    super();
  }

	public configure(config) {
    if (!this.locationManager) {
      this.locationManager = new TSLocationManager();

      this.locationManager.locationChangedBlock   = this.onLocation.bind(this);
      this.locationManager.httpResponseBlock      = this.onHttp.bind(this);
      this.locationManager.motionChangedBlock     = this.onMotionChange.bind(this);
      this.locationManager.activityChangedBlock   = this.onActivityChange.bind(this);
      this.locationManager.errorBlock             = this.onError.bind(this);
      this.locationManager.heartbeatBlock         = this.onHeartbeat.bind(this);
      this.locationManager.syncCompleteBlock      = this.onSyncComplete.bind(this);
      this.locationManager.scheduleBlock          = this.onSchedule.bind(this);
    }
    this.state     = this.locationManager.configure(config);
    this.isMoving  = this.state.isMoving;
    this.enabled   = this.state.enabled;

    return this.state;

	}

  public on(event, callback:any) {
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
    this.listeners[event].push(callback);
  }

	public changePace(value: boolean) {
		console.log('ChangePace')
    this.locationManager.changePace(value);
	}

	public start(success: any, failure: any) {
		console.log('Start');
    this.locationManager.start();
    if (typeof(success) === 'function') {
      success();
    }
	}

	public stop(success: any, failure: any) {
		console.log('Stop');
    this.locationManager.stop();
    if (typeof(success) === 'function') {
      success();
    }
	}

  public startSchedule(success: any, failure: any) {
    console.log('Start');
    this.locationManager.startSchedule();
    if (typeof(success) === 'function') {
      success();
    }
  }

  public stopSchedule(success: any, failure: any) {
    console.log('Start');
    this.locationManager.stopSchedule();
    if (typeof(success) === 'function') {
      success();
    }
  }

  public resetOdometer(success: any) {
    this.locationManager.resetOdometer();
    if (typeof(success) === 'function') {
      success();
    }
  }

  public sync(success: Function, failure: any) {
    this.syncCallback = {
      success: success,
      failure: failure || this.emptyFn
    }
  }

  public getCurrentPosition(success: Function, failure: any, options: any) {
    this.currentPositionCallbacks.push({
      success: success,
      failure: failure
    });
    this.locationManager.updateCurrentPosition(options||{});
  }

  public getCount(success: Function) {
    var count = this.locationManager.getCount();
    if (typeof(success) === 'function') {
      success(count);
    }
  }
  
  private onLocation(location, type, isMoving) {
    var callbacks = this.listeners.location;
    var locationData = this.locationToObject(this.locationManager.locationToDictionaryType(location, type));
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n](locationData);
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
      callbacks[n](isMoving, locationData);
    }
  }

  private onActivityChange(activityName) {
    var callbacks   = this.listeners.activitychange;
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n](activityName);
    }  
  }

  private onHttp(statusCode, requestData, responseData, error) {
    var callbacks = this.listeners.http;
    var responseText = NSString.alloc().initWithDataEncoding(responseData, NSUTF8StringEncoding);
    var cb;
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n](statusCode, responseText);
    }
  }

  private onError(type: string, error: any) {
    if (type === 'location') {
      var errorCode = error.code;
      if (this.currentPositionCallbacks.length) {
        for (var n=0,len=this.currentPositionCallbacks.length;n<len;n++) {
          this.currentPositionCallbacks[n].failure(errorCode);
        }
        this.currentPositionCallbacks = [];
      }
      for (var n=0,len=this.listeners.error.length;n<len;n++) {
        this.listeners.error[n](errorCode);
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
      callbacks[n](params);
    }
  }

  private onSyncComplete(locations: any) {
    if (this.syncCallback == null) {
      return;
    }
    this.syncCallback(locations);
    this.syncCallback = null;
  }

  private onSchedule(schedule: Object) {
    var state = this.locationManager.getState();

    var callbacks = this.listeners.heartbeat;
    for (var n=0,len=callbacks.length;n<len;n++) {
      callbacks[n](state);
    }
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