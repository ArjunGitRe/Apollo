import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import GetLastTransactionOperationResponse from "./GetLastTransactionOperationResponse";

export default class GetLastTransactionOperationRequest<TResponse extends GetLastTransactionOperationResponse> extends ExtensionOperationRequestBase<TResponse>{
    constructor(correlationId: string) {
        super(6100, correlationId);
    }
}