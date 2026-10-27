import OfflineShukranOperationResponse from "../../Shukran/Offline/OfflineShukranOperationResponse";
import OfflineShukranOperationRequest from "../../Shukran/Offline/OfflineShukranOperationRequest";
import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
let getOperationRequest: ExtensionOperationRequestFactoryFunctionType<OfflineShukranOperationResponse> =

    function (
        context: IOperationContext,
        operationId: number,
        actionParameters: string[],
        correlationId: string

    ): Promise<ClientEntities.ICancelableDataResult<OfflineShukranOperationRequest<OfflineShukranOperationResponse>>> {
        let operationRequest: OfflineShukranOperationRequest<OfflineShukranOperationResponse> = new OfflineShukranOperationRequest<OfflineShukranOperationResponse>(correlationId);
        return Promise.resolve(<ClientEntities.ICancelableDataResult<OfflineShukranOperationRequest<OfflineShukranOperationResponse>>>{
            canceled: false,
            data: operationRequest
        });
    };
export default getOperationRequest;