/**
* Logger
*/
export declare class Logger {
    private api;
    constructor(api: any);
    error(msg: string): void;
    warn(msg: string): void;
    debug(msg: string): void;
    notice(msg: string): void;
    header(msg: string): void;
    on(msg: string): void;
    off(msg: string): void;
    ok(msg: string): void;
    private log;
}
/**
* BackgroundGeolocation
*/
export declare class BackgroundGeolocation {
    private static api;
    static logger: Logger;
    static LOG_LEVEL_OFF: number;
    static LOG_LEVEL_ERROR: number;
    static LOG_LEVEL_WARNING: number;
    static LOG_LEVEL_INFO: number;
    static LOG_LEVEL_DEBUG: number;
    static LOG_LEVEL_VERBOSE: number;
    static DESIRED_ACCURACY_NAVIGATION: number;
    static DESIRED_ACCURACY_HIGH: number;
    static DESIRED_ACCURACY_MEDIUM: number;
    static DESIRED_ACCURACY_LOW: number;
    static DESIRED_ACCURACY_VERY_LOW: number;
    static DESIRED_ACCURACY_LOWEST: number;
    static AUTHORIZATION_STATUS_NOT_DETERMINED: number;
    static AUTHORIZATION_STATUS_RESTRICTED: number;
    static AUTHORIZATION_STATUS_DENIED: number;
    static AUTHORIZATION_STATUS_ALWAYS: number;
    static AUTHORIZATION_STATUS_WHEN_IN_USE: number;
    static NOTIFICATION_PRIORITY_DEFAULT: number;
    static NOTIFICATION_PRIORITY_HIGH: number;
    static NOTIFICATION_PRIORITY_LOW: number;
    static NOTIFICATION_PRIORITY_MAX: number;
    static NOTIFICATION_PRIORITY_MIN: number;
    static mountNativeApi(api: any): void;
    static EVENTS: String[];
    private static listeners;
    private static headlessTask;
    static registerHeadlessTask(callback: Function): void;
    static invokeHeadlessTask(event: any, completionHandler: Function): void;
    /**
    * Core Plugin Control Methods
    */
    static ready(config: any, success?: Function, failure?: Function): any;
    /**
    * Reset plugin confg to default
    */
    static reset(config?: any, success?: Function, failure?: Function): any;
    /**
    * Perform initial configuration of plugin.  Reset config to default before applying supplied configuration
    */
    static configure(config: any, success?: Function, failure?: Function): any;
    /**
    * Listen to a plugin event
    */
    static addListener(event: string, success: Function, failure?: Function): void;
    private static registerCallback;
    static on(event: string, success: Function, failure?: Function): void;
    /**
    * Remove a single plugin event-listener, supplying a reference to the handler initially supplied to #un
    */
    static removeListener(event: string, clientCallback: Function, success?: Function, failure?: Function): any;
    static un(event: string, handler: Function, success?: Function, failiure?: Function): void;
    /**
    * Remove all event listeners
    */
    static removeListeners(event?: any, success?: Function, failure?: Function): any;
    /**
    * Fetch current plugin configuration
    */
    static getState(success?: Function, failure?: Function): any;
    /**
    * Start the plugin
    */
    static start(success?: Function, failure?: Function): any;
    /**
    * Stop the plugin
    */
    static stop(success?: Function, failure?: Function): any;
    /**
    * Start the scheduler
    */
    static startSchedule(success?: Function, failure?: Function): any;
    /**
    * Stop the scheduler
    */
    static stopSchedule(success?: Function, failure?: Function): any;
    /**
    * Initiate geofences-only mode
    */
    static startGeofences(success?: Function, failure?: Function): any;
    /**
    * Start an iOS background-task, provding 180s of background running time
    */
    static startBackgroundTask(success?: Function, failure?: Function): any;
    /**
    * Signal to iOS that your background-task from #startBackgroundTask is complete
    */
    static finish(taskId: number, success?: Function, failure?: Function): any;
    /**
    * Toggle motion-state between stationary <-> moving
    */
    static changePace(isMoving: boolean, success?: Function, failure?: Function): any;
    /**
    * Provide new configuration to the plugin.  This configuration will be *merged* to current configuration
    */
    static setConfig(config: any, success?: Function, failure?: Function): any;
    /**
    * HTTP & Persistence
    *
    */
    static getLocations(success?: Function, failure?: Function): any;
    /**
    * Fetch the current count of location records in database
    */
    static getCount(success?: Function, failure?: Function): any;
    /**
    * Destroy all records in locations database
    */
    static destroyLocations(success?: Function, failure?: Function): any;
    static clearDatabase(success?: Function, failure?: Function): any;
    /**
    * Insert a single record into locations database
    */
    static insertLocation(location: any, success?: Function, failure?: Function): any;
    /**
    * Manually initiate an HTTP sync operation
    */
    static sync(success?: Function, failure?: Function): any;
    /**
    * Fetch the current value of odometer
    */
    static getOdometer(success?: Function, failure?: Function): any;
    /**
    * Set the value of the odometer
    */
    static setOdometer(value: number, success?: Function, failure?: Function): any;
    /**
    * Reset the value of odometer to 0
    */
    static resetOdometer(success?: Function, failure?: Function): any;
    /**
    * Geofencing Methods
    */
    /**
    * Add a single geofence
    */
    static addGeofence(config: any, success?: Function, failure?: Function): any;
    /**
    * Remove a single geofence by identifier
    */
    static removeGeofence(identifier: string, success?: Function, failure?: Function): any;
    /**
    * Add a list of geofences
    */
    static addGeofences(geofences: any, success?: Function, failure?: Function): any;
    /**
    * Remove geofences.  You may either supply an array of identifiers or nothing to destroy all geofences.
    * 1. removeGeofences() <-- Promise
    * 2. removeGeofences(['foo'])  <-- Promise
    *
    * 3. removeGeofences(success, [failure])
    * 4. removeGeofences(['foo'], success, [failure])
    */
    static removeGeofences(success?: Function, failure?: Function): any;
    /**
    * Fetch all geofences from database
    */
    static getGeofences(success?: Function, failure?: Function): any;
    /**
    * Fetch the current position from location-services
    */
    static getCurrentPosition(success: any, failure?: any, options?: any): any;
    /**
    * Begin watching a stream of locations
    */
    static watchPosition(success: Function, failure?: Function, options?: any): void;
    /**
    * Stop watching location
    */
    static stopWatchPosition(success?: Function, failure?: Function): any;
    /**
    * Set the logLevel.  This is just a helper method for setConfig({logLevel: level})
    */
    static setLogLevel(value: number, success?: Function, failure?: Function): any;
    /**
    * Fetch the entire contents of log database returned as a String
    */
    static getLog(success?: Function, failure?: Function): any;
    /**
    * Destroy all contents of log database
    */
    static destroyLog(success?: Function, failure?: Function): any;
    /**
    * Open deafult email client on device to email the contents of log database attached as a compressed file attachement
    */
    static emailLog(email: string, success?: Function, failure?: Function): any;
    /**
    * Has device OS initiated power-saving mode?
    */
    static isPowerSaveMode(success?: Function, failure?: Function): any;
    /**
    * Fetch the state of this device's available motion-sensors
    */
    static getSensors(success?: Function, failure?: Function): any;
    /**
    * Play a system sound via the plugin's Sound API
    */
    static playSound(soundId: number, success?: Function, failure?: Function): any;
    private static validate;
}
