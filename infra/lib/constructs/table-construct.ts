import { RemovalPolicy } from "aws-cdk-lib";
import {
    AttributeType,
    BillingMode,
    StreamViewType,
    Table,
    TableEncryption,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { TableProps } from "../types/table-props";

export default class TableConstruct extends Construct {
    private readonly _table: Table;

    constructor(scope: Construct, id: string, props: TableProps) {
        super(scope, id);

        this._table = new Table(this, id, {
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
            partitionKey: { name: "id", type: AttributeType.STRING },
            tableName: `Patients`,
            encryption: TableEncryption.CUSTOMER_MANAGED,
            encryptionKey: props.key,
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
        });
    }

    get table(): Table {
        return this._table;
    }
}
