import ShukranEnrollOperationResponse from "../../Shukran/Enroll/ShukranEnrollOperationResponse";
import ShukranEnrollOperationRequest from "../../Shukran/Enroll/ShukranEnrollOperationRequest";
import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
let getOperationRequest: ExtensionOperationRequestFactoryFunctionType<ShukranEnrollOperationResponse> =

    function (
        context: IOperationContext,
        operationId: number,
        actionParameters: string[],
        correlationId: string

    ): Promise<ClientEntities.ICancelableDataResult<ShukranEnrollOperationRequest<ShukranEnrollOperationResponse>>> {
        let operationRequest: ShukranEnrollOperationRequest<ShukranEnrollOperationResponse> = new ShukranEnrollOperationRequest<ShukranEnrollOperationResponse>(correlationId);
        return Promise.resolve(<ClientEntities.ICancelableDataResult<ShukranEnrollOperationRequest<ShukranEnrollOperationResponse>>>{
            canceled: false,
            data: operationRequest
        });
    };
export default getOperationRequest;