import observable = require("data/observable");
import {BackgroundGeolocation} from "nativescript-background-geolocation-lt";

require("globals");

export class HelloWorldModel extends observable.Observable {

    private _counter: number;
    private _message: string;
    private _bgGeo: BackgroundGeolocation;
    private _state: any;
    private _enabled: boolean;
    private _isMoving: boolean;
    private _locationData: string = "DEFAULT";
    private _emptyFn: Function;

    get message(): string {
        return this._message;
    }
    set message(value: string) {
        if (this._message !== value) {
            this._message = value;
            this.notifyPropertyChange("message", value)
        }
    }
    get isMoving(): boolean {
        console.log('---------------- get isMoving() -------------------');
        return this._isMoving;
    }
    set isMoving(value:boolean) {
        if (this._isMoving !== value) {
            this._isMoving = value;
            this.notifyPropertyChange("isMoving", value);
        }
    }
    get isEnabled(): boolean {
        console.log('---------------- get isEnabled() -------------------');
        return this._enabled;
    }
    set isEnabled(value:boolean) {
        console.log('---------------- set isEnabled()', value, this._enabled, ' -------------------');
        if (this._enabled !== value) {
            this._enabled = value;
            if (value) {
                this._bgGeo.start();
            } else {
                this._bgGeo.stop();
            }
        }
        this.notifyPropertyChange("isEnabled", value);
        
    }
    set locationData(value: string) {
        if (this._locationData !== value) {
            this._locationData = value;
            this.notifyPropertyChange("locationData", value);
        }        
    }
    get locationData(): string {
        return this._locationData;
    }
    constructor() {
        super();
        this._bgGeo = new BackgroundGeolocation();
        this.locationData = "START";
        this._emptyFn = function(){};
        
        

        //this._bgGeo.on('location', this.onLocation.bind(this));
        this._bgGeo.on({
            location: this.onLocation.bind(this),
            motionchange: this.onMotionChange.bind(this),
            http: this.onHttp.bind(this),
            heartbeat: this.onHeartbeat.bind(this),
            schedule: this.onSchedule.bind(this),
            error: this.onError.bind(this)
        });
        this._state = this._bgGeo.configure({
           debug: true,
           desiredAccuracy: 0,
           stationaryRadius: 25,
           distanceFilter: 50,
           activityRecognitionInterval: 10000,
           url: 'http://localhost:8080/locations',
           autoSync: true
        });

        console.log(this._state);

        console.log('#constructor------------------- ', this._state.enabled);

        this._enabled = this._state.objectForKey("enabled");
        this.notifyPropertyChange("isEnabled", this._enabled);
        this._isMoving  = this._state.objectForKey("isMoving");

        // Initialize default values.
        this._counter = 42;
        this.updateMessage();
    }

    public onSetConfig() {
        var config = {
            distanceFilter: 10,
            stationaryRadius: 500
        };
        this._bgGeo.setConfig(config);
    }
    public onChangePace() {
        this._isMoving = !this._isMoving;
        this._bgGeo.changePace(this._isMoving);
    }

    public onGetCurrentPosition() {
        this._bgGeo.getCurrentPosition(function(location) {
            console.log('----------- getCurrentPosition SUCCESS: ', location);
        }.bind(this), function(error) {
            console.log('----------- getCurrentPosition FAIL: ', error);
        }.bind(this), {
            timeout: 10,
            persist: false
        });
    }
    private updateMessage() {
        if (this._counter <= 0) {
            this.message = "Hoorraaay! You unlocked the NativeScript clicker achievement!";
        } else {
            this.message = this._counter + " taps left";
        }
    }

    public onTap() {
        this._counter--;
        this.updateMessage();
    }

    private onLocation(location:any) {
        console.log('----------- LOCATION: ', location);

        this.locationData = "<pre>" + JSON.stringify(location, null, 2) + "</pre>";
    }

    private onMotionChange(location: any) {
        console.log('----------- MOTIONCHANGE received', location);
    }

    private onHttp(statusCode: number, responseText: string) {
        console.log('----------- HTTP: ', statusCode, ', responseText: ', responseText);
    }

    private onHeartbeat(params: Object) {
        console.log('----------- HEARTBEAT: ', params);
    }

    private onSchedule(state: Object) {
        console.log('----------- SCHEDULE: ', state);
    }

    private onError(errorCode: number) {
        console.log('----------- ERROR: ', errorCode);
    }
}