import { CardPaymentVoidPaymentRequestHandler } from "PosApi/Extend/RequestHandlers/PeripheralsRequestHandlers";
import { CardPaymentVoidPaymentRequest, CardPaymentVoidPaymentResponse } from "PosApi/Consume/Peripherals";
import { GetCurrentCartClientRequest, GetCurrentCartClientResponse } from "PosApi/Consume/Cart";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { ObjectExtensions } from "PosApi/TypeExtensions";
import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device";
import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";
import NIPaymentDialog from "../../Dialogs/Network/NIPaymentDialog";
import { NIRequestType } from "../../Helper/NIRequestType";


export default class NICardPaymentVoidPaymentRequestHandler extends CardPaymentVoidPaymentRequestHandler {

    private _niStatusInterval: number;
    private _niMaxStatusCount: number;

    public executeAsync(request: CardPaymentVoidPaymentRequest<CardPaymentVoidPaymentResponse>): Promise<ClientEntities.ICancelableDataResult<CardPaymentVoidPaymentResponse>> {
        this.context.logger.logVerbose(
            "LMG NICardPaymentVoidPaymentRequestHandler: executing with request " + JSON.stringify(request)
        );

        if (ObjectExtensions.isNullOrUndefined(request)) {
            return Promise.reject(
                new ClientEntities.ExtensionError("CardPaymentVoidPaymentRequest was invalid.")
            );
        }

        let cart: ProxyEntities.Cart = null;

        return this.context.runtime.executeAsync(new GetCurrentCartClientRequest<GetCurrentCartClientResponse>())
            .then((result: ClientEntities.ICancelableDataResult<GetCurrentCartClientResponse>): Promise<ClientEntities.ICancelableDataResult<CardPaymentVoidPaymentResponse>> => {

                if (!(result.canceled || ObjectExtensions.isNullOrUndefined(result.data))) {
                    cart = result.data.result;
                }

                // Find the tender line on the cart that this void targets.
                const tenderLine = this._findTenderLine(cart, request);

                const extProps = (tenderLine && tenderLine.ExtensionProperties) || [];

                const find = (key: string): string => extProps
                    .filter((p: ProxyEntities.CommerceProperty) => p.Key === key)
                    .map((p: ProxyEntities.CommerceProperty) => p.Value.StringValue)[0] ?? "";

                const niInvoiceNo = find("NI_INVOICENO");
                const lineNo = find("NI_Line") || "1";
                const tenderTypeId = (tenderLine && tenderLine.TenderTypeId) || "";

                // Not an NI payment -> let the default void handler run.
                if (!niInvoiceNo) {
                    return super.defaultExecuteAsync(request);
                }

                // Already voided by NI.
                if (request.amount < 0 || (tenderLine && tenderLine.Amount < 0)) {
                    this._showMessage("Payment already voided by NI. Cannot void again.");
                    return Promise.resolve(<ClientEntities.ICancelableDataResult<CardPaymentVoidPaymentResponse>>{
                        canceled: true,
                        data: null
                    });
                }

                // NI payment -> run the NI void dialog.
                return this._loadDeviceConfig()
                    .then(() => {
                        const dialog = new NIPaymentDialog(this.context, cart.Id, tenderTypeId, request.amount, lineNo, NIRequestType.Void,
                            niInvoiceNo, "", this._niStatusInterval, this._niMaxStatusCount,false,"",false,"NI");

                        return dialog.open()
                            .then((): ClientEntities.ICancelableDataResult<CardPaymentVoidPaymentResponse> => {
                                const transResult: string = dialog.val;
                                if (transResult === "true") {
                                    const paymentInfo: ClientEntities.IPaymentInfo = <ClientEntities.IPaymentInfo>{
                                        IsApproved: true,
                                        ApprovedAmount: request.amount
                                    };
                                    return {
                                        canceled: false,
                                        data: new CardPaymentVoidPaymentResponse(paymentInfo)
                                    };
                                } else {
                                    return <ClientEntities.ICancelableDataResult<CardPaymentVoidPaymentResponse>>{
                                        canceled: true,
                                        data: null
                                    };
                                }
                            });
                    });
            })
            .catch((error: any) => {
                this.context.logger.logError(
                    "LMG NICardPaymentVoidPaymentRequestHandler: " + JSON.stringify(error)
                );
                return <ClientEntities.ICancelableDataResult<CardPaymentVoidPaymentResponse>>{
                    canceled: true,
                    data: null
                };
            });
    }

    private _findTenderLine(cart: ProxyEntities.Cart, request: CardPaymentVoidPaymentRequest<CardPaymentVoidPaymentResponse>): ProxyEntities.TenderLine {
        if (ObjectExtensions.isNullOrUndefined(cart) || ObjectExtensions.isNullOrUndefined(cart.TenderLines)) {
            return null;
        }

        const reqMasked = (request.tenderInfo && request.tenderInfo.CardNumber) || "";
        const last4 = reqMasked.length >= 4 ? reqMasked.slice(-4) : reqMasked;

        // Match on amount + masked card last-4. Prefer a non-voided line.
        const candidates = cart.TenderLines.filter((tl: ProxyEntities.TenderLine) => {
            const amountMatch = Math.abs((tl.Amount || 0) - request.amount) < 0.001;
            const cardMatch = !last4 || ((tl.MaskedCardNumber || "").slice(-4) === last4);
            return amountMatch && cardMatch;
        });

        return candidates.find((tl: ProxyEntities.TenderLine) => (tl.Amount || 0) >= 0) || candidates[0] || null;
    }

    private _loadDeviceConfig(): Promise<void> {
        const deviceReq = new GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse>(
            this.context.logger.getNewCorrelationId()
        );

        return this.context.runtime.executeAsync(deviceReq)
            .then((response: ClientEntities.ICancelableDataResult<GetDeviceConfigurationClientResponse>) => {
                const props = response.data.result.ExtensionProperties || [];

                const findCfg = (key: string): string => props.find((p: ProxyEntities.CommerceProperty) => p.Key === key)?.Value?.StringValue || "";

                const intervalRaw = findCfg("NISTATUSINTERVAL");
                const maxCountRaw = findCfg("NIMAXSTATUSCOUNT");

                this._niStatusInterval = intervalRaw && !isNaN(Number(intervalRaw)) ? Number(intervalRaw) : 5;
                this._niMaxStatusCount = maxCountRaw && !isNaN(Number(maxCountRaw)) ? Number(maxCountRaw) : 12;
            });
    }

    private _showMessage(message: string): void {
        const options: IMessageDialogOptions = { message };
        this.context.runtime.executeAsync(new ShowMessageDialogClientRequest(options));
    }
}