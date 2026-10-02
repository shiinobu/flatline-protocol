import { Quest, RegisterQuest } from "@hotbunny/hackhub-content-sdk";

import type { M04QuestData } from "../content/m04/state.js";
import {
    M04_QUEST,
    createM04Data,
    onCompleteM04,
    onObjectivesStartM04,
    onStartM04,
} from "../controller/m04/index.js";

@RegisterQuest
export class FlatlineM04Quest extends Quest<M04QuestData> {
    override Name = M04_QUEST.name;
    override Title = M04_QUEST.title();
    override Description = M04_QUEST.description();
    override Group = M04_QUEST.group;
    override AutoStart = M04_QUEST.autoStart;
    override AutoComplete = true;
    override QuestsToComplete = M04_QUEST.questsToComplete();
    override Objectives = M04_QUEST.objectives();

    override CreateData(): M04QuestData {
        return createM04Data();
    }

    override OnStart() {
        onStartM04();
    }

    override OnObjectivesStart() {
        onObjectivesStartM04(this);
    }

    override OnComplete() {
        onCompleteM04();
    }
}
