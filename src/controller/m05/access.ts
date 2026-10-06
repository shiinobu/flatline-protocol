import { appendBacktraceLogs } from "../../applications/backtrace-state.js";
import { isNamedFile, onFileRead, type ReadFile } from "../../components/file-reads.js";
import { M05_BEDSIDE_IP, M05_STATUS_DOMAIN } from "../../content/m05/network.js";
import { M05_LOG_BEDSIDE, M05_LOG_STATUS } from "../../content/m05/quest-logs.js";
import { M05_FOUND_NOTE_FILE_NAME, M05_TXT } from "../../content/m05/server-files.js";
import { trace } from "../../helpers/logger.js";
import type { M05Quest } from "./types.js";

const bindBedsideBonus = (quest: M05Quest): void => {
    quest.Events.on("RemoteConnection.Established", (data) => {
        if (data.t !== "METASPLOIT" || data.targetIp !== M05_BEDSIDE_IP || quest.Data.bedsideVisited) return;

        quest.SetData("bedsideVisited", true);
        trace("M05", "probe:bedside-bonus");
    });

    onFileRead(quest.Events, (file: ReadFile) => {
        if (!isNamedFile(file, M05_FOUND_NOTE_FILE_NAME, M05_TXT) || !quest.Data.bedsideVisited) return;

        appendBacktraceLogs("m5", M05_LOG_BEDSIDE());
    });
};

const bindStatusNote = (quest: M05Quest): void => {
    quest.Events.on("Browser.Meta", (data) => {
        if (data.protocol !== "https:" || data.hostname !== M05_STATUS_DOMAIN || quest.Data.statusNoted) return;

        quest.SetData("statusNoted", true);
        trace("M05", "probe:status-note");
        appendBacktraceLogs("m5", M05_LOG_STATUS());
    });
};

export const bindM05Access = (quest: M05Quest): void => {
    bindBedsideBonus(quest);
    bindStatusNote(quest);
};
