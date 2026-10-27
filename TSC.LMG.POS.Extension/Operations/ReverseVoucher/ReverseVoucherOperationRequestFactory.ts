import ReverseVoucherOperationResponse from "../../Operations/ReverseVoucher/ReverseVoucherOperationResponse";
import ReverseVoucherOperationRequest from "../../Operations/ReverseVoucher//ReverseVoucherOperationRequest";
import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
let getOperationRequest: ExtensionOperationRequestFactoryFunctionType<ReverseVoucherOperationResponse> =

    function (
        context: IOperationContext,
        operationId: number,
        actionParameters: string[],
        correlationId: string

    ): Promise<ClientEntities.ICancelableDataResult<ReverseVoucherOperationRequest<ReverseVoucherOperationResponse>>> {
        let operationRequest: ReverseVoucherOperationRequest<ReverseVoucherOperationResponse> = new ReverseVoucherOperationRequest<ReverseVoucherOperationResponse>(correlationId);
        return Promise.resolve(<ClientEntities.ICancelableDataResult<ReverseVoucherOperationRequest<ReverseVoucherOperationResponse>>>{
            canceled: false,
            data: operationRequest
        });
    };
export default getOperationRequest;