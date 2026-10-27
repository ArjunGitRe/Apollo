import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import RedeemVoucherOperationResponse from "../../Operations/RedeemVoucher/RedeemVoucherOperationResponse";

export default class RedeemVoucherOperationRequest<TResponse extends RedeemVoucherOperationResponse> extends ExtensionOperationRequestBase<TResponse> {
    constructor(correlationId: string) {
        super(6108, correlationId);
    }
}