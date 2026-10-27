import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import ShukranProfileOperationResponse from "../../Shukran/Profile/ShukranProfileOperationResponse";

export default class ShukranProfileOperationRequest<TResponse extends ShukranProfileOperationResponse> extends ExtensionOperationRequestBase<TResponse> {
    constructor(correlationId: string) {
        super(6106, correlationId);
    }
}