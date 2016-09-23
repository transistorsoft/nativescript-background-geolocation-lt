
import {ObservableArray} from "data/observable-array";
import { EventData, Observable } from "data/observable";

import Platform = require('platform');

import * as Settings from "application-settings";

const SETTINGS = {
  COMMON: [
    {name: 'url', group: 'http', inputType: 'text', dataType: 'string', values: [], defaultValue: 'http://posttestserver.com/post.php?dir=ionic-cordova-background-geolocation'},
    {name: 'method', group: 'http', inputType: 'select', dataType: 'string', values: ['POST', 'PUT'], defaultValue: 'POST'},
    {name: 'autoSync', group: 'http', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: true},
    {name: 'autoSyncThreshold', group: 'http', dataType: 'integer', inputType: 'select', values: [0, 5, 10, 25, 50, 100], defaultValue: 0},
    {name: 'batchSync', group: 'http', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: false},
    {name: 'maxBatchSize', group: 'http', dataType: 'integer', inputType: 'select', values: [-1, 5, 10, 25, 50, 100], defaultValue: 50},
    {name: 'stopOnTerminate', group: 'application', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: true},
    {name: 'startOnBoot', group: 'application', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: false},
    {name: 'stopTimeout', group: 'activity_recognition', dataType: 'integer', inputType: 'select', values: [0, 1, 2, 5, 10, 15], defaultValue: 1},
    {name: 'activityRecognitionInterval', group: 'activity_recognition', dataType: 'integer', inputType: 'select', values: [0, 1000, 10000, 30000, 60000], defaultValue: 10000},
    {name: 'debug', group: 'application', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: true},
    {name: 'deferTime', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 10*1000, 30*1000, 60*1000, 10*60*1000], defaultValue: 0},
    {name: 'disableElasticity', group: 'geolocation', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: false},
    {name: 'heartbeatInterval', group: 'application', dataType: 'integer', inputType: 'select', values: [-1, 10, 30, 60, (2*60), (15*60)], defaultValue: 60},
    {name: 'locationTimeout', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 5, 10, 30, 60], defaultValue: 60},
  ],
  IOS: [
    {name: 'desiredAccuracy', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [-1, 0, 10, 100, 1000], defaultValue: 0 },
    {name: 'distanceFilter', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 10, 20, 50, 100, 500, 1000], defaultValue: 20 },
    {name: 'stationaryRadius', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 20, 50, 100, 500], defaultValue: 20 },
    {name: 'activityType', group: 'geolocation', dataType: 'string', inputType: 'select', values: ['Other', 'AutomotiveNavigation', 'Fitness', 'OtherNavigation'], defaultValue: 'OtherNavigation'},
    {name: 'stopDetectionDelay', group: 'activity_recognition', dataType: 'integer', inputType: 'select', values: [0, 1, 2, 5], defaultValue: 0},
    {name: 'preventSuspend', group: 'application', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: false},
    {name: 'pausesLocationUpdatesAutomatically', group: 'geolocation', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: undefined},
    {name: 'useSignificantChangesOnly', group: 'geolocation', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: false},
    {name: 'disableMotionActivityUpdates', group: 'activity_recognition', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: false}
  ],
  ANDROID: [
    {name: 'desiredAccuracy', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 10, 100, 1000], defaultValue: 0 },
    {name: 'distanceFilter', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 10, 20, 50, 100, 500], defaultValue: 20 },
    {name: 'locationUpdateInterval', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 1000, 5000, 10000, 30000, 60000], defaultValue: 5000},
    {name: 'fastestLocationUpdateInterval', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 1000, 5000, 10000, 30000, 60000], defaultValue: 1000},
    {name: 'triggerActivities', group: 'activity_recognition', dataType: 'string', inputType: 'multiselect', values: ['in_vehicle', 'on_bicycle', 'on_foot', 'running', 'walking'], defaultValue: 'in_vehicle, on_bicycle, running, walking, on_foot'},
    {name: 'forceReloadOnBoot', group: 'application', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: false},
    {name: 'forceReloadOnMotionChange', group: 'application', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: false},
    {name: 'forceReloadOnLocationChange', group: 'application', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: false},
    {name: 'forceReloadOnGeofence', group: 'application', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: false},
    {name: 'forceReloadOnHeartbeat', group: 'application', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: false},
    {name: 'foregroundService', group: 'application', dataType: 'boolean', inputType: 'select', values: [true, false], defaultValue: true}
  ]
}

// Platform-specific settings
var platformSettings = SETTINGS[Platform.device.os.toUpperCase()].concat(SETTINGS.COMMON);

export class SettingsViewModel extends Observable {
  private _config: any;

  private static _settings = [
    {name: 'desiredAccuracy'},
    {name: 'distanceFilter'},
    {name: 'locationUpdateInterval'},
    {name: 'defer'}
  ];

  public static getDefaultConfig(overrides={}) {
    var config = {};
    platformSettings.forEach(function(setting) {
      config[setting.name] = setting.defaultValue;
    });
    return Object.assign(config, overrides);
  }

  public static getSettingsByGroup(group:string) {
    var items = new ObservableArray();
    platformSettings.forEach(function(setting) {
      if (setting.group === group) {
        items.push(new Observable({
          name: setting.name,
          dataType: setting.dataType,
          group: setting.group,
          inputType: setting.inputType,
          values: setting.values,
          value: setting.defaultValue,
          displayValue: setting.defaultValue,
          defaultValue: setting.defaultValue
        }));
      };
    });
    return items;
  }

  public onClickSync(event) {
    console.log('-- onClickSync');

  }
  constructor() {
  	super();
    if (Settings.hasKey("config")) {
      this._config = JSON.parse(Settings.getString("config"));
    } else {
      this._config = {};
    }

  }

  public settings(group) {
    var settings = SettingsViewModel.getSettingsByGroup(group);
    var setting;
    var config = this._config;
    settings.forEach(function(setting:Observable) {
      if (config.hasOwnProperty(setting.get('name'))) {
        setting.set('value', config[setting.get('name')]);
        setting.set('displayValue', setting.value);
      }
      if (setting.inputType === 'multiselect') {
        if (setting.value.replace(/\s/g,'').split(',').length === setting.values.length) {
          setting.set('displayValue', 'ALL');
        }
      }
    });
    return settings;
  }
}
