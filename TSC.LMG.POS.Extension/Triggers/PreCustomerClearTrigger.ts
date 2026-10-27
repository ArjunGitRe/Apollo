import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import * as Triggers from "PosApi/Extend/Triggers/CustomerTriggers";
import { SaveExtensionPropertiesOnCartClientRequest, SaveExtensionPropertiesOnCartClientResponse } from "PosApi/Consume/Cart";
import { ObjectExtensions } from "PosApi/TypeExtensions";
import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";
export default class PreCustomerClearTrigger extends Triggers.PreCustomerClearTrigger {
    public execute(options: Triggers.ICustomerClearTriggerOptions): Promise<ClientEntities.ICancelable> {
        let cart: ProxyEntities.Cart = options.cart;

        if (!cart || !cart.ExtensionProperties) {
            return Promise.resolve({ canceled: false });
        }

        const voucherStatus = this._getExtensionPropertyString(cart, "SHUKRAN_VOUCHER_STATUS");

        if (voucherStatus === "Redeemed") {
            return this._showNotification(
                "Cannot Remove Customer",
                "A Shukran voucher is applied to this transaction. Please void the transaction or reverse the voucher before removing the customer."
            ).then(() => {
                return { canceled: true }; // Block the customer clear
            });
        }

        // All Shukran extension property keys to clear
        const shukranKeys = [
            "SHUKRAN_ACCT",
            "SHUKRAN_PROFILE_ID",
            "SHUKRAN_PHONE",
            "SHUKRAN_CARDNO",
            "SHUKRAN_AVAILABLE_PTS",
            "SHUKRAN_AVAILABLE_PTS_CASHVALUE",
            "SHUKRAN_REDEEMABLE",
            "SHUKRAN_ACCRUABLE",
            "SHUKRAN_COUNTRYCODE",
            "SHUKRAN_TIER",
            "SHUKRAN_ENROLLMENT",
            "SHUKRAN_LANGUAGE_CODE",
            "SHUKRAN_SEARCH_TYPE"
        ];

        // Only clear keys that actually exist on the cart
        const hasShukranProperties = cart.ExtensionProperties.some(
            (p: ProxyEntities.CommerceProperty) => shukranKeys.includes(p.Key)
        );
        if (!hasShukranProperties) {
            return Promise.resolve({ canceled: false });
        }

        // Build cleared extension properties
        let clearedProperties: ProxyEntities.CommerceProperty[] = shukranKeys.map(key => ({
            Key: key,
            Value: { StringValue: "" }
        }));

        let saveRequest = new SaveExtensionPropertiesOnCartClientRequest<SaveExtensionPropertiesOnCartClientResponse>(clearedProperties);
        return this.context.runtime.executeAsync(saveRequest)
            .then(() => {
                return { canceled: false };
            })
            .catch(() => {
                return { canceled: false };
            });
    }
    private _getExtensionPropertyString(cart: ProxyEntities.Cart, key: string): string {
        if (ObjectExtensions.isNullOrUndefined(cart.ExtensionProperties)) {
            return "";
        }
        const prop = cart.ExtensionProperties.find(
            (p: ProxyEntities.CommerceProperty) => p.Key === key
        );
        return prop?.Value?.StringValue ?? "";
    }

    private _showNotification(title: string, message: string): Promise<void> {
        const options: IMessageDialogOptions = { title, message };
        const dialogRequest = new ShowMessageDialogClientRequest(options);
        return this.context.runtime.executeAsync(dialogRequest)
            .then(() => { return; })
            .catch(() => { return; });
    }

}