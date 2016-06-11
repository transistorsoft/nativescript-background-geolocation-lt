import observable = require("data/observable");
import {BackgroundGeolocation} from "nativescript-background-geolocation-lt";
import {fonticon} from 'nativescript-fonticon';
import Platform = require('platform');
var mapsModule = require("nativescript-google-maps-sdk");

const ICON_PLAY = "ion-play";
const ICON_PAUSE = "ion-pause";

require("globals");

export class HelloWorldModel extends observable.Observable {

  private _counter: number;
  private _message: string;
  private _bgGeo: BackgroundGeolocation;
  private _state: any;
  private _enabled: boolean;
  private _isMoving: boolean;
  private _locationData: string = "DEFAULT";
  private _emptyFn: Function;
  private _paceButtonIcon = ICON_PLAY;
  private _odometer: string = '0';
  private _activityType: string = '';

  private _mapView: any;
  private _zoom = 20;

  public onMapReady(args) {
    this._mapView = args.object;
    
    /*
    console.log("Setting a marker...");
    
    */
  }


  get activityType(): string {
    return this._activityType;
  }
  set activityType(value:string) {
    if (value === 'unknown') {
      value = (this._isMoving) ? 'moving' : 'still';
    }
    value = value;
    this._activityType = value;
    this.notifyPropertyChange("activityType", value);
  }

  get odometer(): string {
    return this._odometer;
  }
  set odometer(value:string) {
    if (this._odometer !== value) {
      this._odometer = value;
      this.notifyPropertyChange("odometer", value);
    }
  }
  get isMoving(): boolean {
    return this._isMoving;
  }
  set isMoving(value:boolean) {
    if (this._isMoving !== value) {
      this._isMoving = value;
      this.notifyPropertyChange("isMoving", value);
    }
  }
  get isEnabled(): boolean {
    return this._enabled;
  }
  set isEnabled(value:boolean) {
    if (this._enabled !== value) {
      this._enabled = value;
      if (value) {
        this._bgGeo.resetOdometer();
        this._bgGeo.start();
      } else {
        this._bgGeo.stop();
        this.activityType = "off";
        this._mapView.removeAllMarkers();
      }
    }
    this.notifyPropertyChange("isEnabled", value);

  }
  set locationData(value: string) {
    if (this._locationData !== value) {
      value = '<pre>' + value + '</pre>';
      this._locationData = value;
      this.notifyPropertyChange("locationData", value);
    }        
  }
  get locationData(): string {
    return this._locationData;
  }

  get paceButtonIcon(): string {
    return this._paceButtonIcon;
  }

  set paceButtonIcon(value:string) {
    if (this._paceButtonIcon !== value) {
      this._paceButtonIcon = value;
      this.notifyPropertyChange("paceButtonIcon", value);
    }
  }
  constructor() {
    super();
    this._bgGeo = new BackgroundGeolocation();

    this._emptyFn = function(){};

    //this._bgGeo.on('location', this.onLocation.bind(this));
    this._bgGeo.on({
      location: this.onLocation.bind(this),
      motionchange: this.onMotionChange.bind(this),
      activitychange: this.onActivityChange.bind(this),
      http: this.onHttp.bind(this),
      heartbeat: this.onHeartbeat.bind(this),
      schedule: this.onSchedule.bind(this),
      error: this.onError.bind(this)
    });
    this._state = this._bgGeo.configure(this.getConfig());

    console.log(this._state);

    this._enabled = this._state.objectForKey("enabled");
    this.notifyPropertyChange("isEnabled", this._enabled);
    this._isMoving  = this._state.objectForKey("isMoving");
  }

  private getConfig() {
    return {
      debug: true,
      desiredAccuracy: 0,
      stationaryRadius: 25,
      distanceFilter: 50,
      activityRecognitionInterval: 10000,
      preventSuspend: false,
      heartbeatInterval: 60,
      url: 'http://192.168.11.120:8080/locations',
      params: {
        device: {
          platform: Platform.device.deviceType,
          manufacturer: Platform.device.manufacturer,
          model: Platform.device.model,
          version: Platform.device.osVersion,
          uuid: Platform.device.uuid
        }
      },
      autoSync: false,
      maxRecordsToPersist: 100
    }
  }

  public onSetConfig() {
    var config = {
      distanceFilter: 10,
      stationaryRadius: 500
    };
    this._bgGeo.setConfig(config);
  }

  public onChangePace() {
    this._isMoving = !this._isMoving;
    this._bgGeo.changePace(this._isMoving);
    this.paceButtonIcon = (this._isMoving) ? ICON_PAUSE : ICON_PLAY;
  }

  public onGetCurrentPosition() {
    this._bgGeo.getCurrentPosition(function(location) {
      console.log('[js] getCurrentPosition: ', location);
    }.bind(this), function(error) {
      console.warn('[js] getCurrentPosition FAIL: ', error);
    }.bind(this), {
      timeout: 10,
      samples: 3,
      desiredAccuracy: 10,
      persist: false
    });
  }

  private onLocation(location:any) {
    var json = JSON.stringify(location, null, 2);
    this._bgGeo.getCount(function(count) {
      console.info('- count: ', count);
    });
    console.info('[js] location: ', json);

    this.activityType = location.activity.type;        
    this.locationData = json;

    if (!location.sample) {
      this.odometer = (location.odometer/1000).toFixed(1);
    }
    this.set('latitude', location.coords.latitude);
    this.set('longitude', location.coords.longitude);

    var marker = new mapsModule.Marker();
    marker.position = mapsModule.Position.positionFromLatLng(location.coords.latitude, location.coords.longitude);
    marker.title = "Position";
    marker.snippet = location.timestamp;
    marker.userData = { index : location.uuid};
    this._mapView.addMarker(marker);

  }

  private onMotionChange(isMoving:boolean, location: any) {
    console.info('[js] motionchange', isMoving, location);
    this.isMoving = isMoving;
    this.activityType = location.activity.type;
    this.paceButtonIcon = (isMoving) ? ICON_PAUSE : ICON_PLAY;
    this.set('zoom', 15);
  }

  private onActivityChange(activityType:string) {
    this.activityType = activityType;
  }
  private onHttp(statusCode: number, responseText: string) {
    console.info('[js] http: ', statusCode, ', responseText: ', responseText);
  }

  private onHeartbeat(params: Object) {
    console.info('[js] heartbeat: ', params);
  }

  private onSchedule(state: Object) {
    console.info('[js] schedule: ', state);
  }

  private onError(errorCode: number) {
    console.warn('[js] error: ', errorCode);
  }
}