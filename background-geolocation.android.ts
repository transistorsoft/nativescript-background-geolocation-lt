import {AbstractBackgroundGeolocation, Logger} from './background-geolocation.common';

var permissions = require("nativescript-permissions");

import app = require('application');

declare var com: any;

let TSCallback = com.transistorsoft.locationmanager.adapter.callback.TSCallback;
let TSLocationCallback = com.transistorsoft.locationmanager.adapter.callback.TSLocationCallback;
let TSLocation = com.transistorsoft.locationmanager.location.TSLocation;
let TSPlayServicesConnectErrorCallback = com.transistorsoft.locationmanager.adapter.callback.TSPlayServicesConnectErrorCallback;
let TSSyncCallback = com.transistorsoft.locationmanager.adapter.callback.TSSyncCallback;
let TSGetLocationsCallback = com.transistorsoft.locationmanager.adapter.callback.TSGetLocationsCallback;
let TSGetCountCallback = com.transistorsoft.locationmanager.adapter.callback.TSGetCountCallback;
let TSInsertLocationCallback = com.transistorsoft.locationmanager.adapter.callback.TSInsertLocationCallback;
let TSGetGeofencesCallback = com.transistorsoft.locationmanager.adapter.callback.TSGetGeofencesCallback;
let TSGetLogCallback = com.transistorsoft.locationmanager.adapter.callback.TSGetLogCallback;
let TSEmailLogCallback = com.transistorsoft.locationmanager.adapter.callback.TSEmailLogCallback;
let TSActivityChangeCallback = com.transistorsoft.locationmanager.adapter.callback.TSActivityChangeCallback;
let TSHttpResponseCallback = com.transistorsoft.locationmanager.adapter.callback.TSHttpResponseCallback;
let TSGeofenceCallback = com.transistorsoft.locationmanager.adapter.callback.TSGeofenceCallback;
let TSGeofencesChangeCallback = com.transistorsoft.locationmanager.adapter.callback.TSGeofencesChangeCallback;
let TSHeartbeatCallback = com.transistorsoft.locationmanager.adapter.callback.TSHeartbeatCallback;
let TSLocationProviderChangeCallback = com.transistorsoft.locationmanager.adapter.callback.TSLocationProviderChangeCallback;
let TSScheduleCallback = com.transistorsoft.locationmanager.adapter.callback.TSScheduleCallback;
let TSPowerSaveChangeCallback = com.transistorsoft.locationmanager.adapter.callback.TSPowerSaveChangeCallback;

let TSSensors = com.transistorsoft.locationmanager.util.Sensors;

let TAG = "TSLocationnManager";
let REQUEST_ACTION_START = 1;
let REQUEST_ACTION_GET_CURRENT_POSITION = 2;
let REQUEST_ACTION_START_GEOFENCES = 3;
let emptyFn = function() {};

// Inform adapter.BackgroundGeolocation when Activity is destroyed.
app.android.on(app.AndroidApplication.activityDestroyedEvent, function(args) {
  BackgroundGeolocation.onActivityDestroyed(args);
});

export class BackgroundGeolocation extends AbstractBackgroundGeolocation {
	private static forceReload: boolean;
  private static intent: android.content.Intent;

  public static onActivityDestroyed(args) {
    this.getAdapter().onActivityDestroy();
    this.intent = null;
  }

  public static addListener(event:any, success?:Function, failure?:Function) {
    if (typeof(event) === 'object') {
      for (var key in event) {
        this.addListener(key, event[key]);
      }
      return;
    }
    if (this.events.indexOf(event) < 0) {
      throw "Invalid event: " + event;
    }
    failure = failure || emptyFn;
    var cb;
    switch (event) {
      case 'location':
        cb = this.createLocationCallback(success, failure);
        this.getAdapter().onLocation(cb);
        break;
      case 'motionchange':
        cb = this.createMotionChangeCallback(success);
        this.getAdapter().onMotionChange(cb);
        break;
      case 'activitychange':
        cb = this.createActivityChangeCallback(success);
        this.getAdapter().onActivityChange(cb);
        break;
      case 'http':
        cb = this.createHttpCallback(success, failure);
        this.getAdapter().onHttp(cb);
        break;
      case 'geofence':
        cb = this.createGeofenceCallback(success);
        this.getAdapter().onGeofence(cb);
        break;
      case 'geofenceschange':
        cb = this.createGeofencesChangeCallback(success);
        this.getAdapter().onGeofencesChange(cb);
        break;
      case 'schedule':
        cb = this.createScheduleCallback(success);
        this.getAdapter().onSchedule(cb);
        break;
      case 'heartbeat':
        cb = this.createHeartbeatCallback(success);
        this.getAdapter().onHeartbeat(cb);
        break;
      case 'providerchange':
        cb = this.createProviderChangeCallback(success);
        this.getAdapter().onLocationProviderChange(cb);
        break;
      case 'powersavechange':
        cb = this.createPowerSaveChangeCallback(success);
        this.getAdapter().onPowerSaveChange(cb);
        break;      
    }
    if (cb) {
      this.registerCallback(event, success, cb);
    }
  }

  protected static removeNativeListener(event:string, callback:Function) {
    this.getAdapter().removeListener(event, callback);
  }
  
  /**
  * Configuration Methods
  */
  public static configure(config:Object, success?:Function, failure?:Function) {
    let adapter = this.getAdapter();
    let callback = new TSCallback({
      onSuccess: () => {
        success(JSON.parse(adapter.getState().toString()));
      },
      onError: (error:string) => {
        failure(error);
      }
    });

    adapter.configure(new org.json.JSONObject(JSON.stringify(config)), callback);

  }

  public static setConfig(config:Object, success?:Function, failure?:Function) {
    let adapter = this.getAdapter();
    failure = failure || emptyFn;
    success = success || emptyFn;
    let callback = new TSCallback({
      onSuccess: () => {
        success(JSON.parse(adapter.getState().toString()));
      },
      onError: (error:string) => {
        failure(error);
      }
    });
    adapter.setConfig(new org.json.JSONObject(JSON.stringify(config)), callback);
  }

  public static getState(success:Function) {
    success(JSON.parse(this.getAdapter().getState().toString()));
  }

  /**
  * Tracking Methods
  */
	public static start(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    if (this.hasPermission()) {
      this.setEnabled(true, success, failure);
    } else {
      this.requestPermission(() => {
        this.setEnabled(true, success, failure);
      }, () => {
        console.log('- requestPermission failure');
      });
    }
	}

  public static stop(success?:Function, failure?:Function) {
    success = success || emptyFn;
    let adapter = this.getAdapter();
    adapter.stop(new TSCallback({
      onSuccess: function() {
        success(JSON.parse(adapter.getState().toString()));
      },
      onFailure: (error:string) => {
        failure(error);
      }
    }));
  }

  public static changePace(value: boolean, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    let adapter = this.getAdapter();
    var cb = new TSCallback({
      onSuccess: () => {
        success();
      },
      onFailure: (error:string) => {
        failure(error);
      }
    });
    adapter.changePace(value, cb);
  }

  public static startSchedule(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    if (this.getAdapter().startSchedule()) {
      this.getState(success);
    } else {
      failure("Failed to start schedule.  Did you configure a #schedule?");
    }
  }

  public static stopSchedule(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.getAdapter().stopSchedule();
    this.getState(success);
  }

  public static startGeofences(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;    
    
    let callback = new TSCallback({
      onSuccess: () => {
        success();
      },
      onFailure: (error:string) => {
        failure(error);
      }
    });

    if (this.hasPermission()) {
      this.getAdapter().startGeofences(callback);
    } else {
      this.requestPermission(() => {
        this.getAdapter().startGeofences(callback);
      }, () => {
        failure('Permission denied');
      });
    }    
  }

  public static getCurrentPosition(success: Function, failure?:Function, options?:Object) {
    failure = failure || emptyFn;
    options = options || {};
    
    let callback = new TSLocationCallback({
      onLocation: (tsLocation:any) => {
        success(JSON.parse(tsLocation.toJson().toString()));
      },
      onError: (error:number) => {
        failure(error);
      }
    });
    this.getAdapter().getCurrentPosition(new org.json.JSONObject(JSON.stringify(options)), callback);
  }

  public static watchPosition(success:Function, failure?:Function, options?:Object) {
    failure = failure || emptyFn;
    options = options || {};
    var callback = new TSLocationCallback({
      onLocation: function(tsLocation:any) {
        success(JSON.parse(tsLocation.toJson().toString()));
      },
      onError: function(error: number) {
        failure(error);
      }
    });
    this.getAdapter().watchPosition(new org.json.JSONObject(JSON.stringify(options)), callback);
  }

  public static stopWatchPosition(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    let callback = new TSCallback({
      onSuccess: () => {
        success();
      },
      onError: (error: string) => {
        failure(error);
      }
    });
    this.getAdapter().stopWatchPosition(callback);
  }

  public static getOdometer(success:Function, failure?:Function) {
    success(this.getAdapter().getOdometer());
  }

  public static setOdometer(value:number, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    let callback = new TSLocationCallback({
      onLocation: (tsLocation:any) => {
        success(JSON.parse(tsLocation.toJson().toString()));
      },
      onError: function(error:number) {
        failure(error);
      }
    });

    if (this.hasPermission()) {
      this.getAdapter().setOdometer(new java.lang.Float(value), callback);
    } else {
      this.requestPermission(function() {
        this.getAdapter().setOdometer(new java.lang.Float(value), callback);
      }.bind(this), function() {
        console.log('- requestPermission failure');
      }.bind(this));
    }
  }
  public static resetOdometer(success?:Function, failure?:Function) {
    this.setOdometer(0, success, failure);
  }

  /**
  * HTTP & Persistence Methods
  */
  public static sync(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    let callback = new TSSyncCallback({
      onSuccess: function(records:any) {
        let size = records.size();
        let result = [];      
        for (let i=0;i<size;i++) {
          let record = records.get(i);
          result.push(JSON.parse(record.json.toString()));
        }
        success(result);
      },
      onFailure: function(error:string) {
        failure(error);
      }
    });
    this.getAdapter().sync(callback);
  }


  public static getLocations(success:Function, failure?:Function) {
    failure = failure || emptyFn;
    let callback = new TSGetLocationsCallback({
      onSuccess: (records:any) => {
        let size = records.size();
        let result = [];      
        for (let i=0;i<size;i++) {
          let record = records.get(i);
          result.push(JSON.parse(record.json.toString()));
        }
        success(result);
      },
      onFailure: (error:string) => {
        failure(error);
      }
    });
    this.getAdapter().getLocations(callback);
  }

  public static getCount(success:Function) {
    let callback = new TSGetCountCallback({
      onSuccess: (count:number) => {
        success(count);
      },
      onFailure: (error:string) => {
        console.warn('Failed to getCount: ', error);
      }
    });
    this.getAdapter().getCount(callback);
  }

  public static insertLocation(data:any, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    let callback = new TSInsertLocationCallback({
      onSuccess: (uuid:string) => {
        success(uuid);
      },
      onFailure: (error: string) => {
        failure(error);
      }
    });
    this.getAdapter().insertLocation(new org.json.JSONObject(JSON.stringify(data)), callback);
  }

  // @deprecated
  public static clearDatabase(success?:Function, failure?:Function) {
    this.destroyLocations(success, failure);
  }

  public static destroyLocations(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    let callback = new TSCallback({
      onSuccess: () => {
        success();
      },
      onFailure: (error:string) => {
        failure(error);
      }
    });
    this.getAdapter().destroyLocations(callback);
  }

  /**
  * Geofencing Methods
  */
  public static addGeofence(params:any, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;

    let callback = new TSCallback({
      onSuccess: () => {
        success();
      },
      onFailure: (error:string) => {
        failure(error);
      }
    });
    this.getAdapter().addGeofence(new org.json.JSONObject(JSON.stringify(params)), callback);
  }

  public static removeGeofence(identifier:string, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;

    let callback = new TSCallback({
      onSuccess: () => {
        success();
      },
      onFailure: (error:string) => {
        failure(error);
      }
    });
    this.getAdapter().removeGeofence(identifier, callback);
  }

  public static addGeofences(geofences?:Array<Object>, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    geofences = geofences || [];
    let callback = new TSCallback({
      onSuccess: () => {
        success();
      },
      onFailure: (error:string) => {
        failure(error);
      }
    });
    this.getAdapter().addGeofences(new org.json.JSONArray(JSON.stringify(geofences)), callback);
  }

  public static removeGeofences(geofences?:Array<string>, success?:Function, failure?:Function) {
    // Handle case where no geofences are provided (ie: remove all geofences).
    if (typeof(geofences) === 'function') {
      failure = success;
      success = geofences;
      geofences = [];
    }
    geofences = geofences || [];
    success = success || emptyFn;
    failure = failure || emptyFn;

    let callback = new TSCallback({
      onSuccess: () => {
        success();
      },
      onFailure: (error:string) => {
        failure(error);
      }
    });
    let identifiers = new java.util.ArrayList();
    geofences.forEach((identifier) => { identifiers.add(identifier); });
    this.getAdapter().removeGeofences(identifiers, callback);
  }

  public static getGeofences(success:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    let callback = new TSGetGeofencesCallback({
      onSuccess: (records:any) => {
        let size = records.size();
        let result = [];      
        for (let i=0;i<size;i++) {
          let geofence = records.get(i);
          result.push(JSON.parse(geofence.toJson()));
        }
        success(result);
      },
      onFailure: (error:string) => {
        failure(error);
      }
    });
    this.getAdapter().getGeofences(callback);
  }

  /**
  * Logging & Debug methods
  */
  public static getLog(success: Function, failure?:Function) {
    failure = failure || emptyFn;
    let callback = new TSGetLogCallback({
      onSuccess: (log:string) => {
        success(log)
      },
      onFailure: (error:string) => {
        failure(error);
      }
    });
    this.getAdapter().getLog(callback);
  }

  public static emailLog(email:string, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    let callback = new TSEmailLogCallback({
      onSuccess: () => {
        success()
      },
      onFailure: (error:string) => {
        failure(error);
      }
    });
    this.getAdapter().emailLog(email, app.android.foregroundActivity, callback);
  }

  public static destroyLog(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    let callback = new TSCallback({
      onSuccess: () => {
        success();
      },
      onFailure: (error:string) => {
        failure(error);
      }
    });
    this.getAdapter().destroyLog(callback);
  }

  public static getSensors(success:Function, failure?:Function) {
    failure = failure || emptyFn;
    let sensors = TSSensors.getInstance(app.android.context);
    let result = {
      "platform": "android",
      "accelerometer": sensors.hasAccelerometer(),
      "magnetometer": sensors.hasMagnetometer(),
      "gyroscope": sensors.hasGyroscope(),
      "significant_motion": sensors.hasSignificantMotion()
    };
    success(result);
  }

  public static isPowerSaveMode(success: Function, failure?:Function) {
    let isPowerSaveMode = this.getAdapter().isPowerSaveMode().booleanValue();
    success(isPowerSaveMode);
  }

  public static startBackgroundTask(success:Function) {
    // Just return 0 for compatibility with iOS API.  Android has no concept of these iOS-only background-tasks.
    success(0);
  }

  public static finish(taskId:number) {
    // Just an empty function for compatibility with iOS.  Android has no concept of these iOS-only background-tasks.
  }

  public static playSound(soundId) {
    com.transistorsoft.locationmanager.adapter.BackgroundGeolocation.startTone(soundId);
  }

  /**
  * Private
  */
  private static setEnabled(value: boolean, success:Function, failure:Function) {
    var adapter = this.getAdapter();
    if (value) {
      let callback = new TSCallback({
        onSuccess: () => {
          success(JSON.parse(adapter.getState().toString()));
        },
        onFailure: (error:string) => {
          failure(error);
        }
      });
      adapter.start(callback);
    }
  }

  private static createLocationCallback(success:Function, failure?:Function) {
    failure = failure || emptyFn;
    return new TSLocationCallback({
      onLocation: (tsLocation:any) => {
        success(JSON.parse(tsLocation.toJson().toString()));
      },
      onError: (error) => {
        failure(error);
      }
    });
  }

  private static createMotionChangeCallback(callback:Function) {
    return new TSLocationCallback({
      onLocation: (tsLocation:any) => {
        let isMoving = tsLocation.getIsMoving().booleanValue();
        callback(isMoving, JSON.parse(tsLocation.toJson().toString()));
      },
      onError: (error:number) => {

      }
    });
  }

  private static createHttpCallback(success:Function, failure?:Function) {
    return new TSHttpResponseCallback({
      onHttpResponse: function(response:any) {
        let params = {
          status: response.status,
          responseText: response.responseText
        };
        if (response.isSuccess()) {
          success(params);
        } else {
          failure(params);
        }
      }
    });
  } 

  private static createActivityChangeCallback(callback:Function) {
    return new TSActivityChangeCallback({
      onActivityChange: (event:any) => {
        callback(JSON.parse(event.toJson().toString()));
      }
    });
  }

  private static createGeofenceCallback(callback:Function) {
    return new TSGeofenceCallback({
      onGeofence: (event:any) => {
        callback(JSON.parse(event.toJson().toString()));
      }
    });
  }

  private static createGeofencesChangeCallback(callback:Function) {
    return new TSGeofencesChangeCallback({
      onGeofencesChange: (event:any) => {
        callback(JSON.parse(event.toJson().toString()));
      }
    });
  }

  private static createScheduleCallback(callback:Function) {
    return new TSScheduleCallback({
      onSchedule: (event:any) => {
        callback(JSON.parse(event.toJson().toString()));
      }
    })
  }

  private static createProviderChangeCallback(callback:Function) {
    return new TSLocationProviderChangeCallback({
      onLocationProviderChange: (event:any) => {
        callback(JSON.parse(event.toJson().toString()));
      }
    })
  }

  private static createHeartbeatCallback(callback:Function) {
    return new TSHeartbeatCallback({
      onHeartbeat: (event:any) => {
        callback(JSON.parse(event.toJson().toString()));
      }
    })
  }

  private static createPowerSaveChangeCallback(callback:Function) {
    return new TSPowerSaveChangeCallback({
      onPowerSaveChange: (isPowerSaveMode) => {
        callback(isPowerSaveMode.booleanValue());
      }
    });
  }

  private static init() {
    this.intent = app.android.startActivity.getIntent();

    // Handle Google Play Services errors
    this.getAdapter().onPlayServicesConnectError(new TSPlayServicesConnectErrorCallback({
      onPlayServicesConnectError: (errorCode:number) => {
        this.handleGooglePlayServicesConnectError(errorCode);
      }
    }));
    this.logger = new Logger(com.transistorsoft.locationmanager.logger.TSLog);
  }

  protected static getIntent() {
    let activity = (app.android.foregroundActivity) ? app.android.foregroundActivity : app.android.startActivity;
    return (activity) ? activity.getIntent() : this.intent;
  }

  protected static getAdapter(): any {
    if (!this.intent) {
      this.init();
    }
    return com.transistorsoft.locationmanager.adapter.BackgroundGeolocation.getInstance(app.android.context, this.getIntent());
  }

  private static handleGooglePlayServicesConnectError(errorCode:number) {
    com.google.android.gms.common.GoogleApiAvailability.getInstance().getErrorDialog(app.android.foregroundActivity, errorCode, 1001).show();
  }

  private static hasPermission() {
    var result = android.os.Build.VERSION.SDK_INT < 23;
    if (!result) {
        result = (
          (permissions.hasPermission((<any>android).Manifest.permission.ACCESS_FINE_LOCATION))
          && (permissions.hasPermission((<any>android).Manifest.permission.ACCESS_COARSE_LOCATION))
        );
    }
    return result;
  }  

  private static requestPermission(success: Function, failure: Function) {
    permissions.requestPermission((<any>android).Manifest.permission.ACCESS_FINE_LOCATION, "Background tracking required").then(success).catch(failure);
  }

}
