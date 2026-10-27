import AaniPayOperationRequest from "./AaniPayOperationRequest";
import AaniPayOperationResponse from "./AaniPayOperationResponse";
import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";

const getOperationRequest: ExtensionOperationRequestFactoryFunctionType<AaniPayOperationResponse> =
    function (
        _context: IOperationContext,
        _operationId: number,
        _actionParameters: string[],
        correlationId: string
    ): Promise<ClientEntities.ICancelableDataResult<AaniPayOperationRequest<AaniPayOperationResponse>>> {

        const operationRequest = new AaniPayOperationRequest<AaniPayOperationResponse>(correlationId);

        return Promise.resolve({
            canceled: false,
            data: operationRequest
        } as ClientEntities.ICancelableDataResult<AaniPayOperationRequest<AaniPayOperationResponse>>);
    };

export default getOperationRequest;