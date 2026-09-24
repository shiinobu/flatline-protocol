import { Bootstrap, RegisterModPackage } from "@hotbunny/hackhub-content-sdk";

import "./applications/backtrace.js";
import "./commands/attrcheck.js";
import "./debug/scratch.js";
import "./websites/m01/blackwire-network/index.js";
import "./websites/m02/tr4c3404/index.js";
import "./websites/m03/skynet-importexport/index.js";
import "./websites/m04/architect-c2/index.js";
import "./websites/m01/frostgate-exchange/index.js";
import "./websites/m01/obsidian-access/index.js";
import "./websites/m01/clearescrow-io/index.js";
import "./websites/m01/pacificcare-health/index.js";
import "./websites/m01/ledgervault/index.js";
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
