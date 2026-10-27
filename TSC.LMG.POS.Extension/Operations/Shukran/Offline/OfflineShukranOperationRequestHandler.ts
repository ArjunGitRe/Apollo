import OfflineShukranOperationResponse from "../../Shukran/Offline/OfflineShukranOperationResponse";
import OfflineShukranOperationRequest from "../../Shukran/Offline/OfflineShukranOperationRequest";
import { ExtensionOperationRequestHandlerBase, ExtensionOperationRequestType } from "PosApi/Create/Operations";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { ObjectExtensions, StringExtensions } from "PosApi/TypeExtensions";
import OfflineMobileNumberCaptureDialog from "../../../Dialogs/Shukran/Offline/OfflineMobileNumberCaptureDialog";
import { GetConnectionStatusClientRequest, GetConnectionStatusClientResponse } from "PosApi/Consume/Device";
import { SaveExtensionPropertiesOnCartClientRequest, SaveExtensionPropertiesOnCartClientResponse } from "PosApi/Consume/Cart";
import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";


export default class OfflineShukranOperationRequestHandler<TResponse extends OfflineShukranOperationResponse> extends ExtensionOperationRequestHandlerBase<TResponse> {
    
    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return OfflineShukranOperationRequest;
    }

    public executeAsync(request: OfflineShukranOperationRequest<TResponse>):
        Promise<ClientEntities.ICancelableDataResult<TResponse>> {

        return this._isPosOffline().then((isOffline: boolean) => {
            if (!isOffline) {
                // POS is online 
                return this._showMessage("POS is online. Shukran offline capture is not required — please use the standard Shukran flow.")
                    .then(() => {
                        return <ClientEntities.ICancelableDataResult<TResponse>>{
                            canceled: true,
                            data: null
                        };
                    });
            }

            const dialog: OfflineMobileNumberCaptureDialog = new OfflineMobileNumberCaptureDialog();

            return dialog.open().then((mobileNumber: string | null) => {
                if (StringExtensions.isNullOrWhitespace(mobileNumber)) {
                    return Promise.resolve(<ClientEntities.ICancelableDataResult<TResponse>>{
                        canceled: true,
                        data: null
                    });
                }

                return this._saveExtensionProperties(mobileNumber, true).then(() => {
                    const response: OfflineShukranOperationResponse =
                        new OfflineShukranOperationResponse();
                    return <ClientEntities.ICancelableDataResult<TResponse>>{
                        canceled: false,
                        data: <TResponse>response
                    };
                });
            });
        });
    }

    public _isPosOffline(): Promise<boolean> {
        const connectionRequest: GetConnectionStatusClientRequest<GetConnectionStatusClientResponse> =
            new GetConnectionStatusClientRequest();

        return this.context.runtime.executeAsync(connectionRequest)
            .then((result: ClientEntities.ICancelableDataResult<GetConnectionStatusClientResponse>) => {
                if (result.canceled || ObjectExtensions.isNullOrUndefined(result.data)) {
                    return false;
                }
                // Offline when POS is not connected to Retail Server (i.e. running on offline DB)
                return result.data.result !== ClientEntities.ConnectionStatusType.Online;
            })
            .catch(() => false);
    }

    public _saveExtensionProperties(mobileNumber: string, isOfflineCapture: boolean): Promise<void> {
        const mobileProperty: ProxyEntities.CommerceProperty = new ProxyEntities.CommercePropertyClass({
            Key: "OFFLINEMOBNUMBER",
            Value: new ProxyEntities.CommercePropertyValueClass({ StringValue: mobileNumber })
        });

        const offlineFlagProperty: ProxyEntities.CommerceProperty = new ProxyEntities.CommercePropertyClass({
            Key: "OFFLINETRANSACTION",
            Value: new ProxyEntities.CommercePropertyValueClass({ BooleanValue: isOfflineCapture })
        });

        const saveRequest: SaveExtensionPropertiesOnCartClientRequest<SaveExtensionPropertiesOnCartClientResponse> =
            new SaveExtensionPropertiesOnCartClientRequest([mobileProperty, offlineFlagProperty]);

        return this.context.runtime.executeAsync(saveRequest).then(() => { /* saved */ });
    }

    private _showMessage(message: string): Promise<void> {

        let options: IMessageDialogOptions = {
            message: message
        };

        let dialogRequest = new ShowMessageDialogClientRequest(options);
        return this.context.runtime.executeAsync(dialogRequest)
            .then(() => { /* acknowledged */ })
            .catch(() => { /* don't block on message failure */ });
    }

}
