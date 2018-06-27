import {device} from "platform";
import Platform = require('platform');

const TAG = "TSLocationManager";
let emptyFn = function(){};

/**
* Url to transistorsoft tracking test server.  Configure the plugin with a #username to automatically post
* locations to the test server, eg:
{
  username: 'my-username'
}
* View your tracking online by visiting:
* http://tracker.transistorsoft.com/username
*
*/
const TEST_SERVER_URL = 'http://tracker.transistorsoft.com/locations/';

/**
* Logger
*/
export class Logger {
  private api:any;

  constructor(api:any) {
    this.api = api;
  }
  public error(msg:string) {
    this.log('error', msg);
  }
  public warn(msg:string) {
    this.log('warn', msg);
  }
  public debug(msg:string) {
    this.log('debug', msg);
  }
  public notice(msg:string) {
    this.log('notice', msg);
  }
  public header(msg:string) {
    this.log('header', msg);
  }
  public on(msg:string) {
    this.log('on', msg);
  }
  public off(msg:string) {
    this.log('off', msg);
  }
  public ok(msg:string) {
    this.log('ok', msg);
  }
  private log(level:string, msg:string) {
    this.api.log(level, msg);    
  }
}

/**
* BackgroundGeolocation
*/
export class BackgroundGeolocation {

  private static api: any;

  public static logger:Logger;

  public static LOG_LEVEL_OFF:number     = 0;
  public static LOG_LEVEL_ERROR:number   = 1;
  public static LOG_LEVEL_WARNING:number  = 2;
  public static LOG_LEVEL_INFO:number    =  3;
  public static LOG_LEVEL_DEBUG:number  =  4;
  public static LOG_LEVEL_VERBOSE:number =  5;

  public static DESIRED_ACCURACY_NAVIGATION:number = -2;
  public static DESIRED_ACCURACY_HIGH:number       = -1;
  public static DESIRED_ACCURACY_MEDIUM:number     = 10;
  public static DESIRED_ACCURACY_LOW:number        = 100;
  public static DESIRED_ACCURACY_VERY_LOW:number   = 1000;
  public static DESIRED_ACCURACY_LOWEST:number     = 3000;

  public static AUTHORIZATION_STATUS_NOT_DETERMINED:number = 0;
  public static AUTHORIZATION_STATUS_RESTRICTED:number     = 1;
  public static AUTHORIZATION_STATUS_DENIED:number         = 2;
  public static AUTHORIZATION_STATUS_ALWAYS:number         = 3;
  public static AUTHORIZATION_STATUS_WHEN_IN_USE:number    = 4;

  public static NOTIFICATION_PRIORITY_DEFAULT:number       = 0;
  public static NOTIFICATION_PRIORITY_HIGH:number          = 1;
  public static NOTIFICATION_PRIORITY_LOW:number          =-1;
  public static NOTIFICATION_PRIORITY_MAX:number           = 2;
  public static NOTIFICATION_PRIORITY_MIN:number           =-2;
    
  public static mountNativeApi(api) {
    this.api = api;
    this.logger = new Logger(api);
  }

  public static EVENTS:String[] = [
    'heartbeat',
    'http',
    'location',
    'error',
    'motionchange',
    'geofence',
    'schedule',
    'activitychange',
    'providerchange',
    'geofenceschange',
    'watchposition',
    'powersavechange',
    'connectivitychange',
    'enabledchange'
  ];

  private static listeners = {
    location: [],
    http: [],
    motionchange: [],
    error: [],
    heartbeat: [],
    schedule: [],
    activitychange: [],
    providerchange: [],
    geofence: [],
    geofenceschange: [],
    powersavechange: [],
    connectivitychange: [],
    enabledchange: []
  };

  private static headlessTask: Function;

  public static registerHeadlessTask(callback:Function) {
    this.headlessTask = callback;
  }

  public static runHeadlessTask(event:any, completionHandler:Function) {
    if (this.headlessTask) {
      this.headlessTask(event, completionHandler);
    }
  }

  /**
  * Core Plugin Control Methods
  */
  public static ready(config:any, success?:Function, failure?:Function) {
    config = this.validate(config);
    if (arguments.length <= 1) {
      return this.api.ready(config||{});
    } else {
      this.api.ready(config).then(success).catch(failure);
    }
  }
  /**
  * Reset plugin confg to default
  */
  static reset(config?:any, success?:Function, failure?:Function) {
    if ((typeof(config) === 'function') ||  (typeof(success) === 'function')) {
      if (typeof(config) === 'function') {
        success = config;
        config = {};
      }
      config = this.validate(config||{});
      this.api.reset(config).then(success).catch(failure);
    } else {
      return this.api.reset(this.validate(config||{}));
    }
  }
  /**
  * Perform initial configuration of plugin.  Reset config to default before applying supplied configuration
  */
  public static configure(config:any, success?:Function, failure?:Function) {
    config = this.validate(config);
    if (arguments.length == 1) {
      return this.api.configure(config);
    } else {
      this.api.configure(config).then(success).catch(failure);
    }
  }
  /**
  * Listen to a plugin event
  */
  public static addListener(event:string, success:Function, failure?:Function) {
    if (this.EVENTS.indexOf(event) < 0)      { throw "BackgroundGeolocation#on - Unknown event '" + event + "'" }
    let nativeCallback = this.api.addListener.apply(this.api, arguments);
    if (nativeCallback) {
      this.registerCallback(event, success, nativeCallback);
    }
  }

  private static registerCallback(event:string, clientCallback:Function, nativeCallback:Function) {    
    this.listeners[event].push({
      clientCallback: clientCallback,
      nativeCallback: nativeCallback
    });    
  }

  // @alias #addListener
  public static on(event:string, success:Function, failure?:Function) {
    this.addListener.apply(this, arguments);
  }  
  /**
  * Remove a single plugin event-listener, supplying a reference to the handler initially supplied to #un
  */  
  public static removeListener(event:string, clientCallback:Function, success?:Function, failure?:Function) {
    if (this.EVENTS.indexOf(event) < 0)      { throw "BackgroundGeolocation#un - Unknown event '" + event + "'" }
    let listeners = this.listeners[event];
    
    let listener = listeners.find((i) => { return i.clientCallback === clientCallback; });
    if (listener) {
      listeners.splice(listeners.indexOf(listener), 1);
      if (arguments.length == 2) {
        return this.api.removeListener(event, listener.nativeCallback);
      } else {
        this.api.removeListener(event, listener.nativeCallback).then(success).catch(failure);
      }
    } else {
      let error = 'Failed to removeListener for event: ' + event;
      failure = failure || emptyFn;
      console.warn(error);
      if (arguments.length == 2) {
        return new Promise((resolve, reject) => {
          reject(error);
        });
      } else {
        failure(msg);
      }      
    }
  }

  // @alias #removeListener
  public static un(event:string, handler:Function, success?:Function, failiure?:Function) {
    this.removeListener.apply(this, arguments);
  }

  /**
  * Remove all event listeners
  */  
  public static removeListeners(event?:any, success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.removeListeners();          // #removeListeners()
    } else if(typeof(arguments[0]) === 'string') {
      if (this.EVENTS.indexOf(event) < 0) {
        throw "BackgroundGeolocation#removeListeners - Unknown event: " + event;
      }
      // Clear client-calllbacks.
      this.listeners[event] = [];
      if (typeof(arguments[1]) === 'function') {  // #removeListeners(event, success, failure);
        this.api.removeListeners(event).then(success).catch(failure);
      } else {                                    // #removeListeners(event)
        return this.api.removeListeners(event);
      }
    } else  if (typeof(arguments[0]) === 'function') {  // #removeListeners(success, failure)
      success = event;
      failure = success;
      this.api.removeListeners().then(success).catch(failure);
    }
  }
  
  /**
  * Fetch current plugin configuration
  */
  public static getState(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.getState();
    } else {
      this.api.getState().then(success).catch(failure);
    }
  }
  /**
  * Start the plugin
  */
  public static start(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.start();
    } else {
      this.api.start().then(success).catch(failure);
    }
  }
  /**
  * Stop the plugin
  */
  public static stop(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.stop();
    } else {
      this.api.stop().then(success).catch(failure);
    }
  }
  /**
  * Start the scheduler
  */
  public static startSchedule(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.startSchedule();
    } else {
      this.api.startSchedule().then(success).catch(failure);
    }
  }
  /**
  * Stop the scheduler
  */
  public static stopSchedule(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.stopSchedule();
    } else {
      this.api.stopSchedule().then(success).catch(failure);
    }
  }
  /**
  * Initiate geofences-only mode
  */
  public static startGeofences(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.startGeofences();
    } else {
      this.api.startGeofences().then(success).catch(failure);
    }
  }
  /**
  * Start an iOS background-task, provding 180s of background running time
  */
  public static startBackgroundTask(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.startBackgroundTask();      
    } else {
      if (typeof(success) !== 'function') {
        throw TAG + "#startBackgroundTask must be provided with a callback to recieve the taskId";
      }
      this.api.startBackgroundTask().then(success).catch(failure);
    }
  }
  /**
  * Signal to iOS that your background-task from #startBackgroundTask is complete
  */
  public static finish(taskId:number,  success?:Function, failure?:Function) {
    // No taskId?  Ignore it.
    if (arguments.length == 1) {
      return this.api.finish(taskId);
    } else {
      this.api.finish(taskId).then(success).catch(failure);
    }
  }
  /**
  * Toggle motion-state between stationary <-> moving
  */
  public static changePace(isMoving:boolean, success?:Function, failure?:Function) {
    if (arguments.length == 1) {
      return this.api.changePace(isMoving);
    } else {
      this.api.changePace(isMoving).then(success).catch(failure);
    }
  }
  /**
  * Provide new configuration to the plugin.  This configuration will be *merged* to current configuration
  */
  public static setConfig(config:any, success?:Function, failure?:Function) {
    if (arguments.length == 1) {
      return this.api.setConfig(config);
    } else {
      this.api.setConfig(config).then(success).catch(failure);
    }
  }
  /**
  * HTTP & Persistence
  *
  */
  public static getLocations(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.getLocations();
    } else {
      this.api.getLocations().then(success).catch(failure);
    }
  }
  /**
  * Fetch the current count of location records in database
  */
  public static getCount(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.getCount();
    } else {
      this.api.getCount().then(success).catch(failure);
    }
  }
  /**
  * Destroy all records in locations database
  */
  public static destroyLocations(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.destroyLocations();
    } else {
      this.api.destroyLocations().then(success).catch(failure);
    }
  }
  // @deprecated
  public static clearDatabase(success?:Function, failure?:Function) {
    return this.destroyLocations.apply(this, arguments);
  }
  /**
  * Insert a single record into locations database
  */
  public static insertLocation(location:any, success?:Function, failure?:Function) {
    if (arguments.length == 1) {
      return this.api.insertLocation(location);
    } else {
      this.api.insertLocation(location).then(success).catch(failure);
    }
  }
  /**
  * Manually initiate an HTTP sync operation
  */
  public static sync(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.sync();
    } else {
      this.api.sync().then(success).catch(failure);
    }
  }
  /**
  * Fetch the current value of odometer
  */
  public static getOdometer(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.getOdometer();
    } else {
      this.api.getOdometer().then(success).catch(failure);
    }
  }
  /**
  * Set the value of the odometer
  */
  public static setOdometer(value:number, success?:Function, failure?:Function) {
    if (arguments.length == 1) {
      return this.api.setOdometer(value);
    } else {
      this.api.setOdometer(value).then(success).catch(failure);
    }
  }
  /**
  * Reset the value of odometer to 0
  */
  public static resetOdometer(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.setOdometer(0);
    } else {
      this.api.setOdometer(0).then(success).catch(failure);
    }
  }

  /**
  * Geofencing Methods
  */

  /**
  * Add a single geofence
  */
  public static addGeofence(config:any, success?:Function, failure?:Function) {
    if (arguments.length == 1) {
      return this.api.addGeofence(config);
    } else {
      this.api.addGeofence(config).then(success).catch(failure);
    }
  }
  /**
  * Remove a single geofence by identifier
  */
  public static removeGeofence(identifier:string, success?:Function, failure?:Function) {
    if (arguments.length == 1) {
      return this.api.removeGeofence(identifier);
    } else {
      this.api.removeGeofence(identifier).then(success).catch(failure);
    }
  }
  /**
  * Add a list of geofences
  */
  public static addGeofences(geofences:any, success?:Function, failure?:Function) {
    if (arguments.length == 1) {
      return this.api.addGeofences(geofences);
    } else {
      this.api.addGeofences(geofences).then(success).catch(failure);
    }
  }
  /**
  * Remove geofences.  You may either supply an array of identifiers or nothing to destroy all geofences.
  * 1. removeGeofences() <-- Promise
  * 2. removeGeofences(['foo'])  <-- Promise
  *
  * 3. removeGeofences(success, [failure])    
  * 4. removeGeofences(['foo'], success, [failure])
  */
  public static removeGeofences(success?:Function, failure?:Function) {
    if (!arguments.length)  {
      return this.api.removeGeofences();
    } else {            
      this.api.removeGeofences().then(success).catch(failure);
    }
  }
  /**
  * Fetch all geofences from database
  */
  public static getGeofences(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.getGeofences();
    } else {
      this.api.getGeofences().then(success).catch(failure);
    }
  }
  /**
  * Fetch the current position from location-services
  */
  public static getCurrentPosition(success:any, failure?:any, options?:any) {
    if (typeof(success) == 'function') {
      if (typeof(failure) == 'object') {
        options = failure;
        failure = emptyFn;
      }
      options = options || {};
      this.api.getCurrentPosition(options).then(success).catch(failure);
    } else {
      options = success || {};
      return this.api.getCurrentPosition(options);
    }
  }
  /**
  * Begin watching a stream of locations
  */
  public static watchPosition(success:Function, failure?:Function, options?:any) {
    this.api.watchPosition(success, failure||emptyFn, options||{});
  }
  /**
  * Stop watching location
  */
  public static stopWatchPosition(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.stopWatchPosition();
    } else {
      this.api.stopWatchPosition().then(success).catch(failure);
    }
  }
  /**
  * Set the logLevel.  This is just a helper method for setConfig({logLevel: level})
  */
  public static setLogLevel(value:number, success?:Function, failure?:Function) {
    if (arguments.length == 1) {
      return this.api.setLogLevel(value);
    } else {
      this.api.setLogLevel(value).then(success).catch(failure);
    }
  }
  /**
  * Fetch the entire contents of log database returned as a String
  */
  public static getLog(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.getLog();
    } else {
      this.api.getLog().then(success).catch(failure);
    }
  }
  /**
  * Destroy all contents of log database
  */
  public static destroyLog(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.destroyLog();
    } else {
      this.api.destroyLog().then(success).catch(failure);
    }
  }
  /**
  * Open deafult email client on device to email the contents of log database attached as a compressed file attachement
  */
  public static emailLog(email:string, success?:Function, failure?:Function) {
    if (typeof(email) != 'string') { throw TAG + "#emailLog requires an email address as 1st argument"}
    if (arguments.length == 1) {
      return this.api.emailLog(email);
    } else {
      this.api.emailLog(email).then(success).catch(failure);
    }
  }
  /**
  * Has device OS initiated power-saving mode?
  */
  public static isPowerSaveMode(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.isPowerSaveMode();
    } else {
      this.api.isPowerSaveMode().then(success).catch(failure);
    }
  }
  /**
  * Fetch the state of this device's available motion-sensors
  */
  public static getSensors(success?:Function, failure?:Function) {
    if (!arguments.length) {
      return this.api.getSensors();
    } else {
      this.api.getSensors().then(success).catch(failure);
    }
  }
  /**
  * Play a system sound via the plugin's Sound API
  */
  public static playSound(soundId:number, success?:Function, failure?:Function) {
    if (arguments.length == 1) {
      return this.api.playSound(soundId);
    } else {
      this.api.playSound(soundId).then(success).catch(failure);
    }    
  }

  private static validate(config:any):any {
    if (config.username) {
      config.url = TEST_SERVER_URL + config.username;
      config.params = {
        device: {
          uuid: Platform.device.uuid,
          model: Platform.device.model,
          platform: Platform.device.os,
          manufacturer: Platform.device.manufacturer,
          version: Platform.device.osVersion,
          framework: '{N}'
        }
      }
      delete config.username;
    } 
    return config;
  }
}
