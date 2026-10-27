import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
import GetTotalsOperationRequest from "./GetTotalsOperationRequest";
import GetTotalsOperationResponse from "./GetTotalsOperationResponse";


let getOperationRequest: ExtensionOperationRequestFactoryFunctionType<GetTotalsOperationResponse> =

    function (
        context: IOperationContext,
        operationId: number,
        actionParameters: string[],
        correlationId: string
    ): Promise<ClientEntities.ICancelableDataResult<GetTotalsOperationRequest<GetTotalsOperationResponse>>> {

        let operationRequest: GetTotalsOperationRequest<GetTotalsOperationResponse> = new GetTotalsOperationRequest<GetTotalsOperationResponse>(correlationId);
        return Promise.resolve(<ClientEntities.ICancelableDataResult<GetTotalsOperationRequest<GetTotalsOperationResponse>>>{
            canceled: false,
            data: operationRequest
        });
    };
export default getOperationRequest;