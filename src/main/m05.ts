import { Quest, RegisterQuest } from "@hotbunny/hackhub-content-sdk";

import "../websites/global/echoline/index.js";
import "../websites/m05/leakindex/index.js";
import type { M05QuestData } from "../content/m05/state.js";
import {
    M05_QUEST,
    createM05Data,
    onCompleteM05,
    onObjectivesStartM05,
    onStartM05,
} from "../controller/m05/index.js";

@RegisterQuest
export class FlatlineM05Quest extends Quest<M05QuestData> {
    override Name = M05_QUEST.name;
    override Title = M05_QUEST.title();
    override Description = M05_QUEST.description();
    override Group = M05_QUEST.group;
    override AutoStart = M05_QUEST.autoStart;
    override AutoComplete = true;
    override QuestsToComplete = M05_QUEST.questsToComplete();
    override Objectives = M05_QUEST.objectives();

    override CreateData(): M05QuestData {
        return createM05Data();
    }

    override OnStart() {
        onStartM05();
    }

    override OnObjectivesStart() {
        onObjectivesStartM05(this);
    }

    override OnComplete() {
        onCompleteM05();
    }
}
