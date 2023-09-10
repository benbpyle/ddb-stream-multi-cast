import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { EventBridgeRulesProps } from "../types/rule-props";
import { Stack } from "aws-cdk-lib";

export class EventBridgeRulesConstruct extends Construct {
    constructor(scope: Construct, id: string, props: EventBridgeRulesProps) {
        super(scope, id);
        const accountId = Stack.of(this).account;
        const region = Stack.of(this).region;
        const defaultBus = `arn:aws:events:${region}:${accountId}:event-bus/default`;

        this.buildItemOneRule(scope, props.itemOneHandler, defaultBus);
        this.buildItemTwoRule(scope, props.itemTwoHandler, defaultBus);
    }

    private buildItemOneRule = (
        scope: Construct,
        handler: IFunction,
        busArn: string
    ) => {
        const rule = new Rule(scope, "ItemOnHandlerRule", {
            eventPattern: {
                detailType: ["PatientChange"],
                detail: {
                    meta: {
                        changeType: ["PatientModify", "PatientInsert"],
                    },
                },
            },
            eventBus: EventBus.fromEventBusArn(
                scope,
                "DefaultBusItemOne",
                busArn
            ),
            ruleName: "item-one-rule",
        });

        const dlq = new Queue(this, "ItemOneHandler-DLQ");
        rule.addTarget(
            new targets.LambdaFunction(handler, {
                deadLetterQueue: dlq,
            })
        );
    };

    private buildItemTwoRule = (
        scope: Construct,
        handler: IFunction,
        busArn: string
    ) => {
        const rule = new Rule(scope, "ItemTwoHandlerRule", {
            eventPattern: {
                detailType: ["PatientChange"],
                detail: {
                    meta: {
                        changeType: ["AddressModify", "AddressInsert"],
                    },
                },
            },
            eventBus: EventBus.fromEventBusArn(
                scope,
                "DefaultBusItemTwo",
                busArn
            ),
            ruleName: "item-two-rule",
        });

        const dlq = new Queue(this, "ItemTwoHandler-DLQ");
        rule.addTarget(
            new targets.LambdaFunction(handler, {
                deadLetterQueue: dlq,
            })
        );
    };
}
