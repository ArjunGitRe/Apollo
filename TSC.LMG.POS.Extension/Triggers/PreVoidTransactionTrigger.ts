import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";
import * as Triggers from "PosApi/Extend/Triggers/TransactionTriggers";
//import { ClientEntities} from "PosApi/Entities";
import { ObjectExtensions } from "PosApi/TypeExtensions";
import { StoreOperations } from "../DataService/DataServiceRequests.g";

export default class PreVoidTransactionTrigger extends Triggers.PreVoidTransactionTrigger {

    public execute(options: Triggers.IPreVoidTransactionTriggerOptions): Promise<Commerce.Client.Entities.ICancelable> {
        const cart: Commerce.Proxy.Entities.Cart = options.cart;

        const voucherStatus = this._getExtensionPropertyString(cart, "SHUKRAN_VOUCHER_STATUS");

        // No voucher applied — allow void to proceed immediately
        if (voucherStatus !== "Redeemed") {
            return Promise.resolve({ canceled: false });
        }

        // ── Voucher is applied — reverse it before allowing the void ─────────
        const voucherNumber = this._getExtensionPropertyString(cart, "SHUKRAN_VOUCHER_NUMBER");
        const discountCode = this._getExtensionPropertyString(cart, "SHUKRAN_DISCOUNT_CODE");
        const conceptCode = this._getExtensionPropertyString(cart, "SHUKRAN_CONCEPT_CODE");
        const profileId = this._getExtensionPropertyString(cart, "SHUKRAN_PROFILE_ID");
        const storeCode = this._getExtensionPropertyString(cart, "SHUKRAN_STORE_CODE");
        const cartId = cart.Id || "";

        return this._reverseVoucher(profileId, storeCode, conceptCode, discountCode, voucherNumber, cartId)
            .then((result) => {
                if (!result.success) {
                    return this._showNotification("Reversal Failed", result.message)
                        .then(() => ({ canceled: false })); // or canceled: true to block the void
                }
                return this._showNotification(
                    "Voucher Reversed",
                    `Shukran voucher (${voucherNumber || "—"}) has been reversed and the transaction will now be voided.`
                ).then(() => ({ canceled: false }));
            })
            .catch((err: any) => {
                console.error("PreVoidTransactionTrigger: voucher reverse failed:", err);
                return { canceled: false };
            });
    }

    // ── Reverse API ──────────────────────────────────────────────────────────

    private _reverseVoucher(profileId: string, storeCode: string, conceptCode: string, discountCode: string, voucherNumber: string, cartId: string): Promise<{ success: boolean; message: string }>
    {
        const req = new StoreOperations.CustomerVoucherDetailsRequest<StoreOperations.CustomerVoucherDetailsResponse>(profileId,/*storeCode*/"", conceptCode,discountCode,voucherNumber,cartId,"Reverse");
        return this.context.runtime.executeAsync(req)
            .then((resp) => {
                const result = resp?.data?.result;
                if (!result || !result.VoucherResult?.Success) {
                    return {
                        success: false,
                        message: result?.VoucherResult?.Message || "The Shukran voucher could not be reversed."
                    };
                }
                return { success: true, message: "" };
            })
            .catch((err: any) => {
                console.error("PreVoidTransactionTrigger: reverse API error:", err);
                return { success: false, message: "Voucher reversal request failed." };
            });
    }

    private _getExtensionPropertyString(cart: Commerce.Proxy.Entities.Cart, key: string): string
    {
        if (ObjectExtensions.isNullOrUndefined(cart.ExtensionProperties)) {
            return "";
        }
        const prop = cart.ExtensionProperties.find(
            (p: Commerce.Proxy.Entities.CommerceProperty) => p.Key === key
        );
        return prop?.Value?.StringValue ?? "";
    }

    private _showNotification(title: string, message: string): Promise<void>
    {
        const options: IMessageDialogOptions = {
            title: title,
            message: message
        };
        const dialogRequest = new ShowMessageDialogClientRequest(options);
        return this.context.runtime.executeAsync(dialogRequest)
            .then(() => { return; })
            .catch(() => { return; });
    }
}