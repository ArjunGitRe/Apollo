import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import ReverseVoucherOperationResponse from "../../Operations/ReverseVoucher/ReverseVoucherOperationResponse";

export default class ReverseVoucherOperationRequest<TResponse extends ReverseVoucherOperationResponse> extends ExtensionOperationRequestBase<TResponse> {
    constructor(correlationId: string) {
        super(6109, correlationId);
    }
}