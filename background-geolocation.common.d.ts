export declare class Logger {
    private adapter;
    constructor(adapter: any);
    error(msg: string): void;
    warn(msg: string): void;
    debug(msg: string): void;
    notice(msg: string): void;
    header(msg: string): void;
    on(msg: string): void;
    off(msg: string): void;
    ok(msg: string): void;
    private log(level, msg);
}
export declare class AbstractBackgroundGeolocation {
    protected static listeners: {
        location: any[];
        http: any[];
        motionchange: any[];
        error: any[];
        heartbeat: any[];
        schedule: any[];
        activitychange: any[];
        providerchange: any[];
        geofence: any[];
        geofenceschange: any[];
        powersavechange: any[];
    };
    protected static events: string[];
    static LOG_LEVEL_OFF: number;
    static LOG_LEVEL_ERROR: number;
    static LOG_LEVEL_WARNING: number;
    static LOG_LEVEL_INFO: number;
    static LOG_LEVEL_DEBUG: number;
    static LOG_LEVEL_VERBOSE: number;
    static DESIRED_ACCURACY_HIGH: number;
    static DESIRED_ACCURACY_MEDIUM: number;
    static DESIRED_ACCURACY_LOW: number;
    static DESIRED_ACCURACY_VERY_LOW: number;
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
    static logger: Logger;
    protected static adapter: any;
    protected static state: any;
    protected static enabled: boolean;
    protected static isMoving: boolean;
    protected static emptyFn: any;
    /**
    * @abstract
    */
    static addListener(event: string, success: Function, failure?: Function): void;
    static on(event: string, success: Function, failure?: Function): void;
    static removeListener(event: string, clientCallback: Function): void;
    /**
    * @abstract
    */
    protected static removeNativeListener(event: string, callback: Function): void;
    /**
    * @alias #removeListener
    */
    static un(event: string, clientCallback: Function): void;
    static removeListeners(event?: string): void;
    /**
    * @abstract
    */
    protected static getAdapter(): any;
    protected static registerCallback(event: string, clientCallback: Function, nativeCallback: Function): void;
    /**
    * @abstract
    */
    static removeGeofences(geofences: Array<string>, success?: Function, failure?: Function): void;
    static removeAllGeofences(success?: Function, failure?: Function): void;
}
