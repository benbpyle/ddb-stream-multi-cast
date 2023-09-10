import { GoFunction } from "@aws-cdk/aws-lambda-go-alpha";
import { Duration, Fn } from "aws-cdk-lib";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { FuncProps } from "../types/func-props";

export default class FunctionConstruct extends Construct {
    private _enrichment: IFunction;
    private _handlerOne: IFunction;
    private _handlerTwo: IFunction;

    get handlerTwoFunction(): IFunction {
        return this._handlerTwo;
    }

    get handlerOneFunction(): IFunction {
        return this._handlerOne;
    }

    get enrichmentFunction(): IFunction {
        return this._enrichment;
    }

    buildEnrichment = (scope: Construct, props: FuncProps) => {
        this._enrichment = new GoFunction(scope, "EnrichmentFunction", {
            entry: "src/enrichment",
            functionName: `patient-enrichment`,
            timeout: Duration.seconds(15),
            environment: {
                IS_LOCAL: "false",
                LOG_LEVEL: "DEBUG",
                VERSION: props.version,
            },
        });

        this._handlerOne = new GoFunction(scope, "ItemOneHandlerFunction", {
            entry: "src/type-one-handler",
            functionName: `type-one-handler`,
            timeout: Duration.seconds(15),
            environment: {
                IS_LOCAL: "false",
                LOG_LEVEL: "DEBUG",
                VERSION: props.version,
            },
        });

        this._handlerTwo = new GoFunction(scope, "ItemTwoHandlerFunction", {
            entry: "src/type-two-handler",
            functionName: `type-two-handler`,
            timeout: Duration.seconds(15),
            environment: {
                IS_LOCAL: "false",
                LOG_LEVEL: "DEBUG",
                VERSION: props.version,
            },
        });
    };

    constructor(scope: Construct, id: string, props: FuncProps) {
        super(scope, id);

        this.buildEnrichment(scope, props);
    }
}
