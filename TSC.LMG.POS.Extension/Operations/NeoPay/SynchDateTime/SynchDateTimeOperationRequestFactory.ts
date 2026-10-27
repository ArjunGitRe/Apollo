import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
import SynchDateTimeOperationRequest from "./SynchDateTimeOperationRequest";
import SynchDateTimeOperationResponse from "./SynchDateTimeOperationResponse";

let getOperationRequest: ExtensionOperationRequestFactoryFunctionType<SynchDateTimeOperationResponse> =

    function (
        context: IOperationContext,
        operationId: number,
        actionParameters: string[],
        correlationId: string
    ): Promise<ClientEntities.ICancelableDataResult<SynchDateTimeOperationRequest<SynchDateTimeOperationResponse>>> {

        let operationRequest: SynchDateTimeOperationRequest<SynchDateTimeOperationResponse> = new SynchDateTimeOperationRequest<SynchDateTimeOperationResponse>(correlationId);
        return Promise.resolve(<ClientEntities.ICancelableDataResult<SynchDateTimeOperationRequest<SynchDateTimeOperationResponse>>>{
            canceled: false,
            data: operationRequest
        });
    };
export default getOperationRequest;