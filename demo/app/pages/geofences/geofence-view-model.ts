import observable = require("data/observable");

export class GeofenceViewModel extends observable.Observable {
  private _title: string;
  private _action: string;
  private _identifier = '';
  private _radius: number;
  private _notifyOnEntry: boolean;
  private _notifyOnExit: boolean;
  private _notifyOnDwell: boolean;
  private _loiteringDelay: number;

  constructor() {
    super();
    this._title = '';
    this._action = '';
    this._radius = 100;
    this._notifyOnEntry = true;
    this._notifyOnExit = false;
    this._notifyOnDwell = false;
    this._loiteringDelay = 0;
  }
  get title(): string {
    return this._title;
  }
  set title(value:string) {
    this._title = value;
    this.notifyPropertyChange('title', value);
  }

  get action(): string {
    return this._action;
  }
  set action(value:string) {
    console.log(' set action: ', value);
    if (value === 'edit') {
      this.set('title', 'Edit Geofence');
    } else {
      this.set('title', 'New Geofence');
    }
    this._action = value;
  }
  get radius(): any {
  	return this._radius;
  }
  set radius(value:any) {
  	if (value !== this._radius) {
  		this._radius = parseInt(value, 10);
  	}
  }
  get identifier(): string {
    return this._identifier;
  }
  set identifier(value:string) {
  	if (value !== this._identifier) {
    	this._identifier = value;
    }
  }

  get notifyOnEntry(): boolean {
  	return this._notifyOnEntry;
  }
  set notifyOnEntry(value:boolean) {
  	if (value !== this._notifyOnEntry) {
  		this._notifyOnEntry = value;
  	}
  }

  get notifyOnExit(): boolean {
  	return this._notifyOnExit;
  }
  set notifyOnExit(value:boolean) {
  	if (value !== this._notifyOnExit) {
  		this._notifyOnExit = value;
  	}
  }

  get notifyOnDwell(): boolean {
  	return this._notifyOnDwell;
  }
  set notifyOnDwell(value:boolean) {
  	if (value !== this._notifyOnDwell) {
  		this._notifyOnDwell = value;
  	}
  }

  get loiteringDelay(): any {
  	return this._loiteringDelay;
  }
  set loiteringDelay(value:any) {
  	if (value !== this._loiteringDelay) {
  		this._loiteringDelay = parseInt(value, 10);
  	}
  }

}
