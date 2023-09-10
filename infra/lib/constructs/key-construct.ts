import { RemovalPolicy } from "aws-cdk-lib";
import { Key } from "aws-cdk-lib/aws-kms";
import { Construct } from "constructs";

export default class KeyConstruct extends Construct {
    private readonly _key: Key;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this._key = new Key(scope, "Key", {
            description: "Key used for this sample",
            removalPolicy: RemovalPolicy.DESTROY,
            alias: "main-key",
        });
    }

    get key(): Key {
        return this._key;
    }
}
