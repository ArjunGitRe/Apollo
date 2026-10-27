import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import SynchDateTimeOperationResponse from "./SynchDateTimeOperationResponse";

export default class SynchDateTimeOperationRequest<TResponse extends SynchDateTimeOperationResponse> extends ExtensionOperationRequestBase<TResponse>{
    constructor(correlationId: string) {
        super(6105, correlationId);
    }
}