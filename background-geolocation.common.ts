import * as app from 'application';
import Platform = require('platform');
import observable = require("data/observable");

export class Logger {
  private adapter:any;

  constructor(adapter:any) {
    this.adapter = adapter;
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
    if (Platform.isAndroid) {
      this.adapter.log(level, msg);
    } else if (Platform.isIOS) {
      this.adapter.logMessage(level, msg);
    }
  }
}

export class AbstractBackgroundGeolocation {
  protected static listeners = {
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
    powersavechange: []
  };

  protected static events = [
    'location',
    'motionchange',
    'providerchange',
    'activitychange',
    'geofenceschange',
    'heartbeat',
    'geofence',
    'schedule',
    'error',
    'http',
    'powersavechange'
  ];
  public static LOG_LEVEL_OFF:number     = 0;
  public static LOG_LEVEL_ERROR:number   = 1;
  public static LOG_LEVEL_WARNING:number = 2;
  public static LOG_LEVEL_INFO:number    = 3;
  public static LOG_LEVEL_DEBUG:number   = 4;
  public static LOG_LEVEL_VERBOSE:number = 5;

  public static DESIRED_ACCURACY_HIGH:number      = 0;
  public static DESIRED_ACCURACY_MEDIUM:number    = 10;
  public static DESIRED_ACCURACY_LOW:number       = 100;
  public static DESIRED_ACCURACY_VERY_LOW:number  = 1000;

  public static AUTHORIZATION_STATUS_NOT_DETERMINED  = 0;
  public static AUTHORIZATION_STATUS_RESTRICTED      = 1;
  public static AUTHORIZATION_STATUS_DENIED          = 2;
  public static AUTHORIZATION_STATUS_ALWAYS          = 3;
  public static AUTHORIZATION_STATUS_WHEN_IN_USE     = 4;

  public static NOTIFICATION_PRIORITY_DEFAULT:number = 0;
  public static NOTIFICATION_PRIORITY_HIGH:number    = 1;
  public static NOTIFICATION_PRIORITY_LOW:number     = -1;
  public static NOTIFICATION_PRIORITY_MAX:number     = 2;
  public static NOTIFICATION_PRIORITY_MIN:number     = -2;

  public static logger:Logger;

  protected static adapter: any;
  protected static state: any;
  protected static enabled: boolean;
  protected static isMoving: boolean;
  protected static emptyFn: any;

  /**
  * @abstract
  */
  public static addListener(event:string, success:Function, failure?:Function) {
    // Override me
  }

  public static on(event:string, success:Function, failure?:Function) {
    this.addListener(event, success, failure);
  }

  public static removeListener(event:string, clientCallback:Function) {
    if (this.events.indexOf(event) < 0) {
      throw "Invalid event: " + event;
    }
    let listeners = this.listeners[event];
    
    let listener = listeners.find((i) => { return i.clientCallback === clientCallback; });
    if (listener) {
      this.removeNativeListener(event, listener.nativeCallback);
      listeners.splice(listeners.indexOf(listener), 1);
    } else {
      console.warn('Failed to removeListener for event: ', event, JSON.stringify(listeners));
    }
  }

  /**
  * @abstract
  */
  protected static removeNativeListener(event:string, callback:Function) {
    // Override me
  }

  /**
  * @alias #removeListener
  */
  public static un(event:string, clientCallback:Function) {
    this.removeListener(event, clientCallback);
  }

  public static removeListeners(event?:string) {
    if (event) {
      if (!this.listeners[event]) {
        throw "Invalid event: " + event;
      }
      this.listeners[event] = [];
      this.getAdapter().removeListeners(event);
    } else {
      for (var key in this.listeners) {
        this.listeners[key] = [];
      }
      this.getAdapter().removeListeners();
    }
  }

  /**
  * @abstract
  */
  protected static getAdapter():any {
    return {
      removeListener: (event:string, callback:Function) => {},
      removeListeners: () => {}
    };
  }

  protected static registerCallback(event:string, clientCallback:Function, nativeCallback:Function) {    
    this.listeners[event].push({
      clientCallback: clientCallback,
      nativeCallback: nativeCallback
    });    
  }

  /**
  * @abstract
  */
  public static removeGeofences(geofences:Array<string>, success?:Function, failure?:Function) {
    // Override me
  }

  public static removeAllGeofences(success?:Function, failure?:Function) {
    this.removeGeofences([], success, failure);
  }
}
