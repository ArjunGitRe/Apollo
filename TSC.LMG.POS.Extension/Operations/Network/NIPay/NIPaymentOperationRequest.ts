import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import NIPaymentOperationResponse from "./NIPaymentOperationResponse";


export default class NIPaymentOperationRequest<TResponse extends NIPaymentOperationResponse>
    extends ExtensionOperationRequestBase<TResponse> {

    constructor(correlationId: string) {
        super(6110, correlationId);
    }
}