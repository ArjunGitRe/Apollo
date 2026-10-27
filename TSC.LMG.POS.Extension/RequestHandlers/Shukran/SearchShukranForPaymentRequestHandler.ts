import { ExtensionRequestHandlerBase, ExtensionRequestType } from "PosApi/Create/RequestHandlers";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device";
import { IMessageDialogOptions, ShowMessageDialogClientRequest, ShowMessageDialogClientResponse } from "PosApi/Consume/Dialogs";
import { StoreOperations } from "../../DataService/DataServiceRequests.g";
import ShukranCustomerSearchDialog, { IShukranSearchResult } from "../../Dialogs/Shukran/ShukranCustomerSearchDialog";
import SearchShukranForPaymentRequest from "./SearchShukranForPaymentRequest";
import SearchShukranForPaymentResponse from "./SearchShukranForPaymentResponse";

/**
 * Reusable Shukran customer search/link handler.
 *
 * Called by NIPaymentOperationRequestHandler and AaniPayOperationRequestHandler
 * BEFORE opening the payment dialog.
 *
 * Returns:
 *   isLinked = true,  canceled = false → profile already linked, proceed to payment
 *   isLinked = false, canceled = true  → search opened (navigate/enroll), cancel payment
 *   isLinked = false, canceled = true  → API error, cancel payment
 */
export default class SearchShukranForPaymentRequestHandler<TResponse extends SearchShukranForPaymentResponse>
    extends ExtensionRequestHandlerBase<TResponse> {

    public _shukranTenderType: string = "";
    private _storeCountryCode: string = "";

    public supportedRequestType(): ExtensionRequestType<TResponse> {
        return SearchShukranForPaymentRequest;
    }

    public executeAsync(
        request: SearchShukranForPaymentRequest<TResponse>
    ): Promise<ClientEntities.ICancelableDataResult<TResponse>> {

        const cart = request.cart;

        // ── Check if already linked ───────────────────────────────
        const shukranAcct = this._getCartExtensionValue(cart, "SHUKRAN_ACCT");
        const shukranProfileId = this._getCartExtensionValue(cart, "SHUKRAN_PROFILE_ID");

        const alreadyLinked =
            !!(shukranAcct && shukranAcct.trim() !== "") ||
            !!(shukranProfileId && shukranProfileId.trim() !== "");

        if (alreadyLinked) {
            // Profile already on cart — proceed directly to payment
            return Promise.resolve({
                canceled: false,
                data: new SearchShukranForPaymentResponse(true, false) as TResponse
            });
        }

        // ── Load device config for country code ───────────────────
        return this._loadDeviceConfig()
            .then(() => {

                const searchDialog = new ShukranCustomerSearchDialog();

                return searchDialog.open()
                    .then((searchResult: IShukranSearchResult): Promise<ClientEntities.ICancelableDataResult<TResponse>> => {

                        if (!searchResult.confirmed) {
                            // Cashier skipped search — proceed to payment (Shukran is optional)
                            return Promise.resolve({
                                canceled: false,
                                data: new SearchShukranForPaymentResponse(false, false) as TResponse
                            });
                        }

                        const customerReq = new StoreOperations.SearchShukranCustomerRequest<StoreOperations.SearchShukranCustomerResponse>(
                            searchResult.searchType,
                            searchResult.searchValue,
                            this._storeCountryCode,
                            "",
                            cart.Id
                        );

                        return this.context.runtime.executeAsync(customerReq)
                            .then((resp): Promise<ClientEntities.ICancelableDataResult<TResponse>> => {

                                const profileResponse = resp.data.result;

                                if (profileResponse && !profileResponse.Success && profileResponse.Message) {
                                    const msg = profileResponse.Message.toLowerCase();

                                    if (msg.includes("not active")) {
                                        this._showMessage(profileResponse.Message);
                                        return Promise.resolve({
                                            canceled: false,
                                            data: new SearchShukranForPaymentResponse(false, false) as TResponse
                                        });
                                    }

                                    if (msg.includes("not found")) {
                                        return this._showNoProfileDialog(searchResult);
                                    }

                                    this._showMessage(profileResponse.Message);
                                    return Promise.resolve({
                                        canceled: false,
                                        data: new SearchShukranForPaymentResponse(false, false) as TResponse
                                    });
                                }

                                const hasProfile = !!(
                                    profileResponse &&
                                    profileResponse.Success &&
                                    profileResponse.CustomerProfileDetails
                                );

                                if (hasProfile) {
                                    // Navigate to profile view to link — cancel current payment attempt
                                    this.context.navigator.navigate("ShukranCustomerProfileView", {
                                        customerProfile: resp.data.result,
                                        searchType: searchResult.searchType,
                                        inputMethod: searchResult.inputMethod
                                    });
                                    return Promise.resolve({
                                        canceled: false,
                                        data: new SearchShukranForPaymentResponse(false, true,
                                            "Shukran profile found. Please link and retry payment.") as TResponse
                                    });
                                } else {
                                    return this._showNoProfileDialog(searchResult);
                                }
                            })
                            .catch((): Promise<ClientEntities.ICancelableDataResult<TResponse>> => {
                                return Promise.resolve({
                                    canceled: false,
                                    data: new SearchShukranForPaymentResponse(false, false) as TResponse
                                });
                            });
                    });
            });
    }

    // ─────────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────────

    private _showNoProfileDialog(
        searchResult?: IShukranSearchResult
    ): Promise<ClientEntities.ICancelableDataResult<TResponse>> {

        const dialogOptions: IMessageDialogOptions = {
            title: "No Shukran Profile Found",
            message: "This customer does not have a Shukran loyalty profile.\n\nWould you like to enroll them now?",
            button1: { id: "btnYes", label: "Yes, Enroll", result: "Yes" },
            button2: { id: "btnNo", label: "No", result: "No" }
        };

        return this.context.runtime.executeAsync(
            new ShowMessageDialogClientRequest<ShowMessageDialogClientResponse>(dialogOptions)
        ).then((dialogResult: ClientEntities.ICancelableDataResult<ShowMessageDialogClientResponse>) => {

            if (!dialogResult.canceled && dialogResult.data.result.dialogResult === "Yes") {
                let enrollOptions: any = {};
                if (searchResult &&
                    searchResult.searchType === "PhoneNumber" &&
                    searchResult.phoneNumber &&
                    searchResult.phonePrefix) {
                    enrollOptions.prefillPhone = {
                        phoneNumber: searchResult.phoneNumber,
                        phonePrefix: searchResult.phonePrefix,
                        countryRegionId: searchResult.phoneCountryRegionId || ""
                    };
                }
                this.context.navigator.navigate("ShukranCustomerEnrollmentView", enrollOptions);
                return {
                    canceled: false,
                    data: new SearchShukranForPaymentResponse(false, true,
                        "Navigated to enrollment.") as TResponse
                };
            }

            // Cashier chose No — proceed to payment without Shukran (optional)
            return {
                canceled: false,
                data: new SearchShukranForPaymentResponse(false, false) as TResponse
            };
        }).catch(() => ({
            canceled: false,
            data: new SearchShukranForPaymentResponse(false, false) as TResponse
        }));
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

            this._shukranTenderType = find("SKRNTENDERTYPE");
            this._storeCountryCode = find("StoreCountryCode");
        });
    }

    private _showMessage(message: string): void {
        const options: IMessageDialogOptions = { message };
        this.context.runtime.executeAsync(new ShowMessageDialogClientRequest(options));
    }

    private _getCartExtensionValue(cart: ProxyEntities.Cart, key: string): string | null {
        if (!cart?.ExtensionProperties?.length) return null;
        const prop = cart.ExtensionProperties.find(
            (p: ProxyEntities.CommerceProperty) => p.Key === key
        );
        if (!prop?.Value) return null;
        if (prop.Value.StringValue != null) return prop.Value.StringValue;
        if (prop.Value.DecimalValue != null) return prop.Value.DecimalValue.toString();
        if (prop.Value.BooleanValue != null) return prop.Value.BooleanValue.toString();
        return null;
    }
}