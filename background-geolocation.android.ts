/// <reference path="./node_modules/tns-platform-declarations/tns-core-modules/android17.d.ts" />

import {AbstractBackgroundGeolocation} from './background-geolocation.common';

var permissions = require("nativescript-permissions");

import app = require('application');

declare var com: any;

let Callback = com.transistorsoft.locationmanager.adapter.TSCallback;
let TAG = "TSLocationnManager";
let REQUEST_ACTION_START = 1;
let REQUEST_ACTION_GET_CURRENT_POSITION = 2;
let REQUEST_ACTION_START_GEOFENCES = 3;

export class BackgroundGeolocation extends AbstractBackgroundGeolocation {
	private mConfig: any;
	private requestAction: number;
	private isStarting = false;
	private startCallback: any;
	private backgroundServiceIntent: any;
	private isEnabled: boolean;
	private forceReload: boolean;
  private getCountCallbacks: any;

	constructor() {
    super();

    this.startCallback = null;
    this.getCountCallbacks = [];


    var adapter = this.getAdapter();
    adapter.on("playservicesconnecterror", new Callback({
      success: this.onGooglePlayServicesConnectError.bind(this),
      error: this.emptyFn
    }));
  }

  public configure(config, success=function(state){}, failure=function(error){}) {
    var callback = new Callback({
      success: function(state:org.json.JSONObject) {
        success(JSON.parse(state.toString()));
      }.bind(this),
      error: function(error:android.os.Bundle) {
        console.log('- BackgroundGeolocation#configure error: ', error);
        failure(error);
      }.bind(this)
    });

  	this.getAdapter().configure(new org.json.JSONObject(JSON.stringify(config)), callback);

    return this.state;
	}

  public on(event:any, success:any, failure=function(param){}) {
    if (typeof(event) === 'object') {
      for (var key in event) {
        this.on(key, event[key]);
      }
      return;
    }
    if (!this.listeners[event]) {
      throw "Invalid event: " + event;
    }

    var cb;
    switch (event) {
      case 'motionchange':
        cb = this.createMotionChangeCallback(success);
        break;
      case 'activitychange':
        cb = this.createActivityChangeCallback(success);
        break;
      default:
        cb = new Callback({
          success: function(response) {
            success(JSON.parse(response.toString()));
          },
          error: failure
        });
        break;
    }
    this.getAdapter().on(event, cb);
  }

  public toObject(jsonObject:org.json.JSONObject) {
    return JSON.parse(jsonObject.toString());
  }

	public changePace(value: boolean, callback=function(location){}, failure=function(error){}) {
    var cb = new Callback({
      success: function(location:org.json.JSONObject) {
        callback(JSON.parse(location.toString()));
      },
      error: failure
    });
    this.getAdapter().changePace(value, cb);
	}

  public setConfig(config, success=function(state){}, failure=function(error){}) {
    var callback = new Callback({
      success: success,
      error: failure
    });
    this.getAdapter().setConfig(new org.json.JSONObject(JSON.stringify(config)), callback);
  }
	public start(success=function(state){}, failure=function(error){}) {
    if (this.hasPermission()) {
      this.setEnabled(true, success, failure);
    } else {
      this.requestPermission(function() {
        this.setEnabled(true, success, failure);
      }.bind(this), function() {
        console.log('- requestPermission failure');
      }.bind(this));
    }
	}
  public startSchedule(success=function(){}, failure=function(error){}) {
    if (this.getAdapter().startSchedule()) {
      success();
    } else {
      failure("Failed to start schedule.  Did you configure a #schedule?");
    }

  }
	public stop(success: any, failure: any) {
		this.getAdapter().stop();
	}

  public getCurrentPosition(success: Function, failure=function(error){}, options={}) {
    var callback = new Callback({
      success: success,
      error: failure
    });
    this.getAdapter().getCurrentPosition(new org.json.JSONObject(JSON.stringify(options)), callback);
  }
  public watchPosition(success: Function, failure=function(error){}, options={}) {
    var callback = new Callback({
      success: function(location:org.json.JSONObject) {
        success(JSON.parse(location.toString()));
      },
      error: failure
    });
    this.getAdapter().watchPosition(new org.json.JSONObject(JSON.stringify(options)), callback);
  }
  public stopWatchPosition(success=function(result){}, failure=function(error){}) {
    var callback = new Callback({
      success: success,
      error: failure
    });
    this.getAdapter().stopWatchPosition(callback);
  }
  public getCount(success:Function) {
    var callback = new Callback({
      success: success,
      error: function(error) {}
    });
    this.getAdapter().getCount(callback);
  }

  public getOdometer(): number {
    return this.getAdapter().getOdometer();
  }

  public resetOdometer() {
    this.getAdapter().resetOdometer();
  }
  public addGeofence(params:any, success=function(param:any){}, failure=function(error:any){}) {
    var callback = new Callback({
      success: success,
      error: failure
    });
    this.getAdapter().addGeofence(new org.json.JSONObject(JSON.stringify(params)), callback);
  }
  public addGeofences(geofences:any, success=function(param:any){}, failure=function(error:any){}) {
    var callback = new Callback({
      success: success,
      error: failure
    });
    this.getAdapter().addGeofences(new org.json.JSONArray(JSON.stringify(geofences)), callback);
  }
  public getGeofences(success:Function, failure=function(){}): any {
    var callback = new Callback({
      success: function(rs) {
        success(JSON.parse(rs.toString()));
      },
      error: failure
    });
    this.getAdapter().getGeofences(callback);
  }
  public removeGeofences(success=function(result){}, failure=function(error){}) {
    var callback = new Callback({
      success: success,
      error: failure
    });
    this.getAdapter().removeGeofences(callback);
  }
  public removeGeofence(identifier, success=function(result){}, failure=function(error){}) {
    var callback = new Callback({
      success: success,
      error: failure
    });
    this.getAdapter().removeGeofence(identifier, callback);
  }

  public clearDatabase(success=function(result){}, failure=function(error){}) {
    var callback = new Callback({
      success: success,
      error: failure
    });
    this.getAdapter().clearDatabase(callback);
  }

  public sync(success:Function, failure=function(error){}) {
    var callback = new Callback({
      success: function(rs) {
        success(JSON.parse(rs.toString()));
      },
      error: failure
    });
    this.getAdapter().sync(callback);
  }

  public getLocations(success:Function, failure:any) {
    var callback = new Callback({
      success: function(rs) {
        success(JSON.parse(rs.toString()));
      },
      error: failure
    });
    this.getAdapter().getLocations(callback);
  }

  public insertLocation(params, success=function(result){}, failure=function(error){}) {
    var callback = new Callback({
      success: success,
      error: failure
    });
    this.getAdapter().insertLocation(new org.json.JSONArray(JSON.stringify(params)), callback);
  }

  public playSound(soundId) {
    com.transistorsoft.locationmanager.adapter.BackgroundGeolocation.startTone(soundId);
  }

  private setEnabled(value: boolean, success:Function, failure:Function) {
    var adapter = this.getAdapter();
    if (value) {
      var me = this;
      var callback = new Callback({
        success: success,
        error: failure
      });
      adapter.start(callback);
    } else {
      adapter.stop();
      success();
    }
  }

  private createHttpCallback(success=function(status, responseText){}, failure=function(status, rseponseText){}) {
    return new Callback({
      success: function(response) {
        success(response.getInt("status"), response.getString("responseText"));
      },
      error: function(response) {
        failure(response.getInt("status"), response.getString("responseText"));
      }
    });
  }
  private createMotionChangeCallback(callback) {
    return new Callback({
      success: function(params: org.json.JSONObject) {
        var location = params.getJSONObject("location");
        var moving = params.getBoolean("isMoving");
        callback(moving, JSON.parse(location.toString()));
      },
      error: function(error){}
    });
  }
  private createActivityChangeCallback(callback) {
    return new Callback({
      success: function(activityName: string) {
        callback(activityName);
      },
      error: function(error){}
    });
  }

  private onGooglePlayServicesConnectError(errorCode:number) {
    com.google.android.gms.common.GoogleApiAvailability.GoogleApiAvailability.getInstance().getErrorDialog(app.android.foregroundActivity, errorCode, 1001).show();
  }

  private hasPermission() {
    var result = android.os.Build.VERSION.SDK_INT < 23;
    if (!result) {
        result = (
          (permissions.hasPermission((<any>android).Manifest.permission.ACCESS_FINE_LOCATION))
          && (permissions.hasPermission((<any>android).Manifest.permission.ACCESS_COARSE_LOCATION))
        );
    }
    return result;
  }

  private getAdapter(): any {
    return com.transistorsoft.locationmanager.adapter.BackgroundGeolocation.getInstance(app.android.currentContext, app.android.foregroundActivity.getIntent());
  }
  private requestPermission(success: any, failure: any) {
    permissions.requestPermission((<any>android).Manifest.permission.ACCESS_FINE_LOCATION, "Background tracking required").then(success).catch(failure);
  }

}
