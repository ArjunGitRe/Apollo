import RedeemVoucherOperationResponse from "../../Operations/RedeemVoucher/RedeemVoucherOperationResponse";
import RedeemVoucherOperationRequest from "../../Operations/RedeemVoucher//RedeemVoucherOperationRequest";
import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
let getOperationRequest: ExtensionOperationRequestFactoryFunctionType<RedeemVoucherOperationResponse> =

    function (
        context: IOperationContext,
        operationId: number,
        actionParameters: string[],
        correlationId: string

    ): Promise<ClientEntities.ICancelableDataResult<RedeemVoucherOperationRequest<RedeemVoucherOperationResponse>>> {
        let operationRequest: RedeemVoucherOperationRequest<RedeemVoucherOperationResponse> = new RedeemVoucherOperationRequest<RedeemVoucherOperationResponse>(correlationId);
        return Promise.resolve(<ClientEntities.ICancelableDataResult<RedeemVoucherOperationRequest<RedeemVoucherOperationResponse>>>{
            canceled: false,
            data: operationRequest
        });
    };
export default getOperationRequest;