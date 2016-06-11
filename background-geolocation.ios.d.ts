import { AbstractBackgroundGeolocation } from './background-geolocation.common';
export declare class BackgroundGeolocation extends AbstractBackgroundGeolocation {
    constructor();
    configure(config: any): any;
    on(event: any, callback: any): void;
    changePace(value: boolean): void;
    start(success: any, failure: any): void;
    stop(success: any, failure: any): void;
    startSchedule(success: any, failure: any): void;
    stopSchedule(success: any, failure: any): void;
    resetOdometer(success: any): void;
    sync(success: Function, failure: any): void;
    getCurrentPosition(success: Function, failure: any, options: any): void;
    getCount(success: Function): void;
    private onLocation(location, type, isMoving);
    private onMotionChange(location, isMoving);
    private onActivityChange(activityName);
    private onHttp(statusCode, requestData, responseData, error);
    private onError(type, error);
    private onHeartbeat(shakeCount, motionType, location);
    private onSyncComplete(locations);
    private onSchedule(schedule);
    private locationToObject(location);
}
