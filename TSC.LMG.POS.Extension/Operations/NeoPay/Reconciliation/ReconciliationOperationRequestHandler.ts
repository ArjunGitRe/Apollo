import { PaymentTerminalExecuteTaskRequest, PaymentTerminalExecuteTaskResponse } from "PosApi/Consume/Peripherals";
import { ExtensionOperationRequestHandlerBase, ExtensionOperationRequestType } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
import NeoPayConsts from "../../../Models/NeoPayConsts";
import ReconciliationOperationRequest from "./ReconciliationOperationRequest";
import ReconciliationOperationResponse from "./ReconciliationOperationResponse";

export default class ReconciliationOperationRequestHandler<TResponse extends ReconciliationOperationResponse> extends ExtensionOperationRequestHandlerBase<TResponse> {

    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return ReconciliationOperationRequest;
    }

    public executeAsync(request: ReconciliationOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {
        let task = NeoPayConsts.Reconciliation;
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
