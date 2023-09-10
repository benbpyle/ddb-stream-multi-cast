import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Key } from "aws-cdk-lib/aws-kms";
import { IFunction } from "aws-cdk-lib/aws-lambda";

export interface PipeProps {
    enrichmentFunction: IFunction;
    key: Key;
    table: Table;
}
