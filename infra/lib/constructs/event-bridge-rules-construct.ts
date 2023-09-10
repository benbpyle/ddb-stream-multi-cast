import { Rule } from "aws-cdk-lib/aws-events";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { EventBridgeRulesProps } from "../types/rule-props";

export class EventBridgesRule extends Construct {
    constructor(scope: Construct, id: string, props: EventBridgeRulesProps) {
        super(scope, id);
        this.buildItemOneRule(scope, props.itemOneHandler);
    }

    private buildItemOneRule = (scope: Construct, handler: IFunction) => {
        const rule = new Rule(scope, "ItemOnHandlerRule", {
            eventPattern: {
                detailType: ["ItemOneUpdated", "ItemOneCreated"],
            },
            ruleName: "item-one-rule",
        });

        const dlq = new Queue(this, "ItemOneHandler-DLQ");
        rule.addTarget(
            new targets.LambdaFunction(handler, {
                deadLetterQueue: dlq,
            })
        );
    };

    // private buildBusTwoRule = (
    //     scope: Construct,
    //     props: EventBridgeRuleStackProps
    // ) => {
    //     const rule = new Rule(this, "SampleEventSM-Rule", {
    //         eventPattern: {
    //             detailType: ["Busing"],
    //         },
    //         ruleName: "bus-two-busing",
    //         eventBus: props.busTwo,
    //     });

    //     const dlq = new Queue(this, "SampleEventSM-DLQ");

    //     const role = new Role(this, "SampleEventSM-Role", {
    //         assumedBy: new ServicePrincipal("events.amazonaws.com"),
    //     });

    //     rule.addTarget(
    //         new targets.SfnStateMachine(props.stateMachine, {
    //             input: RuleTargetInput,
    //             deadLetterQueue: dlq,
    //             role: role,
    //         })
    //     );
    // };
}
