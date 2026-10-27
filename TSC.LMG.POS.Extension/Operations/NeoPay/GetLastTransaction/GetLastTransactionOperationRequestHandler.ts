import { ExtensionOperationRequestHandlerBase, ExtensionOperationRequestType } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
import GetLastTransactionOperationRequest from "./GetLastTransactionOperationRequest";
import GetLastTransactionOperationResponse from "./GetLastTransactionOperationResponse";
import { PaymentTerminalExecuteTaskRequest, PaymentTerminalExecuteTaskResponse } from "PosApi/Consume/Peripherals"
import NeoPayConsts from "../../../Models/NeoPayConsts";

export default class GetLastTransactionOperationRequestHandler<TResponse extends GetLastTransactionOperationResponse> extends ExtensionOperationRequestHandlerBase<TResponse> {

    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return GetLastTransactionOperationRequest;
    }

    public executeAsync(request: GetLastTransactionOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {
        let task = NeoPayConsts.GetLastTransaction;
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
