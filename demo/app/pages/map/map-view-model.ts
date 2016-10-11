/**
SVG Icons for Map
  current_location
    <svg width="50" height="50">
      <circle cx="25" cy="25" r="20" fill="#2677FF" stroke="#fff" stroke-width="10" />
    </svg>
  green_dot:
    <svg width="24" height="24">
      <circle cx="12" cy="12" r="10" fill="#11b700" stroke="#0d6104" stroke-width="2" />
    </svg>
*
*
*/

import observable = require("data/observable");
import {SettingsViewModel} from "../settings/settings-view-model";

import {BackgroundGeolocation} from "nativescript-background-geolocation-lt";
import {fonticon} from 'nativescript-fonticon';
import Platform = require('platform');
import frames = require("ui/frame");
import * as Settings from "application-settings";

var mapsModule = require("nativescript-google-maps-sdk");
var Color = require("color").Color;

const ICON_PLAY = "ion-play";
const ICON_PAUSE = "ion-pause";

require("globals");

const ICONS = {
  activity_unknown: 'ion-ios-help',
  activity_still: 'ion-man',
  activity_on_foot: 'ion-android-walk',
  activity_walking: 'ion-android-walk',
  activity_running: 'ion-android-walk',
  activity_in_vehicle: 'ion-android-car',
  activity_on_bicycle: 'ion-android-bicycle'
};

export class MapModel extends observable.Observable {
  // Background Geolocation properties
  private _bgGeo: BackgroundGeolocation;
  private _state: any;
  private _enabled: boolean;
  private _isMoving: boolean;
  private _paceButtonIcon = ICON_PLAY;
  private _watchingPosition: boolean;

  // Status bar properties
  private _odometer: string = '1000';
  private _activityType: string = '';
  private _activityIcon: string = ICONS.activity_still
  private _providerGps: string = "visible";
  private _providerWifi: string = "visible";
  private _providerDisabled: string = "visible";

  // Map properties
  private _mapView: any;
  private _defaultZoom = 16;
  private _zoom: number;
  private _polyline;

  // Map-marker references.
  private _stationaryCircle: any;
  private _currentLocationMarker: any;
  private _currentLocationAccuracyMarker: any;
  private _geofenceMarkers;

  get zoom(): number {
    return this._zoom;
  }
  set zoom(value:number) {
    this._zoom = value;
    this.notifyPropertyChange("zoom", value);
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

  get activityIcon(): string {
    return this._activityIcon;
  }
  set activityIcon(value:string) {
    if (value === 'unknown') {
      value = (this._isMoving) ? 'moving' : 'still';
    }
    value = value;
    this._activityIcon = value;
    this.notifyPropertyChange("activityIcon", value);
  }

  get providerGps(): string {
    return this._providerGps;
  }
  set providerGps(value:string) {
    this._providerGps = value;
    this.notifyPropertyChange("providerGps", value);
  }

  get providerWifi(): string {
    return this._providerWifi;
  }
  set providerWifi(value:string) {
    this._providerWifi = value;
    this.notifyPropertyChange("providerWifi", value);
  }

  get providerDisabled(): string {
    return this._providerDisabled;
  }
  set providerDisabled(value:string) {
    this._providerDisabled = value;
    this.notifyPropertyChange("providerDisabled", value);
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
  get watchingPosition(): boolean {
    return this._watchingPosition;
  }
  set watchingPosition(value:boolean) {
    if (this._watchingPosition !== value) {
      this._watchingPosition = value;
      this.notifyPropertyChange("watchingPosition", value);
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
        this._bgGeo.start();

        // Reload cached positions from plugin
        var polyline = this._getPolyline();
        var me = this;
        this._bgGeo.getLocations(function(rs) {
          rs.forEach(function(location) {
            var marker = me._createLocationMarker(location);
            polyline.addPoint(marker.position);
          });
        });

        if (this.zoom < this._defaultZoom) {
          this.set('zoom', this._defaultZoom);
        }
      } else {
        this._bgGeo.stop();
        this._bgGeo.resetOdometer();

        // Remove Map markers & shapes
        this._geofenceMarkers = {};
        this.activityType = "off";
        this._mapView.removeAllMarkers();
        this._mapView.removeAllShapes();
        // Clear marker references.
        this._polyline = null;
        this._currentLocationMarker = null;
        this._currentLocationAccuracyMarker = null;
        this._stationaryCircle = null;
      }
    }
    this.notifyPropertyChange("isEnabled", value);
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
    this._geofenceMarkers = {};
    this._bgGeo = new BackgroundGeolocation();
    this._zoom = 0;
    // Listen to BackgroundGeolocation events
    this._bgGeo.on('location', this.onLocation.bind(this), this.onLocationError.bind(this));
    this._bgGeo.on('motionchange', this.onMotionChange.bind(this));
    this._bgGeo.on('activitychange', this.onActivityChange.bind(this));
    this._bgGeo.on('http', this.onHttp.bind(this));
    this._bgGeo.on('heartbeat', this.onHeartbeat.bind(this));
    this._bgGeo.on('schedule', this.onSchedule.bind(this));
    this._bgGeo.on('providerchange', this.onProviderChange.bind(this));
    this._bgGeo.on('geofence', this.onGeofence.bind(this));
    this._bgGeo.on('schedule', this.onSchedule.bind(this));
    this._bgGeo.on('geofenceschange', this.onGeofencesChange.bind(this));
    this.providerGps = 'visible';
    this.providerWifi = 'visible';
    this.providerDisabled = 'collapsed';
    this.watchingPosition = false;
  }

  public onMapReady(args) {
    this._mapView = args.object;

    // If _state already exists, we're probably returning from a navigation-event.  just ignore: we're already configured.
    if (this._state) { return };

    this._bgGeo.configure(this.getConfig(), function(state) {
      this._state = state;
      this._enabled = state.enabled;
      this.notifyPropertyChange("isEnabled", state.enabled);
      this._isMoving  = this._state.isMoving;
    }.bind(this));
  }

  public onCoordinateTapped(args) {
    console.log('- MapViewModel#onCoordinateTapped');
  }

  public onShapeSelect(args) {
    var shape = args.shape;
    var mapView = this._mapView;

    if (shape.shape === 'circle') {
      var data = shape.userData;
      var topMost = frames.topmost();

      topMost.currentPage.showModal('./pages/geofences/geofence-page', {
        backgroundGeolocation: this._bgGeo,
        geofence: data
      }, function(remove:boolean) {
        if (remove === true) {
          mapView.removeShape(shape);
        }
      }.bind(this));
    }
  }

  public onCoordinateLongPress(args) {
    var position = args.position;
    var topMost = frames.topmost();
    var mapView = this._mapView;

    // Play a UI sound when opening.
    var os = Platform.device.os;
    var soundId = (os.toUpperCase() == 'ANDROID') ? 27 : 1113;
    this._bgGeo.playSound(soundId);

    topMost.currentPage.showModal('./pages/geofences/geofence-page', {
      backgroundGeolocation: this._bgGeo,
      position: position
    }, function(geofenceModel) {
      if (!geofenceModel) { return; }
      var soundId = (os.toUpperCase() == 'ANDROID') ? 28 : 1114;
      this._bgGeo.playSound(soundId);

      this._createGeofenceMarker({
        identifier: geofenceModel.identifier,
        radius: geofenceModel.radius,
        latitude: position.latitude,
        longitude: position.longitude
      });
    }.bind(this));
  }

  private getConfig() {
    var config = {};
    if (Settings.hasKey('config')) {
      config = JSON.parse(Settings.getString('config'));
    } else {
      // Fetch default config with overrides.
      config = SettingsViewModel.getDefaultConfig({
        license: "5647026b5a15ced50fcd3adcb2b743ab32abf2374c40d0aff875e53b15f93b60",
        url: 'http://192.168.11.100:8080/locations',
        params: {
          device: {
            platform: Platform.device.os,
            manufacturer: Platform.device.manufacturer,
            model: Platform.device.model,
            version: Platform.device.osVersion,
            uuid: Platform.device.uuid
          }
        }
      });
      // Cache current settings
      Settings.setString('config', JSON.stringify(config));
    }
    return config;
  }

  public onClickSettings() {
    var topMost = frames.topmost();

    var navigationEntry = {
      moduleName: "./pages/settings/settings-page",
      animated: true,
      transition: {
        name: "flip",
        backstackVisible: true
      },
      context: this._bgGeo
    };
    topMost.navigate(navigationEntry);

  }

  public onSetConfig() {
    var config = {
      distanceFilter: 10,
      stationaryRadius: 500
    };
    this._bgGeo.setConfig(config);
  }

  public onChangePace(ev) {
    this._isMoving = !this._isMoving;
    this._bgGeo.changePace(this._isMoving);
    this.paceButtonIcon = (this._isMoving) ? ICON_PAUSE : ICON_PLAY;
  }

  public onGetCurrentPosition() {
    var bgGeo = this._bgGeo;

    bgGeo.getCurrentPosition(function(location) {
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
  private _createPolyline() {
    var os = Platform.device.os.toUpperCase();
    var polyline = new mapsModule.Polyline();
    polyline.color = new Color(150, 38, 119, 255);
    polyline.geodesic = true;
    polyline.width = (os.toUpperCase() == 'ANDROID') ? 17 : 5;
    this._mapView.addPolyline(polyline);
    return polyline;
  }
  private _createCurrentLocationMarker(location:any) {
    var position = mapsModule.Position.positionFromLatLng(location.coords.latitude, location.coords.longitude);
    var marker = new mapsModule.Marker();
    marker.position = position;
    marker.title = "Position";
    marker.icon = 'map_marker_current_location';
    marker.flat = true;
    marker.anchor = [0.5, 0.5];
    this._mapView.addMarker(marker);

    // Blue accuracy bubble around current-position
    if (!this._currentLocationAccuracyMarker) {
      var circle = new mapsModule.Circle();
      circle.radius = location.coords.accuracy;
      circle.fillColor = new Color(50, 38, 119, 255);
      circle.strokeWidth = 0;
      circle.center = position;
      this._mapView.addCircle(circle);
      this._currentLocationAccuracyMarker = circle;
    } else {
      this._currentLocationAccuracyMarker.center = position;
      this._currentLocationAccuracyMarker.radius = location.coords.accuracy;
    }
    return marker;
  }

  private _loadGeofences() {
    this._bgGeo.getGeofences(function(geofences) {
      for (var n=0,len=geofences.length;n<len;n++) {
        this._createGeofenceMarker(geofences[n]);
      }
    }.bind(this));
  }

  private _createGeofenceMarker(geofence) {
    if (this._geofenceMarkers[geofence.identifier]) {
      return;  // <-- Marker already exists.
    }
    var position = mapsModule.Position.positionFromLatLng(geofence.latitude, geofence.longitude);
    var circle = new mapsModule.Circle();
    circle.userData = geofence;
    circle.center = position;
    circle.visible = true;
    circle.clickable = true;
    circle.radius = geofence.radius,
    circle.fillColor = new Color(70, 17,183,0);
    circle.strokeColor = new Color(200, 17,183,0);
    circle.strokeWidth = 2;
    this._geofenceMarkers[geofence.identifier] = circle;
    this._mapView.addCircle(circle);
  }

  private _destroyGeofenceMarker(identifier) {
    if (this._geofenceMarkers[identifier]) {
      var marker = this._geofenceMarkers[identifier];
      this._mapView.removeShape(marker);
      delete this._geofenceMarkers[identifier];
    }
  }

  private _createLocationMarker(location: any) {
    var position = mapsModule.Position.positionFromLatLng(location.coords.latitude, location.coords.longitude);
    var marker = new mapsModule.Marker();
    marker.position = position;
    marker.title = location.timestamp;
    marker.icon = 'map_marker_green_dot';
    marker.flat = true;
    marker.anchor = [0.5, 0.5];
    this._mapView.addMarker(marker);
    console.log('- createLocationMarker: ', location.timetamp);
    return marker;
  }

  private _createStationaryCircle(location: any) {
    var circle = new mapsModule.Circle();
    circle.center = mapsModule.Position.positionFromLatLng(location.coords.latitude, location.coords.longitude);
    circle.visible = true;
    circle.radius = 50;//this._state.stationaryRadius;
    circle.fillColor = new Color(128, 255, 0, 0);
    circle.strokeColor = new Color('#aa0000');
    circle.strokeOpacity = 0.5;
    circle.strokeWidth = 2;
    this._mapView.addCircle(circle);
    return circle;
  }

  public onLocation(location:any) {
    // Update map coords
    this.set('latitude', location.coords.latitude);
    this.set('longitude', location.coords.longitude);

    var bgGeo = this._bgGeo;

    console.info('[js] location: ', JSON.stringify(location, null, 2));

    this.activityType = location.activity.type;

    var position = mapsModule.Position.positionFromLatLng(location.coords.latitude, location.coords.longitude);

    if (!this._currentLocationMarker) {
      this._currentLocationMarker = this._createCurrentLocationMarker(location);
      this._getPolyline().addPoint(position);
      if (this.zoom < this._defaultZoom) {
        this.set('zoom', this._defaultZoom);
      }
    } else if (!location.sample) {
      this._currentLocationMarker.icon = 'map_marker_green_dot';
      this._currentLocationMarker = this._createCurrentLocationMarker(location);
      this._getPolyline().addPoint(position);
    } else {
      // update currentLocation marker with new position
      this._currentLocationMarker.position = position;
    }
    if (!location.sample) {
      this.odometer = (location.odometer/1000).toFixed(1);
    }
  }

  public onLocationError(error:any) {
    console.error('- onLocationError: ', error);
  }

  public onMotionChange(isMoving:boolean, location: any) {
    if (!isMoving) {
      this._stationaryCircle = this._createStationaryCircle(location);
    } else if (this._stationaryCircle) {
      this._mapView.removeShape(this._stationaryCircle);
      this._stationaryCircle = null;
    }
    console.info('[js] motionchange', isMoving, location);
    this.isMoving = isMoving;
    this.activityType = location.activity.type;
    this.paceButtonIcon = (isMoving) ? ICON_PAUSE : ICON_PLAY;

    if (this.zoom < this._defaultZoom) {
      this.set('zoom', this._defaultZoom);
    }
  }

  public onActivityChange(activityType:string) {
    this.activityIcon = ICONS['activity_' + activityType];
  }

  public onProviderChange(provider:any) {
    this.providerDisabled = (provider.enabled) ? 'collapsed' : 'visible';
    this.providerWifi = (provider.enabled && provider.network) ? 'visible' : 'collapsed';
    this.providerGps = (provider.enabled && provider.gps) ? 'visible' : 'collapsed';
  }

  public onGeofence(geofence:any) {
    var circle = this._geofenceMarkers[geofence.identifier];
    if (circle) {
      circle.fillColor = new Color(100, 128,128,128);
      circle.strokeColor = new Color(200, 128,128,128);
    }
  }

  public onGeofencesChange(event:any) {
    var on = event.on;
    var off = event.off;
    // Show new geofences within proximity
    for (let geofence of on) {
      this._createGeofenceMarker(geofence);
    }
    // Hide geofences out-of-proximity
    for (let identifier of off) {
      this._destroyGeofenceMarker(identifier);
    }
  }

  public onHttp(response:any) {
    console.info('[js] http: ', response);
  }

  public onHeartbeat(params: any) {
    console.info('[js] heartbeat: ', params);
  }

  public onSchedule(state: any) {
    console.info('[js] schedule: ', state);
  }

  public onError(errorCode: number) {
    console.warn('[js] error: ', errorCode);
  }

  private _getPolyline() {
    if (!this._polyline) {
      this._polyline = this._createPolyline();
    }
    return this._polyline;
  }
}

