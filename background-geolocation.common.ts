import * as app from 'application';

import observable = require("data/observable");

export class AbstractBackgroundGeolocation {
  protected listeners: any;
  protected currentPositionCallbacks: any;
  protected watchPositionCallbacks: any;
  protected syncCallback: any;
  protected locationManager: any;
  protected state: any;
  protected enabled: boolean;
  protected isMoving: boolean;
  protected emptyFn: any;

  constructor() {
    this.listeners = {
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
    this.currentPositionCallbacks = [];
    this.watchPositionCallbacks = [];
    this.syncCallback = null;
    this.emptyFn = function() {};
  }
}
