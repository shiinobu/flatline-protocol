import { Bootstrap, RegisterModPackage } from "@hotbunny/hackhub-content-sdk";

import "./websites/a7xdeface9/index.js";
import "./main/m01-quest.js";

@RegisterModPackage
export default class FlatlineProtocol extends Bootstrap {

    async OnModPackageLoaded() {
        console.log("[flatline-protocol] FLATLINE PROTOCOL COMPLETELY LOADED!");
    }

}
