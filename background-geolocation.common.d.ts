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
    protected static currentPositionCallbacks: any[];
    protected static watchPositionCallbacks: any[];
    protected static syncCallback: any;
    protected static locationManager: any;
    protected static state: any;
    protected static enabled: boolean;
    protected static isMoving: boolean;
    protected static emptyFn: any;
}
