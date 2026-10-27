import { CardPaymentRefundPaymentRequestHandler } from "PosApi/Extend/RequestHandlers/PeripheralsRequestHandlers";
import { CardPaymentRefundPaymentRequest, CardPaymentRefundPaymentResponse } from "PosApi/Consume/Peripherals";
import { GetCurrentCartClientRequest, GetCurrentCartClientResponse } from "PosApi/Consume/Cart";
import { GetSalesOrderDetailsByTransactionIdClientRequest, GetSalesOrderDetailsByTransactionIdClientResponse } from "PosApi/Consume/SalesOrders";
import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device";
import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { ObjectExtensions } from "PosApi/TypeExtensions";
import { StoreOperations } from "../../DataService/DataServiceRequests.g";
import NIPaymentDialog from "../../Dialogs/Network/NIPaymentDialog";
import { NIRequestType } from "../../Helper/NIRequestType";

/**
 * Override handler for CardPaymentRefundPaymentRequest.
 *
 * Intercepts D365's card refund flow and routes it through the NI
 * Push Payments terminal when the configured NI tender type is involved.
 * Falls back to the default refund handler for all other tender types.
 */
export default class NICardPaymentRefundPaymentRequestHandler extends CardPaymentRefundPaymentRequestHandler {

    private _niTenderId: string = "";
    private _niStatusInterval: number = 0;
    private _niMaxStatusCount: number = 0;

    public executeAsync(
        request: CardPaymentRefundPaymentRequest<CardPaymentRefundPaymentResponse>
    ): Promise<ClientEntities.ICancelableDataResult<CardPaymentRefundPaymentResponse>> {

        this.context.logger.logVerbose(
            "LMG NICardPaymentRefundPaymentRequestHandler: executing with request " + JSON.stringify(request)
        );

        if (ObjectExtensions.isNullOrUndefined(request)) {
            return Promise.reject(
                new ClientEntities.ExtensionError("CardPaymentRefundPaymentRequest was invalid.")
            );
        }

        let cart: ProxyEntities.Cart = null;

        return this.context.runtime.executeAsync(new GetCurrentCartClientRequest<GetCurrentCartClientResponse>())
            .then((cartResponse: ClientEntities.ICancelableDataResult<GetCurrentCartClientResponse>): Promise<ClientEntities.ICancelableDataResult<CardPaymentRefundPaymentResponse>> => {

                if (!(cartResponse.canceled || ObjectExtensions.isNullOrUndefined(cartResponse.data))) {
                    cart = cartResponse.data.result;
                }

                return this._loadDeviceConfig()
                    .then((): Promise<ClientEntities.ICancelableDataResult<CardPaymentRefundPaymentResponse>> => {

                        // Not NI tender or not configured → fall back to default
                        if (!this._niTenderId || !this._isNITender(request)) {
                            return super.defaultExecuteAsync(request);
                        }

                        if (ObjectExtensions.isNullOrUndefined(cart)) {
                            this._showMessage("Unable to retrieve the current cart.");
                            return this._cancelResult();
                        }

                        return this._niReturnWorkflow(cart, request);
                    });
            })
            .catch((err: any) => {
                this.context.logger.logError(
                    "NICardPaymentRefundPaymentRequestHandler: " + JSON.stringify(err)
                );
                this._showMessage("An error occurred during NI card return.");
                return this._cancelResult();
            });
    }

    // ─────────────────────────────────────────────────────────────
    //  NI Return workflow
    // ─────────────────────────────────────────────────────────────

    private _niReturnWorkflow(
        cart: ProxyEntities.Cart,
        request: CardPaymentRefundPaymentRequest<CardPaymentRefundPaymentResponse>
    ): Promise<ClientEntities.ICancelableDataResult<CardPaymentRefundPaymentResponse>> {

        const lineNo = (cart.TenderLines ? cart.TenderLines.length : 0) + 1;

        const returnLine = cart.CartLines
            ? cart.CartLines.find((l: ProxyEntities.CartLine) => !!l.ReturnTransactionId && !l.IsVoided)
            : null;

        if (!returnLine || !returnLine.ReturnTransactionId) {
            this._showMessage("Cannot find the original transaction for this return.");
            return this._cancelResult();
        }

        const returnTransactionId = returnLine.ReturnTransactionId;

        // Prefer the request amount; fall back to absolute AmountDue
        const refundAmountRequested = request.amount > 0
            ? request.amount
            : Math.abs(cart.AmountDue);

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
                    return Promise.reject(
                        "More than one NI card payment on original transaction. Please do a manual card return."
                    );
                }

                const activeLine = cardTenderLines[0];
                const activeTenderLineNo = activeLine.LineNumber;
                return this.context.runtime.executeAsync(
                    new StoreOperations.GetSourceRequest<StoreOperations.GetSourceResponse>(returnTransactionId, activeTenderLineNo)
                );
            })
            .then((sourceResp: ClientEntities.ICancelableDataResult<StoreOperations.GetSourceResponse>) => {

                if (!sourceResp.data.result || sourceResp.data.result.length === 0) {
                    return Promise.reject(
                        "Cannot find the original NI source ID. Please do a manual card return."
                    );
                }

                const origRecord = sourceResp.data.result[0];
                amountFromOrig = (+origRecord.Amount) / 100;

                if (refundAmountRequested > amountFromOrig) {
                    return Promise.reject("Return amount exceeds the original NI card payment amount.");
                }

                // skipAddingToTender = true — this handler returns IPaymentInfo
                // and D365's native refund pipeline handles adding the tender + Conclude
                const dialog = new NIPaymentDialog(this.context, cart.Id, this._niTenderId, amountFromOrig, lineNo.toString(), NIRequestType.Void,
                                                   origRecord.SourceId, "",this._niStatusInterval, this._niMaxStatusCount, true,"",false,"NI");

                return dialog.open().then(() => dialog);
            })
            .then((dialog: NIPaymentDialog): ClientEntities.ICancelableDataResult<CardPaymentRefundPaymentResponse> => {

                const transResult: string = (dialog as any).val;

                if (transResult === "true") {
                    const paymentInfo: ClientEntities.IPaymentInfo = <ClientEntities.IPaymentInfo>{
                        IsApproved: true,
                        ApprovedAmount: amountFromOrig,
                        CardNumberMasked: "",
                        PaymentSdkData: ""
                    };
                    return {
                        canceled: false,
                        data: new CardPaymentRefundPaymentResponse(paymentInfo)
                    };
                }

                return <ClientEntities.ICancelableDataResult<CardPaymentRefundPaymentResponse>>{
                    canceled: true,
                    data: null
                };
            })
            .catch((error: any) => {
                this.context.logger.logError("NI return flow: " + JSON.stringify(error));
                this._showMessage(
                    typeof error === "string" ? error : "An error occurred during card return."
                );
                return this._cancelResult();
            });
    }

    // ─────────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────────

    /**
     * Returns true if this refund request involves the NI tender type.
     * If tenderInfo.TenderId is null/empty, we assume NI (handle it).
     */
    private _isNITender(
        request: CardPaymentRefundPaymentRequest<CardPaymentRefundPaymentResponse>
    ): boolean {
        const reqTenderId = request.tenderInfo ? request.tenderInfo.TenderId : null;
        return !reqTenderId || reqTenderId === this._niTenderId;
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

    private _loadDeviceConfig(): Promise<void> {
        return this.context.runtime.executeAsync(
            new GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse>(
                this.context.logger.getNewCorrelationId()
            )
        ).then((response: ClientEntities.ICancelableDataResult<GetDeviceConfigurationClientResponse>) => {
            const props = response.data.result.ExtensionProperties || [];
            const find = (key: string): string =>
                props.find((p: ProxyEntities.CommerceProperty) => p.Key === key)?.Value?.StringValue || "";

            this._niTenderId = find("NIPAYMENTTENDERTYPE");

            const intervalRaw = find("NISTATUSINTERVAL");
            const maxCountRaw = find("NIMAXSTATUSCOUNT");

            this._niStatusInterval = intervalRaw && !isNaN(Number(intervalRaw)) ? Number(intervalRaw) : 5;
            this._niMaxStatusCount = maxCountRaw && !isNaN(Number(maxCountRaw)) ? Number(maxCountRaw) : 8;
        });
    }

    private _cancelResult(): Promise<ClientEntities.ICancelableDataResult<CardPaymentRefundPaymentResponse>> {
        return Promise.resolve(
            <ClientEntities.ICancelableDataResult<CardPaymentRefundPaymentResponse>>{ canceled: true, data: null }
        );
    }

    private _showMessage(message: string): void {
        const options: IMessageDialogOptions = { message };
        this.context.runtime.executeAsync(new ShowMessageDialogClientRequest(options));
    }
}