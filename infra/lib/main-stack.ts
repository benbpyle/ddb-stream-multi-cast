import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import KeyConstruct from "./constructs/key-construct";
import TableConstruct from "./constructs/table-construct";
import FunctionConstruct from "./constructs/function-construct";
import { EnrichmentPipeConstruct } from "./constructs/enrichment-pipe-construct";

export class MainStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const version = new Date().toISOString();
        const keyConstruct = new KeyConstruct(this, "KeyConstruct");
        const tableConstruct = new TableConstruct(this, "TableConstruct", {
            key: keyConstruct.key,
        });
        const functionConstruct = new FunctionConstruct(
            this,
            "FunctionConstruct",
            {
                version: version,
            }
        );

        const pipeConstruct = new EnrichmentPipeConstruct(
            this,
            "EnrichmentPipeConstruct",
            {
                enrichmentFunction: functionConstruct.enrichmentFunction,
                table: tableConstruct.table,
                key: keyConstruct.key,
            }
        );
    }
}
