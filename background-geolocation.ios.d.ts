import { AbstractBackgroundGeolocation } from './background-geolocation.common';
export declare class BackgroundGeolocation extends AbstractBackgroundGeolocation {
    private static syncTaskId;
    /**
    * Configuration Methods
    */
    static on(event: any, success?: Function, failure?: Function): void;
    static removeListeners(): void;
    static configure(config: Object, success?: Function, failure?: Function): void;
    static setConfig(config: Object, success?: any, failure?: any): void;
    static getState(success: Function): void;
    /**
    * Tracking Methods
    */
    static start(success?: Function, failure?: Function): void;
    static stop(success?: Function, failure?: Function): void;
    static changePace(value: boolean, success?: any, failure?: any): void;
    static startSchedule(success?: Function, failure?: Function): void;
    static stopSchedule(success?: Function, failure?: Function): void;
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
    static insertLocation(data: any, success?: Function, failure?: Function): any;
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
    static startBackgroundTask(success: Function): void;
    static finish(taskId: number): void;
    /**
    * Logging & Debug methods
    */
    static playSound(soundId: number): void;
    static getLog(success: Function, failure?: Function): void;
    static destroyLog(success?: Function, failure?: Function): void;
    static emailLog(email: string): void;
    /**
    * Private
    */
    private static onLocation(location, type, isMoving);
    private static onMotionChange(location, isMoving);
    private static onGeofence(ev);
    private static onHttp(statusCode, requestData, responseData, error);
    private static onError(type, error);
    private static onHeartbeat(motionType, location);
    private static onSyncComplete(locations);
    private static onActivityChange(activityName);
    private static onProviderChange(status);
    private static onSchedule(schedule);
    private static getAdapter();
    private static getLocationManager();
    private static getJsObjectFromNSDictionary(dictionary);
    private static getJsArrayFromNSArray(array);
    private static getJsObject(object);
}
