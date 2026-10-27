import NcpiPayOperationRequest from "./NcpiPayOperationRequest";
import NcpiPayOperationResponse from "./NcpiPayOperationResponse";
import { ExtensionOperationRequestFactoryFunctionType, IOperationContext } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";

const getOperationRequest: ExtensionOperationRequestFactoryFunctionType<NcpiPayOperationResponse> =
    function (context: IOperationContext,
        operationId: number,
        actionParameters: string[],
        correlationId: string
    ): Promise<ClientEntities.ICancelableDataResult<NcpiPayOperationRequest<NcpiPayOperationResponse>>> {

        return Promise.resolve({
            canceled: false,
            data: new NcpiPayOperationRequest<NcpiPayOperationResponse>(correlationId)
        } as ClientEntities.ICancelableDataResult<NcpiPayOperationRequest<NcpiPayOperationResponse>>);
    };

export default getOperationRequest;