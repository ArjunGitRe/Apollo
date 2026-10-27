import { ExtensionOperationRequestHandlerBase, ExtensionOperationRequestType } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
import SynchDateTimeOperationRequest from "./SynchDateTimeOperationRequest";
import SynchDateTimeOperationResponse from "./SynchDateTimeOperationResponse";
import { PaymentTerminalExecuteTaskRequest, PaymentTerminalExecuteTaskResponse } from "PosApi/Consume/Peripherals"
import NeoPayConsts from "../../../Models/NeoPayConsts";

export default class SynchDateTimeOperationRequestHandler<TResponse extends SynchDateTimeOperationResponse> extends ExtensionOperationRequestHandlerBase<TResponse> {

    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return SynchDateTimeOperationRequest;
    }

    public executeAsync(request: SynchDateTimeOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {
        let task = NeoPayConsts.SynchDateTime;
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
