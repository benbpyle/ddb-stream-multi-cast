import { IFunction } from "aws-cdk-lib/aws-lambda";

export interface EventBridgeRulesProps {
    itemOneHandler: IFunction;
    itemTwoHandler: IFunction;
}
