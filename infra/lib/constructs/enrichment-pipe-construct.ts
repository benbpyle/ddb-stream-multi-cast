import { CfnPipe } from "aws-cdk-lib/aws-pipes";
import { Construct } from "constructs";
import { PipeProps } from "../types/pipe-props";
import {
    Effect,
    PolicyDocument,
    PolicyStatement,
    Role,
    ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Key } from "aws-cdk-lib/aws-kms";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Stack } from "aws-cdk-lib";

export class EnrichmentPipeConstruct extends Construct {
    constructor(scope: Construct, id: string, props: PipeProps) {
        super(scope, id);

        const accountId = Stack.of(this).account;
        const region = Stack.of(this).region;
        const defaultBus = `arn:aws:events:${region}:${accountId}:event-bus/default`;
        // Create the role
        const pipeRole = this.pipeRole(
            scope,
            this.sourcePolicy(props.key, props.table),
            this.targetPolicy(defaultBus),
            this.enrichmentPolicy(props.enrichmentFunction)
        );

        const pipe = new CfnPipe(scope, "Pipe", {
            name: "Ddb-Stream-MultiCast-Pipe",
            roleArn: pipeRole.roleArn,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            source: props.table.tableStreamArn!,
            enrichment: props.enrichmentFunction.functionArn,
            target: defaultBus,
            sourceParameters: this.sourceParameters(),
            targetParameters: this.targetParameters(defaultBus),
            enrichmentParameters: this.enrichmentParameters(),
        });
    }

    targetPolicy = (busArn: string): PolicyDocument => {
        return new PolicyDocument({
            statements: [
                new PolicyStatement({
                    resources: [busArn],
                    actions: ["events:PutEvents"],
                    effect: Effect.ALLOW,
                }),
            ],
        });
    };
    /*
        Builds the IAM Policy for putting events on the bus
    */
    enrichmentPolicy = (lf: IFunction): PolicyDocument => {
        return new PolicyDocument({
            statements: [
                new PolicyStatement({
                    resources: [lf.functionArn],
                    actions: ["lambda:InvokeFunction"],
                    effect: Effect.ALLOW,
                }),
            ],
        });
    };

    /*
        Builds the IAM Policy for reading events from SQS
    */
    sourcePolicy = (key: Key, table: Table): PolicyDocument => {
        return new PolicyDocument({
            statements: [
                new PolicyStatement({
                    actions: [
                        "dynamodb:DescribeStream",
                        "dynamodb:GetRecords",
                        "dynamodb:GetShardIterator",
                        "dynamodb:ListStreams",
                    ],
                    effect: Effect.ALLOW,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    resources: [table.tableStreamArn!],
                }),
                new PolicyStatement({
                    actions: [
                        "kms:Decrypt",
                        "kms:DescribeKey",
                        "kms:Encrypt",
                        "kms:GenerateDataKey*",
                        "kms:ReEncrypt*",
                    ],
                    resources: [key.keyArn],
                    effect: Effect.ALLOW,
                }),
            ],
        });
    };

    /*
        Builds the IAM Role that combines the source and target policy 
        with the ServicePrincipal for AWS Pipes
    */
    pipeRole = (
        scope: Construct,
        sourcePolicy: PolicyDocument,
        targetPolicy: PolicyDocument,
        enrichmentPolicy: PolicyDocument
    ): Role => {
        return new Role(scope, "PipeRole", {
            assumedBy: new ServicePrincipal("pipes.amazonaws.com"),
            inlinePolicies: {
                sourcePolicy,
                targetPolicy,
                enrichmentPolicy,
            },
        });
    };

    /*
        Input parameters.  Leveraging the Message Body from the SQS receiveMessage
        By using filter criteria the developer can keep downstream systems from 
        receiving unecassary messages from upstream noise
    */
    sourceParameters = () => {
        return {
            dynamoDbStreamParameters: {
                startingPosition: "LATEST",
                batchSize: 1,
            },
            filterCriteria: {
                filters: [
                    {
                        pattern: ' { "eventName": [ "MODIFY", "INSERT" ] }',
                    },
                ],
            },
        };
    };

    enrichmentParameters = () => {
        return {
            lambdaParameters: {
                invocationType: "REQUEST_RESPONSE",
            },
            inputTemplate: ``,
        };
    };

    /*
        Target parameters.  Transforms the input from the queue into something
        that is suitable for the downstream event bus to read.  Transforms give
        the developer the ability to manipulate the output before it is written out
    */
    targetParameters = (busArn: string) => {
        return {
            eventBridgeEventBusParameters: {
                detailType: "PatientChange",
                source: "com.binaryheap.patient",
            },
            inputTemplate: `{
                    "meta": {
                        "correlationId": <$.eventId>,
                        "changeType": <$.eventType>
                    },
                    "event": <$.body>
                }`,
        };
    };
}
