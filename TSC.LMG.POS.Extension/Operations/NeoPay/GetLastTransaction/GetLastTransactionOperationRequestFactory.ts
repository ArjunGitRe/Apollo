import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
import GetLastTransactionOperationRequest from "./GetLastTransactionOperationRequest";
import GetLastTransactionOperationResponse from "./GetLastTransactionOperationResponse";

let getOperationRequest: ExtensionOperationRequestFactoryFunctionType<GetLastTransactionOperationResponse> =

    function (
        context: IOperationContext,
        operationId: number,
        actionParameters: string[],
        correlationId: string
    ): Promise<ClientEntities.ICancelableDataResult<GetLastTransactionOperationRequest<GetLastTransactionOperationResponse>>> {

        let operationRequest: GetLastTransactionOperationRequest<GetLastTransactionOperationResponse> = new GetLastTransactionOperationRequest<GetLastTransactionOperationResponse>(correlationId);
        return Promise.resolve(<ClientEntities.ICancelableDataResult<GetLastTransactionOperationRequest<GetLastTransactionOperationResponse>>>{
            canceled: false,
            data: operationRequest
        });
    };
export default getOperationRequest;