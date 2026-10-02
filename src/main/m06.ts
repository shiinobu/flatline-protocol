import { Quest, RegisterQuest } from "@hotbunny/hackhub-content-sdk";

import "../websites/m06/registry/index.js";
import type { M06QuestData } from "../content/m06/state.js";
import {
    M06_QUEST,
    createM06Data,
    onCompleteM06,
    onObjectivesStartM06,
    onStartM06,
} from "../controller/m06/index.js";

@RegisterQuest
export class FlatlineM06Quest extends Quest<M06QuestData> {
    override Name = M06_QUEST.name;
    override Title = M06_QUEST.title();
    override Description = M06_QUEST.description();
    override Group = M06_QUEST.group;
    override AutoStart = M06_QUEST.autoStart;
    override AutoComplete = true;
    override QuestsToComplete = M06_QUEST.questsToComplete();
    override Objectives = M06_QUEST.objectives();

    override CreateData(): M06QuestData {
        return createM06Data();
    }

    override OnStart() {
        onStartM06();
    }

    override OnObjectivesStart() {
        onObjectivesStartM06(this);
    }

    override OnComplete() {
        onCompleteM06();
    }
}
