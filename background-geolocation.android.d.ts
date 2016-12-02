import { AbstractBackgroundGeolocation } from './background-geolocation.common';
export declare class BackgroundGeolocation extends AbstractBackgroundGeolocation {
    private static mConfig;
    private static requestAction;
    private static isStarting;
    private static startCallback;
    private static backgroundServiceIntent;
    private static isEnabled;
    private static forceReload;
    private static intent;
    private static timer;
    static onActivityDestroyed(args: any): void;
    static on(event: any, success?: Function, failure?: Function): void;
    /**
    * Configuration Methods
    */
    static configure(config: Object, success?: Function, failure?: Function): void;
    static setConfig(config: Object, success?: Function, failure?: Function): void;
    static getState(success: Function): void;
    /**
    * Tracking Methods
    */
    static start(success?: Function, failure?: Function): void;
    static stop(success?: Function, failure?: Function): void;
    static changePace(value: boolean, success?: Function, failure?: Function): void;
    static startSchedule(success?: Function, failure?: Function): void;
    static stopSchedule(success?: Function, failure?: Function): void;
    static getCurrentPosition(success: Function, failure?: Function, options?: Object): void;
    static watchPosition(success: Function, failure?: Function, options?: Object): void;
    static stopWatchPosition(success?: Function, failure?: Function): void;
    static getOdometer(success: Function, failure?: Function): void;
    static setOdometer(value: any, success?: Function, failure?: Function): void;
    static resetOdometer(success?: Function, failure?: Function): void;
    /**
    * HTTP & Persistence Methods
    */
    static sync(success?: Function, failure?: Function): void;
    static getLocations(success: Function, failure?: Function): void;
    static getCount(success: Function): void;
    static insertLocation(data: any, success?: Function, failure?: Function): void;
    static clearDatabase(success?: Function, failure?: Function): void;
    static destroyLocations(success?: Function, failure?: Function): void;
    /**
    * Geofencing Methods
    */
    static addGeofence(params: any, success?: Function, failure?: Function): void;
    static removeGeofence(identifier: string, success?: Function, failure?: Function): void;
    static addGeofences(geofences: Array<Object>, success?: Function, failure?: Function): void;
    static removeGeofences(geofences?: Array<string>, success?: Function, failure?: Function): void;
    static getGeofences(success: Function, failure?: Function): void;
    /**
    * Logging & Debug methods
    */
    static getLog(success: Function, failure?: Function): void;
    static destroyLog(success?: Function, failure?: Function): void;
    static playSound(soundId: any): void;
    /**
    * Private
    */
    private static setEnabled(value, success, failure);
    private static createHttpCallback(success, failure?);
    private static createMotionChangeCallback(callback);
    private static createActivityChangeCallback(callback);
    private static onGooglePlayServicesConnectError(errorCode);
    private static hasPermission();
    private static init();
    private static getAdapter();
    private static requestPermission(success, failure);
}
