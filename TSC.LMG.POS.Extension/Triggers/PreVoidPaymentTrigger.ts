//import * as Triggers from "PosApi/Extend/Triggers/PaymentTriggers";
//import { ClientEntities, ProxyEntities } from "PosApi/Entities";
//import { ObjectExtensions } from "PosApi/TypeExtensions";
//import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device";
//import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";
//import NIPaymentDialog from "../Dialogs/Network/NIPaymentDialog";
//import { NIRequestType } from "../Helper/NIRequestType";


//export default class PreVoidPaymentTrigger extends Triggers.PreVoidPaymentTrigger {

//    private _niStatusInterval: number;
//    private _niMaxStatusCount: number;

//    public execute(options: Triggers.IPreVoidPaymentTriggerOptions): Promise<ClientEntities.ICancelable> {
//        this.context.logger.logVerbose(
//            "LMG PreVoidPaymentTrigger: executing with options " + JSON.stringify(options)
//        );

//        if (ObjectExtensions.isNullOrUndefined(options)) {
//            return Promise.reject(
//                new ClientEntities.ExtensionError("PreVoidPaymentTrigger options were invalid.")
//            );
//        }

//        const tenderLine = options.tenderLines[0];
//        const cart = options.cart;

        
//        const niInvoiceNo = tenderLine.ExtensionProperties
//            .filter((p: ProxyEntities.CommerceProperty) => p.Key === "NI_INVOICENO")
//            .map((p: ProxyEntities.CommerceProperty) => p.Value.StringValue)[0] ?? "";

//        const lineNo = tenderLine.ExtensionProperties
//            .filter((p: ProxyEntities.CommerceProperty) => p.Key === "NI_Line")
//            .map((p: ProxyEntities.CommerceProperty) => p.Value.StringValue)[0] ?? "1";

//        const tenderTypeId = tenderLine.TenderTypeId;

        
//        if (!niInvoiceNo) {
//            return Promise.resolve({ canceled: false });
//        }

       
//        if (tenderLine.Amount < 0) {
//            this._showMessage("Payment already voided by NI. Cannot void again.");
//            return Promise.resolve({ canceled: true });
//        }

       
//        return this._loadDeviceConfig()
//            .then(() => {
//                const dialog = new NIPaymentDialog(this.context, cart.Id,tenderTypeId,tenderLine.Amount,lineNo,NIRequestType.Void, niInvoiceNo,"", this._niStatusInterval,this._niMaxStatusCount);

//                return dialog.open()
//                    .then((): any => {
//                        const transResult: string = dialog.val;
//                        if (transResult === "true") {
                            
//                            return Promise.resolve({ canceled: false });
//                        } else {
                            
//                            return Promise.resolve({ canceled: true });
//                        }
//                    });
//            })
//            .catch((error: any) => {
//                this.context.logger.logError(
//                    "LMG PreVoidPaymentTrigger: " + JSON.stringify(error)
//                );
//                return Promise.resolve({ canceled: true });
//            });
//    }

   
//    private _loadDeviceConfig(): Promise<void> {
//        const deviceReq = new GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse>(
//            this.context.logger.getNewCorrelationId()
//        );

//        return this.context.runtime.executeAsync(deviceReq)
//            .then((response: ClientEntities.ICancelableDataResult<GetDeviceConfigurationClientResponse>) => {
//                const props = response.data.result.ExtensionProperties || [];

//                const find = (key: string): string => props.find((p: ProxyEntities.CommerceProperty) => p.Key === key) ?.Value?.StringValue || "";

//                const intervalRaw = find("NISTATUSINTERVAL");
//                const maxCountRaw = find("NIMAXSTATUSCOUNT");

//                this._niStatusInterval = intervalRaw && !isNaN(Number(intervalRaw))? Number(intervalRaw) : 5;
//                this._niMaxStatusCount = maxCountRaw && !isNaN(Number(maxCountRaw))? Number(maxCountRaw) : 12;
//            });
//    }

//    private _showMessage(message: string): void {
//        const options: IMessageDialogOptions = { message };
//        this.context.runtime.executeAsync(new ShowMessageDialogClientRequest(options));
//    }
//}