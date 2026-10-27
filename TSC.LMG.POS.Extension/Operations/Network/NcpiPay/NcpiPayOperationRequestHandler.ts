import { ExtensionOperationRequestType, ExtensionOperationRequestHandlerBase } from "PosApi/Create/Operations";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { ObjectExtensions } from "PosApi/TypeExtensions";
import { GetCurrentCartClientRequest, GetCurrentCartClientResponse } from "PosApi/Consume/Cart";
import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device";
import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";
import NIPaymentDialog from "../../../Dialogs/Network/NIPaymentDialog";
import { NIRequestType } from "../../../Helper/NIRequestType";
import NcpiPayOperationRequest from "./NcpiPayOperationRequest";
import NcpiPayOperationResponse from "./NcpiPayOperationResponse";
import SearchShukranForPaymentRequest from "../../../RequestHandlers/Shukran/SearchShukranForPaymentRequest";
import SearchShukranForPaymentResponse from "../../../RequestHandlers/Shukran/SearchShukranForPaymentResponse";

/**
 * NCPI Pay Operation Handler — operation ID 6113.
 *
 * Uses the same NI Push Payments API and dialog as NI/Aani Pay,
 * but with:
 *   - transactionType = "pushPaymentNpciQRSale"
 *   - Tender type from device config "NCPIPAYTENDERTYPE"
 *   - Treated as cash (no card fields on tender line, same as Aani)
 *   - Shukran search runs first (optional — payment proceeds regardless)
 */
export default class NcpiPayOperationRequestHandler<TResponse extends NcpiPayOperationResponse>
    extends ExtensionOperationRequestHandlerBase<TResponse> {

    private _ncpiTenderId: string = "";
    private _niStatusInterval: number;
    private _niMaxStatusCount: number;

    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return NcpiPayOperationRequest;
    }

    public executeAsync(request: NcpiPayOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {

        return this.context.runtime.executeAsync(new GetCurrentCartClientRequest<GetCurrentCartClientResponse>())
            .then((cartResponse: ClientEntities.ICancelableDataResult<GetCurrentCartClientResponse>) => {

                if (ObjectExtensions.isNullOrUndefined(cartResponse?.data?.result)) {
                    this._showMessage("Unable to retrieve the current cart.");
                    return { canceled: true, data: new NcpiPayOperationResponse() as TResponse };
                }

                const cart = cartResponse.data.result;

                if (!cart.CartLines || cart.CartLines.length === 0) {
                    this._showMessage("No items in the cart.");
                    return { canceled: true, data: new NcpiPayOperationResponse() as TResponse };
                }

                if (cart.AmountDue <= 0) {
                    this._showMessage("Amount due is zero. No payment needed.");
                    return { canceled: true, data: new NcpiPayOperationResponse() as TResponse };
                }

                // ── Shukran search (optional — same as other tenders) ─────────
                return this.context.runtime.executeAsync(
                    new SearchShukranForPaymentRequest<SearchShukranForPaymentResponse>(cart)
                ).then((shukranResp: ClientEntities.ICancelableDataResult<SearchShukranForPaymentResponse>) => {

                    if (shukranResp.data.canceled) {
                        // Navigated to profile view or enrollment — cashier retries after linking
                        return { canceled: true, data: new NcpiPayOperationResponse() as TResponse };
                    }

                    return this._loadDeviceConfig()
                        .then(() => {

                            if (!this._ncpiTenderId) {
                                this._showMessage( "NCPI Pay tender type is not configured. " +"Please check NCPIPAYTENDERTYPE in device config.");
                                return { canceled: true, data: new NcpiPayOperationResponse() as TResponse };
                            }

                            const lineNo = (cart.TenderLines ? cart.TenderLines.length : 0) + 1;

                            const dialog = new NIPaymentDialog(this.context, cart.Id, this._ncpiTenderId, cart.AmountDue, lineNo.toString(),
                                NIRequestType.Sale,
                                "",                        // no originalId for sale
                                "",                        // no pre-existing sourceId
                                this._niStatusInterval,
                                this._niMaxStatusCount,
                                false,                     // isRefund
                                "pushPaymentNpciQRSale",   // transactionTypeOverride ← NCPI specific
                                true,                      // isCashLike — no card fields
                                "NCPI"                     
                            );

                            return dialog.open()
                                .then((): ClientEntities.ICancelableDataResult<TResponse> => {
                                    return { canceled: false, data: new NcpiPayOperationResponse() as TResponse };
                                });
                        });
                });
            })
            .catch((error: any) => {
                this.context.logger.logError(
                    "NcpiPayOperationRequestHandler: " + JSON.stringify(error)
                );
                this._showMessage("An error occurred during NCPI Pay.");
                return { canceled: true, data: new NcpiPayOperationResponse() as TResponse };
            });
    }

    // ─────────────────────────────────────────────────────────────
    //  Device config
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

            this._ncpiTenderId = find("NCPIPAYTENDERTYPE");

            const intervalRaw = find("NISTATUSINTERVAL");
            const maxCountRaw = find("NIMAXSTATUSCOUNT");

            this._niStatusInterval = intervalRaw && !isNaN(Number(intervalRaw)) ? Number(intervalRaw) : 5;
            this._niMaxStatusCount = maxCountRaw && !isNaN(Number(maxCountRaw)) ? Number(maxCountRaw) : 8;
        });
    }

    private _showMessage(message: string): void {
        const options: IMessageDialogOptions = { message };
        this.context.runtime.executeAsync(new ShowMessageDialogClientRequest(options));
    }
}