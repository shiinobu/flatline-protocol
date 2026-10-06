import { Quest, RegisterQuest } from "@hotbunny/hackhub-content-sdk";

import "../websites/m02/tr4c3404/index.js";
import "../websites/m02/blkledger/index.js";
import type { M02QuestData } from "../content/m02/state.js";
import {
    M02_QUEST,
    createM02Data,
    onCompleteM02,
    onObjectivesStartM02,
    onStartM02,
} from "../controller/m02/index.js";

@RegisterQuest
export class FlatlineM02Quest extends Quest<M02QuestData> {
    override Name = M02_QUEST.name;
    override Title = M02_QUEST.title();
    override Description = M02_QUEST.description();
    override Group = M02_QUEST.group;
    override AutoStart = M02_QUEST.autoStart;
    override AutoComplete = true;
    override QuestsToComplete = M02_QUEST.questsToComplete();
    override Rewards = M02_QUEST.rewards();
    override Objectives = M02_QUEST.objectives();

    override CreateData(): M02QuestData {
        return createM02Data();
    }

    override OnStart() {
        onStartM02();
    }

    override OnObjectivesStart() {
        onObjectivesStartM02(this);
    }

    override OnComplete() {
        onCompleteM02();
    }
}
