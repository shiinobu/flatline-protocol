import { Bootstrap, RegisterModPackage, type ModSettingDefinition } from "@hotbunny/hackhub-content-sdk";

import { REDUCE_FLASHING_SETTING } from "./components/desktop-glitch.js";
import { bindHandbook } from "./content/global/handbook.js";
import "./main/index.js";
import "./debug/index.js";

@RegisterModPackage
export default class FlatlineProtocol extends Bootstrap {
    Settings: ModSettingDefinition[] = [
        {
            key: REDUCE_FLASHING_SETTING,
            label: "Reduce motion and flashing",
            type: "toggle",
            default: false,
        },
    ];

    OnModPackageLoaded() {
        bindHandbook();
    }
}
