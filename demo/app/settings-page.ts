import * as app from 'application';
import {EventData, PropertyChangeData, Observable} from 'data/observable';
import { Page } from 'ui/page';
import Platform = require('platform');
import {StackLayout} from "tns-core-modules/ui/layouts/stack-layout";
import {DockLayout} from "tns-core-modules/ui/layouts/dock-layout";
import {DropDown} from "nativescript-drop-down";
import * as LabelModule from "tns-core-modules/ui/label";
import * as SwitchModule from "tns-core-modules/ui/switch";
import {fonticon} from 'nativescript-fonticon';
import { Color } from "color";
import SettingsModel from "./settings-model";
import BGService from "./lib/BGService";
import {BackgroundGeolocation} from "nativescript-background-geolocation-lt";


const SECTIONS = ['geolocation', 'activity_recognition', 'http', 'application', 'debug'];

let page;
/** 
* Renders marker for each setting row
* @return {DockLayout}
*
// 1. Select-box markup
<DockLayout class="setting" stretchLastChild="true" itemId="{{name}}" >
    <Label text="{{ name }}" dock="left" textWrap="true" class="name" />
    <DockLayout dock="right" stretchLastChild="true">
        <Label text="{{'ion-ios-arrow-down'|fonticon}}" class="ion disclosure" dock="right"/>        
        <dd:DropDown items="{{ values }}" itemId="{{name}}" selectedIndex="{{selectedIndex}}" class="value" selectedIndexChanged="onSelectionChange"/>        
    </DockLayout>
</DockLayout>

  - or -

// 2. Switch markup
<DockLayout class="setting" stretchLastChild="true" itemId="{{name}}" >
    <Label text="{{ name }}" dock="left" textWrap="true" class="name" />
    <Switch dock="right" class="value" />
</DockLayout>
*
*/



function buildSetting(setting) {
    let fieldContainer = new DockLayout();
    fieldContainer.className = "setting";
    fieldContainer.stretchLastChild = true;
    fieldContainer.bindingContext = setting;

    let label = new LabelModule.Label();
    label.text = setting.name;
    label.dock = "left";
    label.className = "name";
    fieldContainer.addChild(label);
    
    if (setting.inputType === 'select') {
      let valueContainer = new DockLayout();
      valueContainer.dock = "right";    
      // Render a DropDown field.
      valueContainer.stretchLastChild = true;
      if (app.ios) {
        // Only render a disclosure icon "v" for iOS -- Android DropDown already renders one.x
        let disclosure = new LabelModule.Label();
        disclosure.text = fonticon("ion-ios-arrow-down");
        disclosure.className = "ion disclosure";
        disclosure.dock = "right";
        valueContainer.addChild(disclosure);
      }
      let dd = new DropDown();      
      dd.items = setting.values;
      dd.color = new Color(255, 0, 0, 0);

      dd.bindingContext = setting;
      
      dd.selectedIndex = setting.values.indexOf(setting.value);
      dd.className = "value";
      dd.addEventListener("selectedIndexChanged", page.bindingContext.onSelectChange);
      valueContainer.addChild(dd);
      fieldContainer.addChild(valueContainer);
    } else if (setting.inputType === 'toggle') {
      // Render a Switch field.
      fieldContainer.stretchLastChild = false;
      let toggle = new SwitchModule.Switch();
      toggle.className = "value";
      toggle.marginRight = 10;
      toggle.bindingContext = setting;
      toggle.checked = setting.value;
      toggle.on("checkedChange", page.bindingContext.onToggleChange);
      toggle.dock = "right";
      fieldContainer.addChild(toggle);
    }    
    return fieldContainer;
}

export function shownModally(args:any) {    
  page = <Page>args.object;

  let bgService = BGService.getInstance();
  // Fetch current state and dynamically build UI Components for each Setting.
  BackgroundGeolocation.getState((state) => {
    page.bindingContext = new SettingsModel(state, args.closeCallback);
    SECTIONS.forEach(section => {
      let settings = bgService.getPlatformSettings(section);
      let container = <StackLayout>page.getViewById(section);
      settings.forEach((setting) => {
        setting.value = state[setting.name];
        container.addChild(buildSetting(setting));
      });
    });
    bgService.setLoading(false);
  });
}

