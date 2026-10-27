import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import ShukranEnrollOperationResponse from "../../Shukran/Enroll/ShukranEnrollOperationResponse";

export default class ShukranEnrollOperationRequest<TResponse extends ShukranEnrollOperationResponse> extends ExtensionOperationRequestBase<TResponse> {
    constructor(correlationId: string) {
        super(6107, correlationId);
    }
}