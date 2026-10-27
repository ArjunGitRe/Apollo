import { ExtensionOperationRequestType, ExtensionOperationRequestHandlerBase } from "PosApi/Create/Operations";
import RedeemVoucherOperationResponse from "../../Operations/RedeemVoucher/RedeemVoucherOperationResponse";
import RedeemVoucherOperationRequest from "../../Operations/RedeemVoucher//RedeemVoucherOperationRequest";
import { ClientEntities } from "PosApi/Entities";

export default class RedeemVoucherOperationRequestHandler<TResponse extends RedeemVoucherOperationResponse> extends ExtensionOperationRequestHandlerBase<TResponse> {

    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return RedeemVoucherOperationRequest;
    }


    public async executeAsync(printRequest: RedeemVoucherOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {

        this.context.navigator.navigate("PlanetCustomersDetailsView");

        return Promise.resolve({ canceled: false, data: <TResponse>new RedeemVoucherOperationResponse });
    }

}