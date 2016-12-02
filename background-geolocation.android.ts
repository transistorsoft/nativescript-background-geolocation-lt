import {AbstractBackgroundGeolocation} from './background-geolocation.common';

var permissions = require("nativescript-permissions");

import app = require('application');

declare var com: any;

let Callback = com.transistorsoft.locationmanager.adapter.TSCallback;
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
	private static mConfig: any;
	private static requestAction: number;
	private static isStarting = false;
	private static startCallback = null;
	private static backgroundServiceIntent: any;
	private static isEnabled: boolean;
	private static forceReload: boolean;
  private static intent: android.content.Intent;
  private static timer: any;

  public static onActivityDestroyed(args) {
    this.getAdapter().onActivityDestroy();
    this.intent = null;
  }

  public static on(event:any, success?:Function, failure?:Function) {
    if (typeof(event) === 'object') {
      for (var key in event) {
        this.on(key, event[key]);
      }
      return;
    }
    if (this.events.indexOf(event) < 0) {
      throw "Invalid event: " + event;
    }
    failure = failure || emptyFn;
    var cb;
    switch (event) {
      case 'motionchange':
        cb = this.createMotionChangeCallback(success);
        break;
      case 'activitychange':
        cb = this.createActivityChangeCallback(success);
        break;
      case 'http':
        cb = this.createHttpCallback(success, failure);
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

  /**
  * Configuration Methods
  */
  public static configure(config:Object, success?:Function, failure?:Function) {
    var callback = new Callback({
      success: function(state:org.json.JSONObject) {
        success(JSON.parse(state.toString()));
      }.bind(this),
      error: function(error:android.os.Bundle) {
        failure(error);
      }.bind(this)
    });

    this.getAdapter().configure(new org.json.JSONObject(JSON.stringify(config)), callback);

  }

  public static setConfig(config:Object, success?:Function, failure?:Function) {
    success = success || emptyFn;
    var callback = new Callback({
      success: function(state:org.json.JSONObject) {
        success(JSON.parse(state.toString()));
      },
      error: failure || emptyFn
    });
    this.getAdapter().setConfig(new org.json.JSONObject(JSON.stringify(config)), callback);
  }

  public static getState(success:Function) {
    var callback = new Callback({
      success: function(state:org.json.JSONObject) {
        success(JSON.parse(state.toString()));
      },
      error: emptyFn
    });
    this.getAdapter().getState(callback);
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
      this.requestPermission(function() {
        this.setEnabled(true, success, failure);
      }.bind(this), function() {
        console.log('- requestPermission failure');
      }.bind(this));
    }
	}

  public static stop(success?:Function, failure?:Function) {
    success = success || emptyFn;
    this.getAdapter().stop(new Callback({
      success: function(state: org.json.JSONObject) {
        success(JSON.parse(state.toString()));
      },
      error: failure || emptyFn
    }));
  }

  public static changePace(value: boolean, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;

    var cb = new Callback({
      success: function(location:org.json.JSONObject) {
        success(JSON.parse(location.toString()));
      },
      error: failure
    });
    this.getAdapter().changePace(value, cb);
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

  public static getCurrentPosition(success: Function, failure?:Function, options?:Object) {
    failure = failure || emptyFn;
    var callback = new Callback({
      success: function(location:org.json.JSONObject) {
        success(JSON.parse(location.toString()));
      },
      error: function(error:string) {
        failure(error);
      }
    });
    this.getAdapter().getCurrentPosition(new org.json.JSONObject(JSON.stringify(options)), callback);
  }
  public static watchPosition(success:Function, failure?:Function, options?:Object) {
    failure = failure || emptyFn;
    options = options || {};
    var callback = new Callback({
      success: function(location:org.json.JSONObject) {
        success(JSON.parse(location.toString()));
      },
      error: function(error: string) {
        failure(error);
      }
    });
    this.getAdapter().watchPosition(new org.json.JSONObject(JSON.stringify(options)), callback);
  }
  public static stopWatchPosition(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    var callback = new Callback({
      success: function(result:string) {
        success(result);
      },
      error: function(error: string) {
        failure(error);
      }
    });
    this.getAdapter().stopWatchPosition(callback);
  }

  public static getOdometer(success:Function, failure?:Function) {
    success(this.getAdapter().getOdometer());
  }

  public static setOdometer(value:any, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    var callback = new Callback({
      success: function(location:any) {
        success(JSON.parse(location.toString()));
      },
      failure: function(error:number) {
        failure(error);
      }
    });
    this.getAdapter().setOdometer(new java.lang.Float(value), callback);
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
    var callback = new Callback({
      success: function(rs:org.json.JSONArray) {
        success(JSON.parse(rs.toString()));
      },
      error: function(error:string) {
        failure(error);
      }
    });
    this.getAdapter().sync(callback);
  }


  public static getLocations(success:Function, failure?:Function) {
    failure = failure || emptyFn;
    var callback = new Callback({
      success: function(rs:org.json.JSONArray) {
        success(JSON.parse(rs.toString()));
      },
      error: function(error:string) {
        failure(error);
      }
    });
    this.getAdapter().getLocations(callback);
  }

  public static getCount(success:Function) {
    var callback = new Callback({
      success: function(count:number) {
        success(count);
      },
      error: function(error:string) {}
    });
    this.getAdapter().getCount(callback);
  }

  public static insertLocation(data:any, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    var callback = new Callback({
      success: function(uuid:string) {
        success(uuid);
      },
      error: function(error: string) {
        failure(error);
      }
    });
    this.getAdapter().insertLocation(new org.json.JSONObject(JSON.stringify(data)), callback);
  }

  // @deprecated
  public static clearDatabase(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    this.destroyLocations(success, failure);
  }

  public static destroyLocations(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    var callback = new Callback({
      success: function(result:string) {
        success(result);
      },
      error: function(error:string) {
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

    var callback = new Callback({
      success: function(result:string) {
        success(result);
      },
      error: function(error:string) {
        failure(error);
      }
    });
    this.getAdapter().addGeofence(new org.json.JSONObject(JSON.stringify(params)), callback);
  }

  public static removeGeofence(identifier:string, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;

    var callback = new Callback({
      success: function(result:string) {
        success(result);
      },
      error: function(error:string) {
        failure(error);
      }
    });
    this.getAdapter().removeGeofence(identifier, callback);
  }

  public static addGeofences(geofences:Array<Object>, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    var callback = new Callback({
      success: function(result:string) {
        success(result);
      },
      error: function(error:string) {
        failure(error);
      }
    });
    this.getAdapter().addGeofences(new org.json.JSONArray(JSON.stringify(geofences)), callback);
  }

  public static removeGeofences(geofences?:Array<string>, success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    var callback = new Callback({
      success: function(result:string) {
        success(result);
      },
      error: function(error:string) {
        failure(error);
      }
    });
    geofences = geofences || [];
    this.getAdapter().removeGeofences(new org.json.JSONArray(JSON.stringify(geofences)), callback);
  }

  public static getGeofences(success:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    var callback = new Callback({
      success: function(rs:org.json.JSONArray) {
        success(JSON.parse(rs.toString()));
      },
      error: function(error:string) {
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
    var callback = new Callback({
      success: function(log:string) {
        success(log)
      },
      error: function(error:string) {
        failure(error);
      }
    });
    this.getAdapter().getLog(callback);
  }

  public static destroyLog(success?:Function, failure?:Function) {
    success = success || emptyFn;
    failure = failure || emptyFn;
    var callback = new Callback({
      success: function(response:string) {
        success(response);
      },
      error: function(error:string) {
        failure(error);
      }
    });
    this.getAdapter().destroyLog(callback);
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
      var me = this;
      var callback = new Callback({
        success: success,
        error: failure
      });
      adapter.start(callback);
    }
  }


  private static createHttpCallback(success:Function, failure?:Function) {
    failure = failure || emptyFn;
    return new Callback({
      success: function(response) {
        success(JSON.parse(response.toString()));
      },
      error: function(response) {
        success(JSON.parse(response.toString()));
      }
    });
  }
  private static createMotionChangeCallback(callback:Function) {
    return new Callback({
      success: function(params: org.json.JSONObject) {
        var location = params.getJSONObject("location");
        var moving = params.getBoolean("isMoving");
        callback(moving, JSON.parse(location.toString()));
      },
      error: function(error){}
    });
  }
  private static createActivityChangeCallback(callback:Function) {
    return new Callback({
      success: function(activityName: string) {
        callback(activityName);
      },
      error: function(error){}
    });
  }

  private static onGooglePlayServicesConnectError(errorCode:number) {
    com.google.android.gms.common.GoogleApiAvailability.GoogleApiAvailability.getInstance().getErrorDialog(app.android.foregroundActivity, errorCode, 1001).show();
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

  private static init() {
    this.intent = app.android.foregroundActivity.getIntent();
    this.getAdapter().on("playservicesconnecterror", new Callback({
      success: this.onGooglePlayServicesConnectError.bind(this),
      error: emptyFn
    }));
  }

  private static getAdapter(): any {
    if (!this.intent) {
      this.init();
    }
    return com.transistorsoft.locationmanager.adapter.BackgroundGeolocation.getInstance(app.android.context, this.intent);
  }

  private static requestPermission(success: Function, failure: Function) {
    permissions.requestPermission((<any>android).Manifest.permission.ACCESS_FINE_LOCATION, "Background tracking required").then(success).catch(failure);
  }

}
