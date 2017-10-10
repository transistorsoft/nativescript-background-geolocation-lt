import {EventData, PropertyChangeData, Observable} from 'data/observable';
import * as dialogs from "ui/dialogs";
import * as Settings from "application-settings";
import { Color } from "color";
import {BackgroundGeolocation} from "nativescript-background-geolocation-lt";
import BGService from "./lib/BGService";

const GEOFENCE_RADIUS_OPTIONS = [50, 150, 200, 500, 1000];
const GEOFENCE_LOITERING_DELAY_OPTIONS = [1000, 10000, 30000, 60000, 300000];
const WATCH_POSITION_INTERVAL_OPTIONS = [0, 1000, 5000, 10000, 30000, 60000];

/**
* @class SettingsModel
*/
export default class SettingsModel extends Observable {
  private _state:any;
  private _closeCallback:Function;
  private _email:string;
  private _url:string;
  private _geofenceRadiusOptions;
  private _geofenceLoiteringDelayOptions;
  private _radius:number;  
  private _notifyOnEntry:boolean;
  private _notifyOnExit:boolean;
  private _notifyOnDwell:boolean;
  private _loiteringDelay:number;
  private _trackingModeGeofence:boolean;
  private _dropDownColor:Color;
  private _watchPosition:boolean;
  private _watchPositionInterval:number;
  private _watchPositionIntervalOptions:Array<number>;

  constructor(state:any, closeCallback:Function) {
    super();
    this._state = state;
    this._url = state.url;

    // Email address for emailLog
    if (Settings.hasKey('email')) {
      this._email = Settings.getString('email');
    }

    // Geofence options.
    this.geofenceRadiusOptions = GEOFENCE_RADIUS_OPTIONS;
    this.geofenceLoiteringDelayOptions = GEOFENCE_LOITERING_DELAY_OPTIONS;
    this.notifyOnEntry = true;
    this.notifyOnExit = false;
    this.notifyOnDwell = false;
    this._radius = 200;
    this._loiteringDelay = 30000;
    this._trackingModeGeofence = (state.trackingMode === 0 || state.trackingMode === 'geofence');
    this._dropDownColor = new Color(255, 0, 0, 0);
    this._watchPosition = Settings.getBoolean('watchPosition') || false;
    this._watchPositionIntervalOptions = WATCH_POSITION_INTERVAL_OPTIONS;
    this._watchPositionInterval = WATCH_POSITION_INTERVAL_OPTIONS.indexOf(Settings.getNumber('watchPositionInterval'));

    // Modal closeCallback
    this._closeCallback = closeCallback;
  }

  get trackingModeGeofence():boolean {
    return this._trackingModeGeofence;
  }

  set trackingModeGeofence(value:boolean) {
    let bgService = BGService.getInstance();
    bgService.setLoading(true, 'Switching trackingMode...');
    if (value !== this._trackingModeGeofence) {
      this._trackingModeGeofence = value;
      this.notifyPropertyChange('trackingModeGeofence', value);
      if (value) {
        BackgroundGeolocation.startGeofences((state) => {
          bgService.setLoading(false);
          bgService.toast('Geofences-only tracking started');
        }, (error) => {
          bgService.setLoading(false);
          bgService.toast('startGeofences Error: ' + error);
        });
      } else {
        BackgroundGeolocation.start((state) => {
          bgService.setLoading(false);
          bgService.toast('Location + geofence tracking started');
        }, (error) => {
          bgService.setLoading(false);
          bgService.toast('Start Error: ' + error);
        });
      }
    }
  }

  set url(value:string) {
    if (value !== this._url) {
      this.notifyPropertyChange('url', value);
      this._url = value;
      BackgroundGeolocation.setConfig({'url':value});
    }
  }

  get url():string {
    return this._url;
  }

  set email(value:string) {
    if (this._email !== value) {
      this._email = value;
      Settings.setString('email', value);
      this.notifyPropertyChange('email', value);
    }
  }

  get email():string {
    return this._email;
  }

  get geofenceRadiusOptions():Array<number> {
    return this._geofenceRadiusOptions;    
  }

  set geofenceRadiusOptions(value:Array<number>) {
    this._geofenceRadiusOptions = value;
    this.notifyPropertyChange('geofenceRadiusOptions', value);
  }

  get geofenceLoiteringDelayOptions():Array<number> {
    return this._geofenceLoiteringDelayOptions;
  }

  set geofenceLoiteringDelayOptions(value:Array<number>) {
    this._geofenceLoiteringDelayOptions = value;
    this.notifyPropertyChange('geofenceLoiteringDelayOptions', value);
  }

  get notifyOnEntry():boolean {
    return this._notifyOnEntry;
  }
  set notifyOnEntry(value:boolean) {
    this._notifyOnEntry = value;
    this.notifyPropertyChange('notifyOnEntry', value);
  }

  get notifyOnExit():boolean {
    return this._notifyOnExit;
  }
  set notifyOnExit(value:boolean) {
    this._notifyOnExit = value;
    this.notifyPropertyChange('notifyOnExit', value);
  }

  get notifyOnDwell():boolean {
    return this._notifyOnDwell;
  }
  set notifyOnDwell(value:boolean) {
    this._notifyOnDwell = value;
    this.notifyPropertyChange('notifyOnDwell', value);
  }

  get dropDownColor():Color {
    return this._dropDownColor;
  }

  get watchPosition():boolean {
    return this._watchPosition;
  }  
  set watchPosition(value:boolean) {
    if (this._watchPosition) {
      BackgroundGeolocation.stopWatchPosition();
    }
    let interval = this._watchPositionIntervalOptions[this._watchPositionInterval];
    if (value) {      
      BackgroundGeolocation.watchPosition((location) => {
        console.log('- watchPosition: ', JSON.stringify(location, null, 2));
      }, (error) => {
        console.log('- watchPosition error: ', error);
      }, {
        interval: interval
      });
    }
    BGService.getInstance().setWatchPosition(value, interval);
    this._watchPosition = value;
  }

  get watchPositionInterval():number {
    return this._watchPositionInterval;
  }

  get watchPositionIntervalOptions():Array<number> {
    return this._watchPositionIntervalOptions;
  }

  public onChangeGeofenceRadius(event:any) {
    this._radius = GEOFENCE_RADIUS_OPTIONS[event.newIndex];
  }

  public onChangeGeofenceLoiteringDelay(event:any) {
    this._loiteringDelay = GEOFENCE_LOITERING_DELAY_OPTIONS[event.newIndex];
  }
  public onClickClose() {
    this._closeCallback();
  }

  public onToggleChange(event:any) {
    let bgService = BGService.getInstance();
    let setting = event.object.bindingContext;
    let config = {};
    config[setting.name] = event.value;
    BackgroundGeolocation.setConfig(config, () => {
      bgService.toast("setConfig success\n" + JSON.stringify(config));
    }, (error) => {
      bgService.toast('setConfig error: ' + error);
    });
  }

  public onSelectChange(event:any) {
    let bgService = BGService.getInstance();
    let setting = event.object.bindingContext;
    let value   = setting.values[event.newIndex];    
    let config = {};
    config[setting.name] = value;    
    BackgroundGeolocation.setConfig(config, () => {
      bgService.toast("setConfig success\n" + JSON.stringify(config));
    }, (error) => {
      bgService.toast('setConfig error: ' + error);
    });
  }

  public onClickResetOdometer() {
    let bgService = BGService.getInstance();
    bgService.playSound('button_click');
    BackgroundGeolocation.resetOdometer((location) => {

    });
  }

  public onClickSync() {
    let bgService = BGService.getInstance();
    bgService.playSound('button_click');
    BackgroundGeolocation.getCount(count => {
      if (!count) {
        bgService.toast('Database is empty');
        return;
      }
      dialogs.confirm('Upload ' + count + ' records?').then(result => {
        if (!result) return;
        BackgroundGeolocation.sync(rs => {
          bgService.playSound('message_sent');
          bgService.toast('Upload success (' + count + ' records)');
        }, (error) => {
          bgService.toast('Upload error: ' + error);
        });
      });
    });
  }

  public onClickDestroyLogs() {
    let bgService = BGService.getInstance();
    bgService.playSound('button_click');
    BackgroundGeolocation.destroyLog(() => {
      bgService.playSound('message_sent');
    });
  }

  public onClickEmailLogs() {
    let bgService = BGService.getInstance();
    bgService.setLoading(true, "Preparing log...");
    bgService.playSound('button_click');
    if (!this._email) {
      dialogs.alert("You must enter an email address");
      return;
    }
    BackgroundGeolocation.emailLog('christocracy@gmail.com', () => {
      bgService.playSound('message_sent');
      bgService.setLoading(false);
    }, (error) => {
      bgService.setLoading(false);
      bgService.toast('Error: ' + error);
    });
  }

  public onClickAddGeofences() {

    let bgService = BGService.getInstance();
    bgService.setLoading(true, 'Loading geofences');

    let geofences = [];
    let index = 1;
    bgService.getCityDriveData().forEach(location => {
      geofences.push({
        identifier: ('geofence_' + index++),
        radius: this._radius,
        latitude: location.lat,
        longitude: location.lng,
        notifyOnEntry: this._notifyOnEntry,
        notifyOnExit: this._notifyOnExit,
        notifyOnDwell: this._notifyOnDwell,
        loiteringDelay: this._loiteringDelay
      });
    });
    BackgroundGeolocation.addGeofences(geofences, () => {
      bgService.playSound('ADD_GEOFENCE');
      bgService.toast('Added Freeway Drive geofences');
      bgService.setLoading(false);
    }, (error) => {
      console.error('Error adding geofences: ', error);
      bgService.toast('Error adding geofences: ' + error);
      bgService.setLoading(false);
    });
  }

  public onClickRemoveGeofences() {
    let bgService = BGService.getInstance();
    bgService.playSound('button_click');
    BackgroundGeolocation.removeAllGeofences(() => {
      bgService.toast('Removed all geofences');
      bgService.playSound('message_sent');
    });
  }

  public onChangeWatchPositionInterval(event:any) {
    this._watchPositionInterval = event.newIndex;
    if (this._watchPosition) {
      this.watchPosition = true;
    }
  }

  public onClickAbout() {
    BGService.getInstance().playSound('flourish');
    alert("NativeScript BackgroundGeolocation demo by Transistor Software");
  }
}