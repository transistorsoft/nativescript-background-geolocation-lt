
import observable = require("data/observable");

export class SettingsViewModel extends observable.Observable {
  private _identifier = '';
  
  get identifier(): string {
    return this._identifier;
  }
  set identifier(value:string) {
  	if (value !== this._identifier) {
    	this._identifier = value;    
    }
  }
}
