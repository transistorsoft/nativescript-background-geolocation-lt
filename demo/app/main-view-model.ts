import {Observable} from 'data/observable';
import Platform = require('platform');
import * as dialogs from "ui/dialogs";
import {BackgroundGeolocation} from "nativescript-background-geolocation-lt";
import {BackgroundFetch} from "nativescript-background-fetch";

import * as Toast from 'nativescript-toast';
import { Border } from "tns-core-modules/ui/border";
import frames = require("ui/frame");

import BGService from "./lib/BGService";

const ICONS = {
  play: 'ion-play',
  pause: 'ion-pause',
  activity_unknown: 'ion-ios-help',
  activity_still: 'ion-man',
  activity_on_foot: 'ion-android-walk',
  activity_walking: 'ion-android-walk',
  activity_running: 'ion-android-walk',
  activity_in_vehicle: 'ion-android-car',
  activity_on_bicycle: 'ion-android-bicycle'
};

export class HelloWorldModel extends Observable {

  private _location: string;
  private _counter: number;
  private _message: string;
  private _isMoving: boolean;
  private _enabled: boolean;
  private _paceButtonIcon: string;
  private _motionActivity: string;
  private _odometer: any;
  private _mainMenuActivated: boolean;
  private _isPowerSaveMode:boolean;

  constructor() {
    super();
    this._mainMenuActivated = false;
    this.odometer = 0;
    this.motionActivity = 'unknown';

    BackgroundFetch.status((status) => {
      console.log('- BackgroundFetch status: ', status);
    });
    // Listen to iOS-only BackgroundFetch events. 
    BackgroundFetch.configure({stopOnTerminate: false}, () => {
      console.log('[event] BackgroundFetch');
      BackgroundFetch.finish(UIBackgroundFetchResult.NewData);
    });

    // Ten optional events to listen to:
    BackgroundGeolocation.on("location", this.onLocation.bind(this));
    BackgroundGeolocation.on("motionchange", this.onMotionChange.bind(this));      
    BackgroundGeolocation.on('http', this.onHttp.bind(this));
    BackgroundGeolocation.on('providerchange', this.onProviderChange.bind(this));
    BackgroundGeolocation.on('powersavechange', this.onPowerSaveChange.bind(this));
    BackgroundGeolocation.on('schedule', this.onSchedule.bind(this));
    BackgroundGeolocation.on('activitychange', this.onActivityChange.bind(this));
    BackgroundGeolocation.on('heartbeat', this.onHeartbeat.bind(this));
    BackgroundGeolocation.on('geofence', this.onGeofence.bind(this));
    BackgroundGeolocation.on('geofenceschange', this.onGeofencesChange.bind(this));

    // Fetch list of available sensors on this device.
    BackgroundGeolocation.getSensors((sensors) => {
      console.log('[js] sensors: ', JSON.stringify(sensors, null, 2));
      BGService.getInstance().toast('Sensors: ' + JSON.stringify(sensors));
    });
    // Fetch current state of power-save mode.
    BackgroundGeolocation.isPowerSaveMode((mode) => {
      console.log('[js] isPowerSaveMode: ', mode);
      this.isPowerSaveMode = mode;
    });
    // Fetch current config settings.
    BGService.getInstance().getConfig(config => {
      // Configure BackgroundGeolocation
      BackgroundGeolocation.configure(config, (state) => {
        console.log('[js] configure success: ', state);
        this.paceButtonIcon = (state.isMoving) ? ICONS.pause : ICONS.play;
        this.enabled = state.enabled;
      });
    });
  }

  /**
  * Properties
  */
  get users() {
    return [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}];
  }

  set enabled(value:boolean) {
    console.log('- setEnabled: ', value);
    this.notifyPropertyChange('enabled', value);
    this._enabled = value;
    if (value) {
      BackgroundGeolocation.start();
    } else {
      BackgroundGeolocation.stop();
      this.isMoving = false;
      BackgroundGeolocation.stopWatchPosition();

    }
  }

  get enabled():boolean {
    return this._enabled;
  }

  set isMoving(value:boolean) {
    this._isMoving = value;
    this.paceButtonIcon = (this._isMoving === true) ? ICONS.pause : ICONS.play;
  }

  get isMoving():boolean {
    return this._isMoving;
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

  set location(location:string) {
    this._location = location;
    this.notifyPropertyChange('location', this._location);
  }
  get location():string {
    return this._location;
  }

  get odometer() {
    return this._odometer;
  }
  set odometer(value) {
     this._odometer = Math.round((value/1000)*10)/10 + 'km'
     this.notifyPropertyChange('odometer', this._odometer);
  }

  get motionActivity():string {
    return this._motionActivity;
  }
  set motionActivity(activity) {
    if (this.motionActivity !== activity) {
      this._motionActivity = activity;
      this.notifyPropertyChange('motionActivity', activity);
    }
  }

  get mainMenuIcon() {
    let icon = 'res://';
    if (this._mainMenuActivated) {
      icon += 'delete'
    } else {
      icon += 'arrow_down_filled';
    }
    return icon;
  }
  set mainMenuActivated(value:boolean) {
    this._mainMenuActivated = value;
    this.notifyPropertyChange('mainMenuActivated', value);
    this.notifyPropertyChange('mainMenuIcon', this.mainMenuIcon);
  }
  get mainMenuActivated():boolean {
    return this._mainMenuActivated;
  }

  get isPowerSaveMode():boolean {
    return this._isPowerSaveMode;
  }
  set isPowerSaveMode(value:boolean) {
    this._isPowerSaveMode = value;
    this.notifyPropertyChange('isPowerSaveMode', value);
  }

  /**
  * UI handlers
  */
  public onToggleMainMenu() {
    this.mainMenuActivated = !this.mainMenuActivated;
    let soundId = (this._mainMenuActivated) ? 'OPEN' : 'CLOSE';
    BGService.getInstance().playSound(soundId);
  }

  public onClickMainMenu(event:any) {
    let bgService = BGService.getInstance();

    switch (event.object.itemId) {
      case 'settings':
        bgService.playSound('open');
        bgService.setLoading(true, 'Loading...');

        frames.topmost().currentPage.showModal("./settings-page", null, () => {
          bgService.playSound('close');
        }, true);
        break;
       case 'resetOdometer':
         bgService.playSound('button_click');
         BackgroundGeolocation.resetOdometer((location) => {
           bgService.toast('Reset odometer success');
         });
         break;
       case 'emailLog':
         bgService.playSound('button_click');
         let email = bgService.getEmail();
         if (!email) {
           alert('Configure your email address in settings screen');
           return;
         }
         bgService.setLoading(true, 'Preparing log...');
         BackgroundGeolocation.emailLog(email, () => {
           bgService.setLoading(false);
         }, (error) => {
           bgService.setLoading(false);
           bgService.toast('Error: ' + error);           
         });
         
         break;
       case 'sync':
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
         break;
       case 'destroyLocations':
         bgService.playSound('button_click');
         BackgroundGeolocation.getCount(count => {
           if (!count) {
             bgService.toast('Database is empty');
             return;
           }
           dialogs.confirm('Destroy ' + count + ' locations?').then(result => {
             if (!result) return;
             BackgroundGeolocation.destroyLocations(() => {
               bgService.toast('Destroyed ' + count + ' locations');
               bgService.playSound('message_sent');
             });
           });
         });
         break;       
    }    
  }

  public onChangePace() {    
    let isMoving = !this._isMoving;
    console.log('[js] changePace: ', isMoving, typeof(this._isMoving));
    this.isMoving = isMoving;
    BackgroundGeolocation.changePace(isMoving, () => {
      
    });    
  }
  public onGetCurrentPosition() {   
    BackgroundGeolocation.getCurrentPosition((location) => {
      console.log('[js] getCurrentPosition', location);
    }, (error) => {
      console.warn('[js] location error: ', error);
      BGService.getInstance().toast('Location error: ' + error);
    }, {
      samples: 3,
      persist: true
    });
  }

  /**
  * Event-listeners
  */
  private onLocation(location:any) {
    console.log('[event] location: ', location);
    this.location = JSON.stringify(location, null, 2);
    this.odometer = location.odometer;
    BackgroundGeolocation.logger.notice('Location received in client');
  }

  private onMotionChange(isMoving:boolean, location:any) {
    console.log('[event] motionchange: ', isMoving, location);
    this.isMoving = isMoving;
  }

  private onActivityChange(event:any) {
    console.log('[event] activitychange: ', event.activity, event.confidence);
    this.motionActivity = event.activity;
  }

  private onProviderChange(provider:any) {
    console.log('[event] providerchange: ', provider);
  }

  private onGeofence(geofence:any) {
    console.log('[event] geofence', geofence);
    this.location = JSON.stringify(geofence, null, 2);
  }

  private onGeofencesChange(event:any) {
    console.log('[event] geofenceschange ON:', JSON.stringify(event.on), ', OFF:', JSON.stringify(event.off));
  }

  private onHttp(response:any) {
    console.log('[event] http: ', response.status, response.responseText);
  }

  private onHeartbeat(event:any) {
    console.log('[event] heartbeat', event);
  }

  private onSchedule(state:any) {
    console.log('[event] schedule: ', state.enabled);
  }

  private onPowerSaveChange(isPowerSaveMode:boolean) {
    console.log('[event] powersavechange: ', isPowerSaveMode);
    this.isPowerSaveMode = isPowerSaveMode;
  }
}