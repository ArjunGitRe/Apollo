import { PaymentTerminalExecuteTaskRequest, PaymentTerminalExecuteTaskResponse } from "PosApi/Consume/Peripherals";
import { ExtensionOperationRequestHandlerBase, ExtensionOperationRequestType } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
import NeoPayConsts from "../../../Models/NeoPayConsts";
import GetTotalsOperationRequest from "./GetTotalsOperationRequest";
import GetTotalsOperationResponse from "./GetTotalsOperationResponse";

export default class GetTotalsOperationRequestHandler<TResponse extends GetTotalsOperationResponse> extends ExtensionOperationRequestHandlerBase<TResponse> {

    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return GetTotalsOperationRequest;
    }

    public executeAsync(request: GetTotalsOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {
        let task = NeoPayConsts.GetTotals;
        let extensionProps: ClientEntities.IExtensionTransaction = {
            ExtensionProperties: []
        };

        let executeTaskRequest = new PaymentTerminalExecuteTaskRequest<PaymentTerminalExecuteTaskResponse>(task, extensionProps);
        return this.context.runtime.executeAsync(executeTaskRequest)
            .then((result: ClientEntities.ICancelableDataResult<PaymentTerminalExecuteTaskResponse>) => {
                return Promise.resolve({ canceled: true, data: null });
            });
    }

}
