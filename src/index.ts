import { Bootstrap, RegisterModPackage } from "@hotbunny/hackhub-content-sdk";

import "./main/index.js";
import "./debug/index.js";
import { trace } from "./helpers/logger.js";

@RegisterModPackage
export default class FlatlineProtocol extends Bootstrap {

    async OnModPackageLoaded() {
        trace("Flatline Protocol", "FLATLINE PROTOCOL COMPLETELY LOADED!");
    }

}
