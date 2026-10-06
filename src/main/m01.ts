import { Quest, RegisterQuest } from "@hotbunny/hackhub-content-sdk";

import "../websites/m01/blackwire-network/index.js";
import "../websites/m01/frostgate-exchange/index.js";
import "../websites/m01/obsidian-access/index.js";
import "../websites/m01/clearescrow-io/index.js";
import "../websites/m01/ledgervault/index.js";
import type { M01QuestData } from "../content/m01/state.js";
import {
    M01_QUEST,
    createM01Data,
    onAbandonM01,
    onCompleteM01,
    onObjectivesStartM01,
    onStartM01,
} from "../controller/m01/index.js";

@RegisterQuest
export class FlatlineM01Quest extends Quest<M01QuestData> {
    override Name = M01_QUEST.name;
    override Title = M01_QUEST.title();
    override Description = M01_QUEST.description();
    override Group = M01_QUEST.group;
    override Abandonable = true;
    override AutoStart = M01_QUEST.autoStart();
    override AutoComplete = true;
    override QuestsToComplete = M01_QUEST.questsToComplete();
    override Rewards = M01_QUEST.rewards();
    override HackhubPost = M01_QUEST.hackhubPost();
    override Objectives = M01_QUEST.objectives();

    override CreateData(): M01QuestData {
        return createM01Data();
    }

    override OnStart() {
        onStartM01();
    }

    override OnObjectivesStart() {
        onObjectivesStartM01(this);
    }

    override OnComplete() {
        onCompleteM01();
    }

    override OnAbandon() {
        onAbandonM01();
    }
}
