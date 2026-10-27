import NIPaymentOperationRequest from "./NIPaymentOperationRequest";
import NIPaymentOperationResponse from "./NIPaymentOperationResponse";
import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";

const getOperationRequest: ExtensionOperationRequestFactoryFunctionType<NIPaymentOperationResponse> =
    function (
        _context: IOperationContext,
        _operationId: number,
        _actionParameters: string[],
        correlationId: string
    ): Promise<ClientEntities.ICancelableDataResult<NIPaymentOperationRequest<NIPaymentOperationResponse>>> {

        const operationRequest = new NIPaymentOperationRequest<NIPaymentOperationResponse>(correlationId);

        return Promise.resolve({
            canceled: false,
            data: operationRequest
        } as ClientEntities.ICancelableDataResult<NIPaymentOperationRequest<NIPaymentOperationResponse>>);
    };

export default getOperationRequest;