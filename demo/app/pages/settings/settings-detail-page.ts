
import {ObservableArray} from "data/observable-array";
import { EventData, Observable } from "data/observable";
import frames = require("ui/frame");
import { Page } from "ui/page";
import * as Settings from "application-settings";

var page;
var bgGeo;

var setting: Observable;

var textChangeBuffer;

function commitTextValue() {
  var config = {};
  config[setting.name] = setting.value;

  bgGeo.setConfig(config, function(state) {
    console.log('- setConfig success', JSON.stringify(config));
  });
}

function onTextChange(event) {
  if (event.propertyName !== 'value') {
    return;
  }
  setting.set('displayValue', setting.value);
  // Reset key-buffer
  if (textChangeBuffer) {
    clearTimeout(textChangeBuffer);    
  }
  // Buffer key-presses so we don't #setConfig too quickly
  textChangeBuffer = setTimeout(commitTextValue, 1000);
}
// Event handler for Page "navigatingTo" event attached in main-page.xml
export function navigatingTo(args: any) {
  // Get the event sender
  page = <Page>args.object;
  bgGeo = args.context.bgGeo;

  page.addCssFile("pages/settings/settings-page.css");

  if (!page.bindingContext) {
    setting = args.context.setting;
    var currentValue = setting.value;

    switch (setting.inputType) {
      case 'select':
        // Compose ObservableArray of this setting's available values
        var items = new ObservableArray();
        setting.values.forEach(function(value) {
          items.push(new Observable({
            value: value,
            checked: (value == currentValue)
          }));
        });
        setting.set('items', items);
        break;
      case 'multiselect':
        currentValue = currentValue.replace(/\s/g,'').split(',');
        var items = new ObservableArray();
        setting.values.forEach(function(value) {
          items.push(new Observable({
            value: value,
            checked: (currentValue.indexOf(value) >= 0)
          }));
        });
        setting.set('items', items);
        break;
      case 'text':
        setting.removeEventListener(Observable.propertyChangeEvent, onTextChange);
        setting.addEventListener(Observable.propertyChangeEvent, onTextChange);
        break;
    }
    page.bindingContext = setting;
  }
}

// Seems this is only required for Android
export function onClickBack(event: EventData) {
  frames.topmost().goBack();
}

export function onSelectValue(event) {

  var setting = <Observable>page.bindingContext;
  var name = setting.get('name');
  var currentValue = event.view.bindingContext.value;

  if (setting.inputType === 'multiselect') {    
    var options = (setting.value != '') ? setting.value.split(',') : [];
    var index = options.indexOf(currentValue);
    if (index >= 0) {
      options.splice(index, 1);
    } else {
      options.push(currentValue);
    }

    setting.get('items').forEach(function(item) {
      item.set('checked', options.indexOf(item.value) >= 0);
    });

    if (options.length > 0) {
      setting.set('value', options.join(','));
      if (options.length === setting.items.length) {
        setting.set('displayValue', 'ALL');
      } else {
        setting.set('displayValue', setting.value);
      }
    } else {
      setting.set('value', '');
      setting.set('displayValue', 'NONE');
    }
    currentValue = setting.value;
  } else {
    setting.set('value', currentValue);
    setting.set('displayValue', currentValue);
    setting.get('items').forEach(function(item) {
      item.set('checked', item.get('value') == currentValue);
    });
  }
  
  var config = {};
  if (Settings.hasKey('config')) {
    config = JSON.parse(Settings.getString('config'));
  }
  // Update Config
  config[name] = currentValue;
  Settings.setString('config', JSON.stringify(config));

  // Now update BackgroundGeolocation config with {key:value}
  config = {};
  config[name] = currentValue;
  bgGeo.setConfig(config, function(state) {
    console.log('- setConfig success: ', state);
  });

  if (setting.inputType !== 'multiselect') {
    var topMost = frames.topmost().goBack();
  }
}


