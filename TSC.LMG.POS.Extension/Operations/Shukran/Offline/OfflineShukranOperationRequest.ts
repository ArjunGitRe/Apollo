import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import OfflineShukranOperationResponse from "../../Shukran/Offline/OfflineShukranOperationResponse";

export default class OfflineShukranOperationRequest<TResponse extends OfflineShukranOperationResponse> extends ExtensionOperationRequestBase<TResponse> {
    constructor(correlationId: string) {
        super(6113, correlationId);
    }
}