import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import GetTotalsOperationResponse from "./GetTotalsOperationResponse";

export default class GetTotalsOperationRequest<TResponse extends GetTotalsOperationResponse> extends ExtensionOperationRequestBase<TResponse>{
    constructor(correlationId: string) {
        super(6101, correlationId);
    }
}