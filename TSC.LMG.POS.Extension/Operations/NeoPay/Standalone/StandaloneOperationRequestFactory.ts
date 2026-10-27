import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
import StandaloneOperationRequest from "./StandaloneOperationRequest";
import StandaloneOperationResponse from "./StandaloneOperationResponse";

let getOperationRequest: ExtensionOperationRequestFactoryFunctionType<StandaloneOperationResponse> =

    function (
        context: IOperationContext,
        operationId: number,
        actionParameters: string[],
        correlationId: string
    ): Promise<ClientEntities.ICancelableDataResult<StandaloneOperationRequest<StandaloneOperationResponse>>> {

        let operationRequest: StandaloneOperationRequest<StandaloneOperationResponse> = new StandaloneOperationRequest<StandaloneOperationResponse>(correlationId);
        return Promise.resolve(<ClientEntities.ICancelableDataResult<StandaloneOperationRequest<StandaloneOperationResponse>>>{
            canceled: false,
            data: operationRequest
        });
    };
export default getOperationRequest;