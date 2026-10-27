import { ExtensionOperationRequestHandlerBase, ExtensionOperationRequestType } from "PosApi/Create/Operations";
import { ClientEntities } from "PosApi/Entities";
import StandaloneOperationRequest from "./StandaloneOperationRequest";
import StandaloneOperationResponse from "./StandaloneOperationResponse";
import { PaymentTerminalExecuteTaskRequest, PaymentTerminalExecuteTaskResponse } from "PosApi/Consume/Peripherals"
import NeoPayConsts from "../../../Models/NeoPayConsts";

export default class SynchDateTimeOperationRequestHandler<TResponse extends StandaloneOperationResponse> extends ExtensionOperationRequestHandlerBase<TResponse> {

    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return StandaloneOperationRequest;
    }

    public executeAsync(request: StandaloneOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {
        let task = NeoPayConsts.StandAlone;
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
