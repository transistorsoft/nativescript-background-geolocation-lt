import { AbstractBackgroundGeolocation } from './background-geolocation.common';
export declare class BackgroundGeolocation extends AbstractBackgroundGeolocation {
    constructor();
    configure(config: any): any;
    changePace(value: boolean): void;
    on(event: any, callback: any, scope: any): void;
    start(): void;
    stop(): void;
    private onLocation(location, type, isMoving);
    private onMotionChange(location, isMoving);
    private onHttp(statusCode, requestData, responseData, error);
    private toObject(location);
}
