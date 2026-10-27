import ShukranProfileOperationResponse from "../../Shukran/Profile/ShukranProfileOperationResponse";
import ShukranProfileOperationRequest from "../../Shukran/Profile/ShukranProfileOperationRequest";
import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
let getOperationRequest: ExtensionOperationRequestFactoryFunctionType<ShukranProfileOperationResponse> =

    function (
        context: IOperationContext,
        operationId: number,
        actionParameters: string[],
        correlationId: string

    ): Promise<ClientEntities.ICancelableDataResult<ShukranProfileOperationRequest<ShukranProfileOperationResponse>>> {
        let operationRequest: ShukranProfileOperationRequest<ShukranProfileOperationResponse> = new ShukranProfileOperationRequest<ShukranProfileOperationResponse>(correlationId);
        return Promise.resolve(<ClientEntities.ICancelableDataResult<ShukranProfileOperationRequest<ShukranProfileOperationResponse>>>{
            canceled: false,
            data: operationRequest
        });
    };
export default getOperationRequest;