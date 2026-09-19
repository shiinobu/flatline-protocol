import { Bootstrap, RegisterModPackage } from "@hotbunny/hackhub-content-sdk";

import "./commands/attrcheck.js";
import "./debug/scratch.js";
import "./websites/a7xdeface9/index.js";
import "./websites/a7xcodeface/index.js";
import "./websites/skynet-importexport/index.js";
import "./websites/architect-c2/index.js";
import "./websites/shadowline-exchange/index.js";
import "./websites/ledgervault/index.js";
import "./main/m01-quest.js";
import "./main/m02-quest.js";
import "./main/m03-quest.js";
import "./main/m04-quest.js";
import { trace } from "./helpers/logger.js";

@RegisterModPackage
export default class FlatlineProtocol extends Bootstrap {

    async OnModPackageLoaded() {
        trace("Flatline Protocol", "FLATLINE PROTOCOL COMPLETELY LOADED!");
    }

}
