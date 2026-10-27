import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import DuplicateOperationResponse from "./DuplicateOperationResponse";

export default class DuplicateOperationRequest<TResponse extends DuplicateOperationResponse> extends ExtensionOperationRequestBase<TResponse>{
    constructor(correlationId: string) {
        super(6103, correlationId);
    }
}