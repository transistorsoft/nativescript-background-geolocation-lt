import { AbstractBackgroundGeolocation } from './background-geolocation.common';
export declare class BackgroundGeolocation extends AbstractBackgroundGeolocation {
    private static forceReload;
    private static intent;
    static onActivityDestroyed(args: any): void;
    static addListener(event: any, success?: Function, failure?: Function): void;
    protected static removeNativeListener(event: string, callback: Function): void;
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
    static startGeofences(success?: Function, failure?: Function): void;
    static getCurrentPosition(success: Function, failure?: Function, options?: Object): void;
    static watchPosition(success: Function, failure?: Function, options?: Object): void;
    static stopWatchPosition(success?: Function, failure?: Function): void;
    static getOdometer(success: Function, failure?: Function): void;
    static setOdometer(value: number, success?: Function, failure?: Function): void;
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
    static addGeofences(geofences?: Array<Object>, success?: Function, failure?: Function): void;
    static removeGeofences(geofences?: Array<string>, success?: Function, failure?: Function): void;
    static getGeofences(success: Function, failure?: Function): void;
    /**
    * Logging & Debug methods
    */
    static getLog(success: Function, failure?: Function): void;
    static emailLog(email: string, success?: Function, failure?: Function): void;
    static destroyLog(success?: Function, failure?: Function): void;
    static getSensors(success: Function, failure?: Function): void;
    static isPowerSaveMode(success: Function, failure?: Function): void;
    static startBackgroundTask(success: Function): void;
    static finish(taskId: number): void;
    static playSound(soundId: any): void;
    /**
    * Private
    */
    private static setEnabled(value, success, failure);
    private static createLocationCallback(success, failure?);
    private static createMotionChangeCallback(callback);
    private static createHttpCallback(success, failure?);
    private static createActivityChangeCallback(callback);
    private static createGeofenceCallback(callback);
    private static createGeofencesChangeCallback(callback);
    private static createScheduleCallback(callback);
    private static createProviderChangeCallback(callback);
    private static createHeartbeatCallback(callback);
    private static createPowerSaveChangeCallback(callback);
    private static init();
    protected static getAdapter(): any;
    private static handleGooglePlayServicesConnectError(errorCode);
    private static hasPermission();
    private static requestPermission(success, failure);
}
