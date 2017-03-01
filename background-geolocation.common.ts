import * as app from 'application';

import observable = require("data/observable");

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
    geofence: []
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
    'http'
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

  protected static currentPositionCallbacks = [];
  protected static watchPositionCallbacks = [];
  protected static syncCallback = null;
  protected static locationManager: any;
  protected static state: any;
  protected static enabled: boolean;
  protected static isMoving: boolean;
  protected static emptyFn: any;

}
