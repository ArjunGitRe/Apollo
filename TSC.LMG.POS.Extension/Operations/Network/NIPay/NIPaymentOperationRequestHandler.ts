import { ExtensionOperationRequestType, ExtensionOperationRequestHandlerBase } from "PosApi/Create/Operations";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { ObjectExtensions } from "PosApi/TypeExtensions";
import { GetCurrentCartClientRequest, GetCurrentCartClientResponse } from "PosApi/Consume/Cart";
import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device";
import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";
import { StoreOperations } from "../../../DataService/DataServiceRequests.g";
import { GetSalesOrderDetailsByTransactionIdClientRequest, GetSalesOrderDetailsByTransactionIdClientResponse } from "PosApi/Consume/SalesOrders";
import NIPaymentOperationRequest from "./NIPaymentOperationRequest";
import NIPaymentOperationResponse from "./NIPaymentOperationResponse";
import NIPaymentDialog from "../../../Dialogs/Network/NIPaymentDialog";
import { NIRequestType } from "../../../Helper/NIRequestType";
import SearchShukranForPaymentRequest from "../../../RequestHandlers/Shukran/SearchShukranForPaymentRequest";
import SearchShukranForPaymentResponse from "../../../RequestHandlers/Shukran/SearchShukranForPaymentResponse";

/**
 * NI Payment Operation Handler.
 *
 * Assigned to a button on the POS transaction screen (operation ID 500015).
 * Replaces the NI-related code previously in PrePaymentTrigger.
 *
 * Flow:
 *   1. Get current cart + device config
 *   2. AmountDue > 0  → sale workflow  (NIPaymentDialog, NIRequestType.Sale)
 *   3. AmountDue < 0  → return workflow (fetch original sourceId, NIPaymentDialog, NIRequestType.Void)
 *   4. AmountDue == 0 → nothing to pay
 */
export default class NIPaymentOperationRequestHandler<TResponse extends NIPaymentOperationResponse> extends ExtensionOperationRequestHandlerBase<TResponse>
{

    private _niTenderId: string = "";
    private _niStatusInterval: number = 0;
    private _niMaxStatusCount: number = 0;

    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return NIPaymentOperationRequest;
    }

    public executeAsync(request: NIPaymentOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {

        return this.context.runtime.executeAsync(new GetCurrentCartClientRequest<GetCurrentCartClientResponse>())
            .then((cartResponse: ClientEntities.ICancelableDataResult<GetCurrentCartClientResponse>) => {

                if (ObjectExtensions.isNullOrUndefined(cartResponse?.data?.result)) {
                    this._showMessage("Unable to retrieve the current cart.");
                    return { canceled: true, data: new NIPaymentOperationResponse() as TResponse };
                }

                const cart = cartResponse.data.result;
                if (!cart.CartLines || cart.CartLines.length === 0) {
                    this._showMessage("No items in the cart.");
                    return { canceled: true, data: new NIPaymentOperationResponse() as TResponse };
                }

                return this.context.runtime.executeAsync(new SearchShukranForPaymentRequest<SearchShukranForPaymentResponse>(cart))
                    .then((shukranResp: ClientEntities.ICancelableDataResult<SearchShukranForPaymentResponse>) => {
                        if (shukranResp.data.canceled) {
                            // Navigated to profile view or enrollment — cashier retries after linking
                            return { canceled: true, data: new NIPaymentOperationResponse() as TResponse };
                        }

                        return this._loadDeviceConfig()
                            .then(() => {

                                if (!this._niTenderId) {
                                    this._showMessage("NI Payment tender type is not configured. Please check NIPAYMENTTENDERTYPE in device config.");
                                    return { canceled: true, data: new NIPaymentOperationResponse() as TResponse };
                                }

                                if (cart.AmountDue > 0) {
                                    return this._niSaleWorkflow(cart);
                                } else if (cart.AmountDue < 0) {
                                    return this._niReturnWorkflow(cart);
                                } else {
                                    this._showMessage("Amount due is zero. No payment needed.");
                                    return { canceled: true, data: new NIPaymentOperationResponse() as TResponse };
                                }
                            });
                    })
                
            })
            .catch((err: any) => {
                this.context.logger.logError("NIPaymentOperationRequestHandler: " + JSON.stringify(err));
                this._showMessage("An error occurred initiating NI payment.");
                return { canceled: true, data: new NIPaymentOperationResponse() as TResponse };
            });
    }

    // ─────────────────────────────────────────────────────────────
    //  Sale workflow
    // ─────────────────────────────────────────────────────────────

    private _niSaleWorkflow(cart: ProxyEntities.Cart): Promise<ClientEntities.ICancelableDataResult<TResponse>> {

        const lineNo = (cart.TenderLines ? cart.TenderLines.length : 0) + 1;

        const dialog = new NIPaymentDialog(this.context, cart.Id, this._niTenderId, cart.AmountDue, lineNo.toString(), NIRequestType.Sale, "", "",
                                           this._niStatusInterval, this._niMaxStatusCount,false,"",false,"NI" );

        return dialog.open().then(() => {
            return { canceled: false, data: new NIPaymentOperationResponse() as TResponse };
        });
    }

    // ─────────────────────────────────────────────────────────────
    //  Return workflow
    // ─────────────────────────────────────────────────────────────

    private _niReturnWorkflow(cart: ProxyEntities.Cart): Promise<ClientEntities.ICancelableDataResult<TResponse>> {

        const lineNo = (cart.TenderLines ? cart.TenderLines.length : 0) + 1;
        const returnLine = cart.CartLines
            ? cart.CartLines.find((l: ProxyEntities.CartLine) => !!l.ReturnTransactionId && !l.IsVoided)
            : null;

        if (!returnLine || !returnLine.ReturnTransactionId) {
            this._showMessage("Cannot find the original transaction for this return.");
            return Promise.resolve({ canceled: true, data: new NIPaymentOperationResponse() as TResponse });
        }

        const returnTransactionId = returnLine.ReturnTransactionId;
        let amountFromOrig = 0;

        return this._getSalesOrderDetails(returnTransactionId)
            .then((salesOrder: ProxyEntities.SalesOrder) => {

                const cardTenderLines = salesOrder.TenderLines.filter(
                    (t: ProxyEntities.TenderLine) =>
                        t.TenderTypeId === this._niTenderId && t.VoidStatusValue !== 1 && t.RefundableAmount > 0
                );

                if (cardTenderLines.length === 0) {
                    return Promise.reject("No NI card payment found on the original transaction.");
                }
                if (cardTenderLines.length > 1) {
                    return Promise.reject("More than one NI card payment on original transaction. Please do a manual card return.");
                }

                const activeLine = cardTenderLines[0];
                const activeTenderLineNo = activeLine.LineNumber;
                return this.context.runtime.executeAsync(
                    new StoreOperations.GetSourceRequest<StoreOperations.GetSourceResponse>(returnTransactionId, activeTenderLineNo)
                );
            })
            .then((sourceResp: ClientEntities.ICancelableDataResult<StoreOperations.GetSourceResponse>) => {

                if (!sourceResp.data.result || sourceResp.data.result.length === 0) {
                    return Promise.reject("Cannot find the original NI source ID. Please do a manual card return.");
                }

                const origRecord = sourceResp.data.result[0];
                amountFromOrig = (+origRecord.Amount) / 100;

                if ((cart.AmountDue * -1) > amountFromOrig) {
                    return Promise.reject("Return amount exceeds the original NI card payment amount.");
                }

               // const returnAmount = cart.AmountDue * -1;  

                const txnDate = new Date(origRecord.TransactionDate);   // from DB TRANSACTIONDATE
                const today = new Date();
                const isSameDay = txnDate.getFullYear() === today.getFullYear() &&
                    txnDate.getMonth() === today.getMonth() &&
                    txnDate.getDate() === today.getDate();

                const isRefund = !isSameDay;   // true = genericRefund, false = pushPaymentVoid
                //const transactionTypeOverride = "";          // let CRT decide from isRefund flag

                const dialog = new NIPaymentDialog(this.context, cart.Id, this._niTenderId, amountFromOrig, lineNo.toString(), NIRequestType.Void,
                    origRecord.SourceId, "", this._niStatusInterval, this._niMaxStatusCount, isRefund,"",false,"NI");

                return dialog.open();
            })
            .then(() => {
                return { canceled: false, data: new NIPaymentOperationResponse() as TResponse };
            })
            .catch((error: any) => {
                this.context.logger.logError("NI return flow: " + JSON.stringify(error));
                this._showMessage(typeof error === "string" ? error : "An error occurred during card return.");
                return { canceled: true, data: new NIPaymentOperationResponse() as TResponse };
            });
    }

    // ─────────────────────────────────────────────────────────────
    //  Device config — NI-specific properties only
    // ─────────────────────────────────────────────────────────────

    private _loadDeviceConfig(): Promise<void> {

        return this.context.runtime.executeAsync( new GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse>(this.context.logger.getNewCorrelationId()))
        .then((response: ClientEntities.ICancelableDataResult<GetDeviceConfigurationClientResponse>) => {

            const props = response.data.result.ExtensionProperties || [];

            const find = (key: string): string => props.find((p: ProxyEntities.CommerceProperty) => p.Key === key)?.Value?.StringValue || "";

            this._niTenderId = find("NIPAYMENTTENDERTYPE");

            const intervalRaw = find("NISTATUSINTERVAL");
            const maxCountRaw = find("NIMAXSTATUSCOUNT");

            this._niStatusInterval = intervalRaw && !isNaN(Number(intervalRaw)) ? Number(intervalRaw) : 5;
            this._niMaxStatusCount = maxCountRaw && !isNaN(Number(maxCountRaw)) ? Number(maxCountRaw) : 8;
        });
    }

    // ─────────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────────

    private _getSalesOrderDetails(transactionId: string): Promise<ProxyEntities.SalesOrder> {
        const correlationId = this.context.logger.getNewCorrelationId();
        return this.context.runtime.executeAsync(
            new GetSalesOrderDetailsByTransactionIdClientRequest<GetSalesOrderDetailsByTransactionIdClientResponse>(
                transactionId, ProxyEntities.SearchLocation.All, correlationId
            )
        ).then((resp: ClientEntities.ICancelableDataResult<GetSalesOrderDetailsByTransactionIdClientResponse>) => {
            return resp.data.result;
        });
    }

    private _showMessage(message: string): void {
        const options: IMessageDialogOptions = { message };
        this.context.runtime.executeAsync(new ShowMessageDialogClientRequest(options));
    }
}