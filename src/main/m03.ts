import { Quest, RegisterQuest } from "@hotbunny/hackhub-content-sdk";

import "../websites/m03/skynet-importexport/index.js";
import type { M03QuestData } from "../content/m03/state.js";
import {
    M03_QUEST,
    createM03Data,
    onCompleteM03,
    onObjectivesStartM03,
    onStartM03,
} from "../controller/m03/index.js";

@RegisterQuest
export class FlatlineM03Quest extends Quest<M03QuestData> {
    override Name = M03_QUEST.name;
    override Title = M03_QUEST.title();
    override Description = M03_QUEST.description();
    override Group = M03_QUEST.group;
    override AutoStart = M03_QUEST.autoStart;
    override AutoComplete = true;
    override QuestsToComplete = M03_QUEST.questsToComplete();
    override Rewards = M03_QUEST.rewards();
    override Objectives = M03_QUEST.objectives();

    override CreateData(): M03QuestData {
        return createM03Data();
    }

    override OnStart() {
        onStartM03();
    }

    override OnObjectivesStart() {
        onObjectivesStartM03(this);
    }

    override OnComplete() {
        onCompleteM03();
    }
}
