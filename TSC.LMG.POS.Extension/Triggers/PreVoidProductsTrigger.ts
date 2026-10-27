import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";
import * as Triggers from "PosApi/Extend/Triggers/ProductTriggers";
import { ObjectExtensions } from "PosApi/TypeExtensions";

export default class PreVoidProductsTrigger extends Triggers.PreVoidProductsTrigger {

    public execute(options: Triggers.IPreVoidProductsTriggerOptions): Promise<Commerce.Client.Entities.ICancelable> {
        const cart: Commerce.Proxy.Entities.Cart = options.cart;
        cart.Coupons
        // ── 1. Check if a Shukran voucher has been applied ──────────────────
        const voucherApplied = this._hasShukranVoucherApplied(cart);
        if (!voucherApplied) {
            return Promise.resolve({ canceled: false });
        }

        const discountCode = this._getExtensionPropertyString(cart, "SHUKRAN_DISCOUNT_CODE");
        const hasMatchingCoupon = cart.Coupons?.find(
            (c: Commerce.Proxy.Entities.Coupon) => c.Code === discountCode || c.CodeId === discountCode || c.DiscountOfferId === discountCode) !== undefined;

        if (!hasMatchingCoupon) {
            return Promise.resolve({ canceled: false });
        }

        const linesToVoid = options.cartLines;
        const shukranLineIsBeingVoided = this._anyLineHasShukranDiscount(linesToVoid, discountCode);

        if (!shukranLineIsBeingVoided) {
            
            return Promise.resolve({ canceled: false });
        }


        const voucherNumber = this._getExtensionPropertyString(cart, "SHUKRAN_VOUCHER_NUMBER");
        const voucherLabel = voucherNumber ? ` (${voucherNumber})` : "";

        return this._showNotification(
            "Void Not Allowed",
            `A Shukran voucher${voucherLabel} has been applied to this item\n\n` +
            `To void this item, please either:\n` +
            `  • Void the entire transaction, or\n` +
            `  • Remove the voucher before voiding individual items.`).then(() => {
            return { canceled: true };
        });
        
        // ── Allow void ───────────────────────────────────────────────────────
        //return Promise.resolve({ canceled: false });
    }

    /**
     * Returns true if SHUKRAN_VOUCHER_STATUS extension property equals "Redeemed".
     */
    private _hasShukranVoucherApplied(cart: Commerce.Proxy.Entities.Cart): boolean
    {
        const status = this._getExtensionPropertyString(cart, "SHUKRAN_VOUCHER_STATUS");
        return status === "Redeemed";
    }

    /**
     * Reads a string value from cart extension properties by key.
     * Returns empty string if not found.
     */
    private _getExtensionPropertyString(cart: Commerce.Proxy.Entities.Cart, key: string): string
    {
        if (ObjectExtensions.isNullOrUndefined(cart.ExtensionProperties)) {
            return "";
        }

        const prop = cart.ExtensionProperties.find( (p: Commerce.Proxy.Entities.CommerceProperty) => p.Key === key);
        return prop?.Value?.StringValue ?? "";
    }

    private _showNotification(title: string, message: string): Promise<void>
    {
        let options: IMessageDialogOptions = {
            title: title,
            message: message
        };
        let dialogRequest = new ShowMessageDialogClientRequest(options);
        return this.context.runtime.executeAsync(dialogRequest)
            .then(() => { return; })
            .catch(() => { return; });
    }
    private _anyLineHasShukranDiscount(lineItems: Commerce.Proxy.Entities.CartLine[], discountCode: string): boolean
    {
        if (!lineItems || !discountCode) {
            return false;
        }

        return lineItems.some((line: Commerce.Proxy.Entities.CartLine) => {
            if (ObjectExtensions.isNullOrUndefined(line.DiscountLines)) {
                return false;
            }
            return line.DiscountLines.some(
                (d: Commerce.Proxy.Entities.DiscountLine) => d.OfferId === discountCode || d.DiscountCode === discountCode );
        });
    }
}