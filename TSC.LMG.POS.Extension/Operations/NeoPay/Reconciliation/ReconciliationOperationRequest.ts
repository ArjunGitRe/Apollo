import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import ReconciliationOperationResponse from "./ReconciliationOperationResponse";

export default class ReconciliationOperationRequest<TResponse extends ReconciliationOperationResponse> extends ExtensionOperationRequestBase<TResponse>{
    constructor(correlationId: string) {
        super(6102, correlationId);
    }
}