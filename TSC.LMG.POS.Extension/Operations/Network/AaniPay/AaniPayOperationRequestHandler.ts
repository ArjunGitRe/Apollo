import { ExtensionOperationRequestType, ExtensionOperationRequestHandlerBase } from "PosApi/Create/Operations";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { ObjectExtensions } from "PosApi/TypeExtensions";
import { GetCurrentCartClientRequest, GetCurrentCartClientResponse } from "PosApi/Consume/Cart";
import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device";
import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";
import NIPaymentDialog from "../../../Dialogs/Network/NIPaymentDialog";
import { NIRequestType } from "../../../Helper/NIRequestType";
import AaniPayOperationRequest from "../AaniPay/AaniPayOperationRequest";
import AaniPayOperationResponse from "./AaniPayOperationResponse";
import SearchShukranForPaymentRequest from "../../../RequestHandlers/Shukran/SearchShukranForPaymentRequest";
import SearchShukranForPaymentResponse from "../../../RequestHandlers/Shukran/SearchShukranForPaymentResponse";
import { StoreOperations } from "../../../DataService/DataServiceRequests.g";
import { GetSalesOrderDetailsByTransactionIdClientRequest, GetSalesOrderDetailsByTransactionIdClientResponse } from "PosApi/Consume/SalesOrders";

/**
 * Aani Pay Operation Handler — operation ID 500017.
 *
 * Uses the same NI Push Payments API and dialog as NI card payment,
 * but with:
 *   - transactionType = "pushPaymentIppSale"
 *   - Tender type from device config "AANIPAYTENDERTYPE"
 *   - Treated as cash (no card fields on tender line)
 */
export default class AaniPayOperationRequestHandler<TResponse extends AaniPayOperationResponse>
    extends ExtensionOperationRequestHandlerBase<TResponse> {

    private _aaniTenderId: string = "";
    private _niStatusInterval: number = 5;
    private _niMaxStatusCount: number = 8;

    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return AaniPayOperationRequest;
    }

    public executeAsync(request: AaniPayOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {

        return this.context.runtime.executeAsync(new GetCurrentCartClientRequest<GetCurrentCartClientResponse>())
            .then((cartResponse: ClientEntities.ICancelableDataResult<GetCurrentCartClientResponse>) => {

                if (ObjectExtensions.isNullOrUndefined(cartResponse?.data?.result)) {
                    this._showMessage("Unable to retrieve the current cart.");
                    return { canceled: true, data: new AaniPayOperationResponse() as TResponse };
                }

                const cart = cartResponse.data.result;

                if (!cart.CartLines || cart.CartLines.length === 0) {
                    this._showMessage("No items in the cart.");
                    return { canceled: true, data: new AaniPayOperationResponse() as TResponse };
                }

                if (cart.AmountDue === 0) {
                    this._showMessage("Amount due is zero. No payment needed.");
                    return { canceled: true, data: new AaniPayOperationResponse() as TResponse };
                }

                return this.context.runtime.executeAsync(new SearchShukranForPaymentRequest<SearchShukranForPaymentResponse>(cart))
                    .then((shukranResp: ClientEntities.ICancelableDataResult<SearchShukranForPaymentResponse>) => {

                    if (shukranResp.data.canceled) {
                        // Navigated to profile view or enrollment — cashier retries after linking
                        return { canceled: true, data: new AaniPayOperationResponse() as TResponse };
                    }

                    return this._loadDeviceConfig()
                        .then(() => {

                            if (!this._aaniTenderId) {
                                this._showMessage(
                                    "Aani Pay tender type is not configured. " +
                                    "Please check AANIPAYTENDERTYPE in device config."
                                );
                                return { canceled: true, data: new AaniPayOperationResponse() as TResponse };
                            }

                            if (cart.AmountDue > 0) {
                                return this._aaniSaleWorkflow(cart);
                            } else if (cart.AmountDue < 0) {
                                return this._aaniReturnWorkflow(cart);
                            } else {
                                return { canceled: true, data: new AaniPayOperationResponse() as TResponse };
                            }

                            //const lineNo = (cart.TenderLines ? cart.TenderLines.length : 0) + 1;

                            //const dialog = new NIPaymentDialog(
                            //    this.context, cart.Id, this._aaniTenderId, cart.AmountDue, lineNo.toString(), NIRequestType.Sale,
                            //    "", "", this._niStatusInterval, this._niMaxStatusCount, false, "pushPaymentIppSale", true,"AANI");

                            //return dialog.open()
                            //    .then((): ClientEntities.ICancelableDataResult<TResponse> => {
                            //        return { canceled: false, data: new AaniPayOperationResponse() as TResponse };
                            //    });
                        });
                });
                
            })
            .catch((error: any) => {
                this.context.logger.logError("AaniPayOperationRequestHandler: " + JSON.stringify(error));
                this._showMessage("An error occurred during Aani Pay.");
                return { canceled: true, data: new AaniPayOperationResponse() as TResponse };
            });
    }

    private _aaniSaleWorkflow(cart: ProxyEntities.Cart): Promise<ClientEntities.ICancelableDataResult<TResponse>> {

        const lineNo = (cart.TenderLines ? cart.TenderLines.length : 0) + 1;

        const dialog = new NIPaymentDialog(this.context, cart.Id, this._aaniTenderId, cart.AmountDue, lineNo.toString(), NIRequestType.Sale,
            "", "", this._niStatusInterval, this._niMaxStatusCount, false, "pushPaymentIppSale", true, "AANI");

        return dialog.open()
            .then((): ClientEntities.ICancelableDataResult<TResponse> => {
                return { canceled: false, data: new AaniPayOperationResponse() as TResponse };
            });
    }


    private _aaniReturnWorkflow(cart: ProxyEntities.Cart): Promise<ClientEntities.ICancelableDataResult<TResponse>> {

        const lineNo = (cart.TenderLines ? cart.TenderLines.length : 0) + 1;
        const returnLine = cart.CartLines
            ? cart.CartLines.find((l: ProxyEntities.CartLine) => !!l.ReturnTransactionId && !l.IsVoided)
            : null;

        if (!returnLine || !returnLine.ReturnTransactionId) {
            this._showMessage("Cannot find the original transaction for this return.");
            return Promise.resolve({ canceled: true, data: new AaniPayOperationResponse() as TResponse });
        }

        const returnTransactionId = returnLine.ReturnTransactionId;
        let amountFromOrig = 0;

        return this._getSalesOrderDetails(returnTransactionId)
            .then((salesOrder: ProxyEntities.SalesOrder) => {

                const aaniTenderLines = salesOrder.TenderLines.filter(
                    (t: ProxyEntities.TenderLine) =>
                        t.TenderTypeId === this._aaniTenderId &&
                        t.VoidStatusValue !== 1 &&
                        t.Amount > 0
                );

                if (aaniTenderLines.length === 0) {
                    return Promise.reject("No Aani Pay payment found on the original transaction.");
                }
                if (aaniTenderLines.length > 1) {
                    return Promise.reject(
                        "More than one Aani Pay payment on original transaction. Please do a manual return."
                    );
                }

                const activeLine = aaniTenderLines[0];
                const activeTenderLineNo = activeLine.LineNumber;

                return this.context.runtime.executeAsync(
                    new StoreOperations.GetSourceRequest<StoreOperations.GetSourceResponse>(returnTransactionId,activeTenderLineNo )
                );
            })
            .then((sourceResp: ClientEntities.ICancelableDataResult<StoreOperations.GetSourceResponse>) => {

                if (!sourceResp.data.result || sourceResp.data.result.length === 0) {
                    return Promise.reject(
                        "Cannot find the original Aani Pay source ID. Please do a manual return."
                    );
                }

                const origRecord = sourceResp.data.result[0];
                amountFromOrig = (+origRecord.Amount) / 100;

                const originalId = origRecord.PaymentId && origRecord.PaymentId !== ""
                    ? origRecord.PaymentId       
                    : origRecord.SourceId;  

                if ((cart.AmountDue * -1) > amountFromOrig) {
                    return Promise.reject("Return amount exceeds the original Aani Pay payment amount.");
                }

                //const returnAmount = cart.AmountDue * -1;  

                const dialog = new NIPaymentDialog(this.context, cart.Id, this._aaniTenderId, amountFromOrig, lineNo.toString(), NIRequestType.Void,
                    originalId, "", this._niStatusInterval, this._niMaxStatusCount, true, "pushPaymentIppRefund", true, "AANI");

                return dialog.open();
            })
            .then((): ClientEntities.ICancelableDataResult<TResponse> => {
                return { canceled: false, data: new AaniPayOperationResponse() as TResponse };
            })
            .catch((error: any) => {
                this.context.logger.logError("Aani return flow: " + JSON.stringify(error));
                this._showMessage(
                    typeof error === "string" ? error : "An error occurred during Aani Pay return."
                );
                return { canceled: true, data: new AaniPayOperationResponse() as TResponse };
            });
    }


    // ─────────────────────────────────────────────────────────────
    //  Device config — reads AANIPAYTENDERTYPE + NI polling settings
    // ─────────────────────────────────────────────────────────────

    private _loadDeviceConfig(): Promise<void> {
        return this.context.runtime.executeAsync(
            new GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse>(
                this.context.logger.getNewCorrelationId()
            )
        ).then((response: ClientEntities.ICancelableDataResult<GetDeviceConfigurationClientResponse>) => {
            const props = response.data.result.ExtensionProperties || [];
            const find = (key: string): string =>
                props.find((p: ProxyEntities.CommerceProperty) => p.Key === key)?.Value?.StringValue || "";

            this._aaniTenderId = find("AANIPAYTENDERTYPE");

            const intervalRaw = find("NISTATUSINTERVAL");
            const maxCountRaw = find("NIMAXSTATUSCOUNT");

            this._niStatusInterval = intervalRaw && !isNaN(Number(intervalRaw)) ? Number(intervalRaw) : 5;
            this._niMaxStatusCount = maxCountRaw && !isNaN(Number(maxCountRaw)) ? Number(maxCountRaw) : 8;
        });
    }

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