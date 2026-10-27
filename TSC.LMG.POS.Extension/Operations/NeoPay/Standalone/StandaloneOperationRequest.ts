import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import StandaloneOperationResponse from "./StandaloneOperationResponse";

export default class StandaloneOperationRequest<TResponse extends StandaloneOperationResponse> extends ExtensionOperationRequestBase<TResponse>{
    constructor(correlationId: string) {
        super(6104, correlationId);
    }
}