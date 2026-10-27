import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
import DuplicateOperationRequest from "./DuplicateOperationRequest";
import DuplicateOperationResponse from "./DuplicateOperationResponse";

let getOperationRequest: ExtensionOperationRequestFactoryFunctionType<DuplicateOperationResponse> =

    function (
        context: IOperationContext,
        operationId: number,
        actionParameters: string[],
        correlationId: string
    ): Promise<ClientEntities.ICancelableDataResult<DuplicateOperationRequest<DuplicateOperationResponse>>> {

        let operationRequest: DuplicateOperationRequest<DuplicateOperationResponse> = new DuplicateOperationRequest<DuplicateOperationResponse>(correlationId);
        return Promise.resolve(<ClientEntities.ICancelableDataResult<DuplicateOperationRequest<DuplicateOperationResponse>>>{
            canceled: false,
            data: operationRequest
        });
    };
export default getOperationRequest;