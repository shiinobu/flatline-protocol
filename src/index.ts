import { Bootstrap, RegisterModPackage, type ModSettingDefinition } from "@hotbunny/hackhub-content-sdk";

import { REDUCE_FLASHING_SETTING } from "./components/desktop-glitch.js";
import "./main/index.js";
import "./debug/index.js";
import { trace } from "./helpers/logger.js";

@RegisterModPackage
export default class FlatlineProtocol extends Bootstrap {
    Settings: ModSettingDefinition[] = [
        {
            key: REDUCE_FLASHING_SETTING,
            label: "Reduce flashing effects",
            type: "toggle",
            default: false,
        },
    ];

    async OnModPackageLoaded() {
        trace("Flatline Protocol", "FLATLINE PROTOCOL COMPLETELY LOADED!");
    }

}
