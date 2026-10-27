import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import AaniPayOperationResponse from "./AaniPayOperationResponse";

export default class AaniPayOperationRequestt<TResponse extends AaniPayOperationResponse>
    extends ExtensionOperationRequestBase<TResponse> {

    constructor(correlationId: string) {
        super(6111, correlationId);
    }
}