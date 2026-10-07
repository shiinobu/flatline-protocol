import { Quest, RegisterQuest } from "@hotbunny/hackhub-content-sdk";

import "../websites/m07/architect-c2/index.js";
import "../websites/m07/blkledger/index.js";
import "../websites/m07/portal/index.js";
import type { M07QuestData } from "../content/m07/state.js";
import {
    M07_QUEST,
    createM07Data,
    onCompleteM07,
    onObjectivesStartM07,
    onStartM07,
} from "../controller/m07/index.js";

@RegisterQuest
export class FlatlineM07Quest extends Quest<M07QuestData> {
    override Name = M07_QUEST.name;
    override Title = M07_QUEST.title();
    override Description = M07_QUEST.description();
    override Group = M07_QUEST.group;
    override AutoStart = M07_QUEST.autoStart;
    override AutoComplete = true;
    override QuestsToComplete = M07_QUEST.questsToComplete();
    override Objectives = M07_QUEST.objectives();

    override CreateData(): M07QuestData {
        return createM07Data();
    }

    override OnStart() {
        onStartM07();
    }

    override OnObjectivesStart() {
        onObjectivesStartM07(this);
    }

    override OnComplete() {
        onCompleteM07();
    }
}
