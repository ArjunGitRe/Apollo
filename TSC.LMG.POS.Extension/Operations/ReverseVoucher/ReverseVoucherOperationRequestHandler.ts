import { ExtensionOperationRequestType, ExtensionOperationRequestHandlerBase } from "PosApi/Create/Operations";
import ReverseVoucherOperationResponse from "../../Operations/ReverseVoucher/ReverseVoucherOperationResponse";
import ReverseVoucherOperationRequest from "../../Operations/ReverseVoucher//ReverseVoucherOperationRequest";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { GetCurrentCartClientRequest, GetCurrentCartClientResponse, SaveExtensionPropertiesOnCartClientRequest, SaveExtensionPropertiesOnCartClientResponse } from "PosApi/Consume/Cart";
import { ObjectExtensions } from "PosApi/TypeExtensions";
import { StoreOperations } from "../../DataService/DataServiceRequests.g";
import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";

export default class ReverseVoucherOperationRequestHandler<TResponse extends ReverseVoucherOperationResponse> extends ExtensionOperationRequestHandlerBase<TResponse> {

    public supportedRequestType(): ExtensionOperationRequestType<TResponse> {
        return ReverseVoucherOperationRequest;
    }


    public executeAsync(printRequest: ReverseVoucherOperationRequest<TResponse>): Promise<ClientEntities.ICancelableDataResult<TResponse>> {


        const getCartRequest = new GetCurrentCartClientRequest<GetCurrentCartClientResponse>();
        return this.context.runtime.executeAsync(getCartRequest)
            .then((cartResponse: ClientEntities.ICancelableDataResult<GetCurrentCartClientResponse>) => {

                const cart: ProxyEntities.Cart = cartResponse.data.result;

                const voucherStatus = this._getExtensionPropertyString(cart, "SHUKRAN_VOUCHER_STATUS");

                // No voucher applied
                if (voucherStatus !== "Redeemed") {
                    return this._showNotification("No Voucher", "There is no redeemed Shukran voucher on this transaction.")
                        .then(() => ({ canceled: true, data: <TResponse>new ReverseVoucherOperationResponse() }));
                }

                const voucherNumber = this._getExtensionPropertyString(cart, "SHUKRAN_VOUCHER_NUMBER");
                const discountCode = this._getExtensionPropertyString(cart, "SHUKRAN_DISCOUNT_CODE");
                const conceptCode = this._getExtensionPropertyString(cart, "SHUKRAN_CONCEPT_CODE");
                const profileId = this._getExtensionPropertyString(cart, "SHUKRAN_PROFILE_ID");
               // const storeCode = this._getExtensionPropertyString(cart, "SHUKRAN_STORE_CODE");
                const cartId = cart.Id || "";

                const reverseRequest = new StoreOperations.CustomerVoucherDetailsRequest<StoreOperations.CustomerVoucherDetailsResponse>(profileId, /*storeCode*/"", conceptCode, discountCode, voucherNumber, cartId, "Reverse");
                return this.context.runtime.executeAsync(reverseRequest)
                    .then((response: ClientEntities.ICancelableDataResult<StoreOperations.CustomerVoucherDetailsResponse>) => {

                        const result = response?.data?.result;

                        if (!result || !result.VoucherResult?.Success) {

                            const apiMessage: string = result?.VoucherResult?.Message ?? "";
                            const displayMessage: string = apiMessage.trim().length > 0
                                ? apiMessage : "The Shukran voucher could not be reversed. Please try again.";

                            console.warn("ReverseVoucherOperationRequestHandler: reversal failed", result);

                            return this._showNotification("Reversal Failed", displayMessage)
                                .then(() => ({ canceled: true, data: <TResponse>new ReverseVoucherOperationResponse() }));
                        }

                        // Clear extension properties
                        return this._clearVoucherExtensionProperties(cart)

                            .then(() => {

                                // Show success dialog
                                return this._showNotification("Voucher Reversed", `Shukran voucher (${voucherNumber || "-"}) has been reversed successfully.`);
                            })

                            .then(() => {

                                return { canceled: false, data: <TResponse>new ReverseVoucherOperationResponse() };
                            });
                    })
            })
            .catch((error: any) => {

                console.error("ReverseVoucherOperationRequestHandler: exception during reversal", error);

                return { canceled: true, data: <TResponse>new ReverseVoucherOperationResponse()};
            });
    }

    private _clearVoucherExtensionProperties(cart: ProxyEntities.Cart): Promise<void>
    {

        const strProp = (key: string): ProxyEntities.CommerceProperty => ({
            Key: key,
            Value: {
                StringValue: ""
            } as ProxyEntities.CommercePropertyValue
        });

        const decProp = (key: string): ProxyEntities.CommerceProperty => ({
            Key: key,
            Value: {
                DecimalValue: 0
            } as ProxyEntities.CommercePropertyValue
        });

        const properties: ProxyEntities.CommerceProperty[] = [

            strProp("SHUKRAN_VOUCHER_NUMBER"),
            strProp("SHUKRAN_VOUCHER_STATUS"),
            strProp("SHUKRAN_VOUCHER_TYPE"),
            strProp("SHUKRAN_DISCOUNT_CODE"),
            strProp("SHUKRAN_CONCEPT_CODE"),
            strProp("SHUKRAN_MEMBER_CARD"),
            strProp("SHUKRAN_VOUCHER_CART_ID"),
            strProp("SHUKRAN_VOUCHER_REDEEM_TIME"),
            strProp("SHUKRAN_PROFILE_ID"),
            strProp("SHUKRAN_STORE_CODE"),

            decProp("SHUKRAN_VOUCHER_THRESHOLD"),
            decProp("SHUKRAN_VOUCHER_PCT_OFF"),
            decProp("SHUKRAN_VOUCHER_AMT_OFF")
        ];

        const saveRequest =new SaveExtensionPropertiesOnCartClientRequest<SaveExtensionPropertiesOnCartClientResponse>(properties);
        return this.context.runtime.executeAsync(saveRequest)
            .then(() =>
            {
                return;
            })

            .catch((error: any) => {

                console.error("ReverseVoucherOperationRequestHandler: failed to clear extension properties", error);
                return;
            });
    }



    private _getExtensionPropertyString(cart: ProxyEntities.Cart, key: string): string
    {
        if (ObjectExtensions.isNullOrUndefined(cart.ExtensionProperties)) {
            return "";
        }

        const property = cart.ExtensionProperties.find((p: ProxyEntities.CommerceProperty) => p.Key === key);
        return property?.Value?.StringValue ?? "";
    }



    private _showNotification(title: string, message: string): Promise<void>
    {
        const options: IMessageDialogOptions = {
            title: title,
            message: message
        };

        const dialogRequest = new ShowMessageDialogClientRequest(options);
        return this.context.runtime.executeAsync(dialogRequest)
            .then(() => {return;})
            .catch(() => {return;});
    }

}