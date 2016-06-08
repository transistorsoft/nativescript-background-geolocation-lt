import {AbstractBackgroundGeolocation} from './background-geolocation.common';

declare var TSLocationManager: any;

export class BackgroundGeolocation extends AbstractBackgroundGeolocation {
  constructor() {
    super();
  }

	public configure(config) {
    if (!this.locationManager) {
      this.locationManager = new TSLocationManager();

      var me = this;
      this.locationManager.locationChangedBlock = this.onLocation.bind(this);
      this.locationManager.httpResponseBlock = this.onHttp.bind(this);
      this.locationManager.motionChangedBlock = this.onMotionChange.bind(this);
    }
    this.state     = this.locationManager.configure(config);
    this.isMoving  = this.state.isMoving;
    this.enabled   = this.state.enabled;

    return this.state;

	}

	public changePace(value: boolean) {
		console.log('ChangePace')
    this.locationManager.changePace(value);
	}

	public on(event, callback, scope) {
		if (!this.listeners[event]) {
      throw "Invalid event: " + event;
    }
    this.listeners[event].push({
      fn: callback,
      scope: scope
    });
	}
	public start() {
		console.log('Start');
    this.locationManager.start();
	}

	public stop() {
		console.log('Stop');
    this.locationManager.stop();
	}

  private onLocation(location, type, isMoving) {
    var callbacks = this.listeners.location;
    var locationData = this.toObject(this.locationManager.locationToDictionaryType(location, type));
    
    var cb;
    for (var n=0,len=callbacks.length;n<len;n++) {
      cb = callbacks[n];
      cb.fn.call(cb.scope, locationData);
    }
  }

  private onMotionChange(location, isMoving) {

  }

  private onHttp(statusCode, requestData, responseData, error) {

  }

  private toObject(location) {
    console.log('-----------toObject: ', location);

    var coords    = location.objectForKey("coords");
    var activity  = location.objectForKey("activity");
    var battery   = location.objectForKey("battery");
    var event     = location.objectForKey("event");
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
      event: (event) ? event : undefined,
      is_moving: location.objectForKey("is_moving"),
      is_heartbeat: (location["is_heartbeat"]) ? location.objectForKey("is_heartbeat") : undefined,
      uuid: location.objectForKey("uuid"),
      odometer: location.objectForKey("odometer"),
      timestamp: location.objectForKey("timestamp")
    };
  }
}

/*
var NgZone = require('@angular/core');

var BackgroundGeolocation = (function() {
  var locationManager;
  var queue;

  var listeners = {
    location: [],
    motionchange: [],
    http: []
  };

  function onLocation(location, type, isMoving) {
    var callbacks = listeners.location;
    var locationData = toObject(locationManager.locationToDictionaryType(location, type));
    var cb;
    for (var n=0,len=callbacks.length;n<len;n++) {
      cb = callbacks[n];
      cb.fn.call(cb.scope, locationData);
    }
  }
  function onHttp(statusCode, requestData, responseData, error) {
    var callbacks = listeners.http;
    var cb;
    for (var n=0,len=callbacks.length;n<len;n++) {
      cb = callbacks[n];
      cb.fn.call(cb.scope, statusCode, requestData, responseData, error);
    }
  }
  function onMotionChange(location, isMoving) {
    var callbacks = listeners.motionchange;
    var locationData = toObject(locationManager.locationToDictionary(location));
    var cb;
    for (var n=0,len=callbacks.length;n<len;n++) {
      cb = callbacks[n];
      cb.fn.call(cb.scope, isMoving, locationData);
    }
  }
  function toObject(location) {
    console.log('-----------toObject: ', location);

    var coords    = location.objectForKey("coords");
    var activity  = location.objectForKey("activity");
    var battery   = location.objectForKey("battery");

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
      event: location["event"] ? location.objectForKey("event") : undefined,
      is_moving: location.objectForKey("is_moving"),
      is_heartbeat: (location["is_heartbeat"]) ? location.objectForKey("is_heartbeat") : undefined,
      uuid: location.objectForKey("uuid"),
      odometer: location.objectForKey("odometer"),
      timestamp: location.objectForKey("timestamp")
    };
  }

  return {

    configure: function(params) {
      var ngZone = new NgZone();
      if (!locationManager) {
        locationManager = new TSLocationManager();
        
        locationManager.locationChangedBlock = function() { ngZone.run(onLocation) };
        locationManager.httpResponseBlock = function() { ngZone.run(onHttp); }
        locationManager.motionChangedBlock = function() { ngZone.run(onMotionChange); }
      }
      return locationManager.configure(params);

    },
    on: function(event, callback, scope) {
      if (!listeners[event]) {
        throw "Invalid event";
      }
      listeners[event].push({
        fn: callback,
        scope: scope || this
      });
    },
    start: function() {
      locationManager.start();
    },
    stop: function() {
      locationManager.stop();
    },
    changePace: function(isMoving) {
      locationManager.changePace(isMoving);
    }
  }
})();

module.exports = BackgroundGeolocation;
*/