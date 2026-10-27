import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
import ReconciliationOperationRequest from "./ReconciliationOperationRequest";
import ReconciliationOperationResponse from "./ReconciliationOperationResponse";

let getOperationRequest: ExtensionOperationRequestFactoryFunctionType<ReconciliationOperationResponse> =

    function (
        context: IOperationContext,
        operationId: number,
        actionParameters: string[],
        correlationId: string
    ): Promise<ClientEntities.ICancelableDataResult<ReconciliationOperationRequest<ReconciliationOperationResponse>>> {

        let operationRequest: ReconciliationOperationRequest<ReconciliationOperationResponse> = new ReconciliationOperationRequest<ReconciliationOperationResponse>(correlationId);
        return Promise.resolve(<ClientEntities.ICancelableDataResult<ReconciliationOperationRequest<ReconciliationOperationResponse>>>{
            canceled: false,
            data: operationRequest
        });
    };
export default getOperationRequest;