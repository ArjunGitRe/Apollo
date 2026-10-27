import * as Triggers from "PosApi/Extend/Triggers/OperationTriggers";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { GetCustomerClientRequest, GetCustomerClientResponse } from "PosApi/Consume/Customer";
import { ShowMessageDialogClientRequest, IMessageDialogOptions } from "PosApi/Consume/Dialogs";
import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device";
import { AddPreprocessedTenderLineToCartClientRequest, ConcludeTransactionClientRequest, GetCurrentCartClientRequest, GetCurrentCartClientResponse, SetCustomerOnCartOperationRequest, SetCustomerOnCartOperationResponse } from "PosApi/Consume/Cart";

// ─── Commerce parameter key pattern stored in device config ExtensionProperties
//     e.g. key = "CustomerAccount_TenderType_9"  → value = "THAL-001"
//          key = "CustomerAccount_TenderType_10" → value = "NOON-001"
const TENDER_CUSTOMER_KEY_PREFIX = "CustomerAccount_TenderType_";

//interface ICustomerOperationOptions {
//    customer?: ProxyEntities.Customer;
//    customerId?: string;
//    correlationId?: string;
//}

//interface ICustomerOperationRequest {
//    operationId: ProxyEntities.RetailOperation;
//    options?: ICustomerOperationOptions;
//    skipManagerPermissionChecks: boolean;
//}

// PayCustomerAccount carries the tender type on its options
interface IPayCustomerAccountOptions {
    tenderType?: ProxyEntities.TenderType;
    tenderLine?: Partial<ProxyEntities.TenderLine>;
    correlationId?: string;
}

interface IPayCustomerAccountRequest {
    operationId: ProxyEntities.RetailOperation;
    options?: IPayCustomerAccountOptions;
}

export default class PreOperationTrigger extends Triggers.PreOperationTrigger {
    private _deviceCurrency: string = "";

    public execute(options: Triggers.IOperationTriggerOptions): Promise<ClientEntities.ICancelable> {
        this.context.logger.logVerbose(
            "PreOperationTrigger: operationId=" + options.operationRequest.operationId
        );

        if (options.operationRequest.operationId === ProxyEntities.RetailOperation.PayCustomerAccount) {
            return this._handleOperation(options)
                .catch((error: any) => {
                    this.context.logger.logError("PreOperationTrigger error: " + JSON.stringify(error));
                    return Promise.resolve({ canceled: true });
                });
        }

        return Promise.resolve({ canceled: false });
    }

    private _handleOperation(options: Triggers.IOperationTriggerOptions): Promise<ClientEntities.ICancelable>
    {
        // ── Step 1: resolve the tender type ID from the operation request ──────
        return this.context.runtime
            .executeAsync(new GetCurrentCartClientRequest<GetCurrentCartClientResponse>())
            .then((cartResp: ClientEntities.ICancelableDataResult<GetCurrentCartClientResponse>): Promise<ClientEntities.ICancelable> => {

                const cart = cartResp.data.result;

                // ── If Shukran customer is already linked to the cart,
                //    block account payment entirely
                if (this._isShukranCustomerOnCart(cart)) {
                    this.context.logger.logWarning(
                        "PreOperationTrigger: Shukran customer is linked to cart — blocking PayCustomerAccount."
                    );
                    this._showMessage(
                        "A Shukran loyalty customer is already linked to this transaction.\n\nAccount payment is not allowed when a Shukran customer is present."
                    );
                    return Promise.resolve({ canceled: true });
                }

                // Step 2: resolve tender type ID from the operation request
                const payRequest = options.operationRequest as unknown as IPayCustomerAccountRequest;
                const tenderTypeId = this._resolveTenderTypeId(payRequest);

                if (!tenderTypeId) {
                    this.context.logger.logWarning(
                        "PreOperationTrigger: No tender type ID found on PayCustomerAccount request."
                    );
                    return Promise.resolve({ canceled: false });
                }

                this.context.logger.logVerbose(
                    "PreOperationTrigger: Resolved tenderTypeId=" + tenderTypeId
                );

                // Step 3: look up the mapped customer account from device config
                return this._getCustomerAccountByTenderType(tenderTypeId)
                    .then((customerAccount: string): Promise<ClientEntities.ICancelable> => {

                        if (!customerAccount) {
                            this.context.logger.logWarning(
                                "PreOperationTrigger: No customer configured for tender type " + tenderTypeId
                            );
                            this._showMessage(
                                "No customer account is configured for this payment method. Contact your administrator."
                            );
                            return Promise.resolve({ canceled: true });
                        }

                        // Step 4: fetch customer, validate, and set on cart if allowed
                        return this._validateAndAssignCustomer(customerAccount, cart, tenderTypeId);
                    });
            });
    }


    private _isShukranCustomerOnCart(cart: ProxyEntities.Cart): boolean {
        const shukranAcct = this._getCartExtensionValue(cart, "SHUKRAN_ACCT");
        const shukranProfileId = this._getCartExtensionValue(cart, "SHUKRAN_PROFILE_ID");

        return !!(shukranAcct && shukranAcct.trim() !== "") ||
            !!(shukranProfileId && shukranProfileId.trim() !== "");
    }

    private _getCartExtensionValue(cart: ProxyEntities.Cart, key: string): string | null {
        if (!cart || !cart.ExtensionProperties || cart.ExtensionProperties.length === 0) {
            return null;
        }

        const prop = cart.ExtensionProperties.find((p: ProxyEntities.CommerceProperty) => p.Key === key);

        if (!prop || !prop.Value) { return null; }

        if (prop.Value.StringValue !== undefined && prop.Value.StringValue !== null) { return prop.Value.StringValue; }
        if (prop.Value.DecimalValue !== undefined && prop.Value.DecimalValue !== null) { return prop.Value.DecimalValue.toString(); }
        if (prop.Value.BooleanValue !== undefined && prop.Value.BooleanValue !== null) { return prop.Value.BooleanValue.toString(); }

        return null;
    }

    // ─── Tender type ID resolution ─────────────────────────────────────────────
    // PayCustomerAccount places the tender info on tenderType or tenderLine

    private _resolveTenderTypeId(req: IPayCustomerAccountRequest): string
    {
        const opts = req.options;
        if (!opts) { return ""; }

        if (opts.tenderType?.TenderTypeId) {
            return opts.tenderType.TenderTypeId.toString();
        }
        if (opts.tenderLine?.TenderTypeId) {
            return opts.tenderLine.TenderTypeId.toString();
        }

        return "";
    }


    private _getCustomerAccountByTenderType(tenderTypeId: string): Promise<string> {
        const configKey = TENDER_CUSTOMER_KEY_PREFIX + tenderTypeId;
        SetCustomerOnCartOperationRequest
        const configRequest = new GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse>();

        return this.context.runtime.executeAsync(configRequest)
            .then((result: ClientEntities.ICancelableDataResult<GetDeviceConfigurationClientResponse>) => {
                const props: ProxyEntities.CommerceProperty[] =
                    result.data.result.ExtensionProperties || [];

                const match = props.find((p) => p.Key === configKey);
                const account = match?.Value?.StringValue?.trim() || "";

                this.context.logger.logVerbose(
                    "PreOperationTrigger: configKey=" + configKey + " → customerAccount=" + (account || "(not set)")
                );

                return account;
            });
    }


    //private _validateAndAssignCustomer(customerAccount: string, cart: ProxyEntities.Cart, tenderTypeId: string): Promise<ClientEntities.ICancelable> {
    //    const getCustomerRequest =
    //        new GetCustomerClientRequest<GetCustomerClientResponse>(customerAccount);

    //    return this.context.runtime.executeAsync(getCustomerRequest)
    //        .then((response: ClientEntities.ICancelableDataResult<GetCustomerClientResponse>): Promise<ClientEntities.ICancelable> => {
    //            const customer = response.data.result;

    //            if (!customer) {
    //                this.context.logger.logWarning(
    //                    "PreOperationTrigger: Configured customer not found: " + customerAccount
    //                );
    //                this._showMessage("Customer not found. Account payment cannot proceed.");
    //                return Promise.resolve({ canceled: true });
    //            }

    //            this.context.logger.logVerbose(
    //                "PreOperationTrigger: Checking AllowOnAccountPayment for " + customer.AccountNumber
    //            );

    //            if (!customer.AllowOnAccountPayment) {
    //                this.context.logger.logWarning(
    //                    "PreOperationTrigger: Customer " + customer.AccountNumber +
    //                    " is not allowed for account payment."
    //                );
    //                this._showMessage(
    //                    `Customer "${customer.Name}" (${customer.AccountNumber}) is not allowed to make account payments.`
    //                );
    //                return Promise.resolve({ canceled: true });
    //            }

    //            return this._setCustomerOnCart(customer.AccountNumber)
    //                .then((setResult): Promise<ClientEntities.ICancelable> => {

    //                    if (setResult.canceled) {
    //                        return Promise.resolve({ canceled: true });
    //                    }

    //                    const amountDue = cart.AmountDue || 0;

    //                    // ── Show confirmation dialog before completing payment ──
    //                    return this._showConfirmationDialog(customer, amountDue)
    //                        .then((confirmed): Promise<ClientEntities.ICancelable> => {

    //                            if (!confirmed) {
    //                                this.context.logger.logVerbose(
    //                                    "PreOperationTrigger: Cashier canceled the payment confirmation."
    //                                );
    //                                // canceled: true → stays on transaction screen
    //                                return Promise.resolve({ canceled: true });
    //                            }

    //                            // ── Yes → add tender line and conclude ─────────
    //                            return this._addTenderAndConclude(cart, amountDue, tenderTypeId);
    //                        });
    //                });
    //        });
    //}

    private _validateAndAssignCustomer(customerAccount: string, cart: ProxyEntities.Cart, tenderTypeId: string,): Promise<ClientEntities.ICancelable>
    {

        return this.context.runtime.executeAsync(new GetCustomerClientRequest<GetCustomerClientResponse>(customerAccount))
            .then((response: ClientEntities.ICancelableDataResult<GetCustomerClientResponse>): Promise<ClientEntities.ICancelable> => {

                const customer = response.data.result;

                if (!customer) {
                    this.context.logger.logWarning(
                        "PreOperationTrigger: Configured customer not found: " + customerAccount
                    );
                    this._showMessage("Customer not found. Account payment cannot proceed.");
                    return Promise.resolve({ canceled: true });
                }

                this.context.logger.logVerbose(
                    "PreOperationTrigger: AllowOnAccountPayment=" +
                    customer.AllowOnAccountPayment + " for " + customer.AccountNumber
                );

                if (!customer.AllowOnAccountPayment) {
                    this.context.logger.logWarning(
                        "PreOperationTrigger: Customer " + customer.AccountNumber +
                        " is not allowed for account payment."
                    );
                    this._showMessage(
                        `Customer "${customer.Name}" (${customer.AccountNumber}) is not allowed to make account payments.`
                    );
                    return Promise.resolve({ canceled: true });
                }

                return this._setCustomerOnCart(customer.AccountNumber)
                    .then((setResult): Promise<ClientEntities.ICancelable> => {

                        if (setResult.canceled) {
                            return Promise.resolve({ canceled: true });
                        }

                        // ── Re-fetch cart AFTER SetCustomerOnCart so we have
                        //    the latest cart version and correct AmountDue ──────
                        return this.context.runtime
                            .executeAsync(new GetCurrentCartClientRequest<GetCurrentCartClientResponse>())
                            .then((refreshedCartResp): Promise<ClientEntities.ICancelable> => {

                                const freshCart = refreshedCartResp.data.result;
                                const amountDue = freshCart.AmountDue || 0;

                                this.context.logger.logVerbose(
                                    "PreOperationTrigger: Fresh cart AmountDue=" + amountDue +
                                    " cartVersion=" + freshCart.Version
                                );

                                if (amountDue <= 0) {
                                    this.context.logger.logWarning(
                                        "PreOperationTrigger: AmountDue is 0 — nothing to charge."
                                    );
                                    return Promise.resolve({ canceled: false });
                                }

                                // Pass fresh cart — not the stale original
                                return this._addTenderAndConclude(freshCart, amountDue, tenderTypeId);
                               
                            });
                    });
            });
    }

    //private _showConfirmationDialog(customer: ProxyEntities.Customer, amountDue: number): Promise<boolean>
    //{

    //    const dialogOptions: IMessageDialogOptions = {
    //        title: "Confirm Account Payment",
    //        message:
    //            `Customer: ${customer.Name} (${customer.AccountNumber})\n` +
    //            `Amount:   ${this._deviceCurrency} ${amountDue.toFixed(2)}\n\n` +
    //            `Do you want to proceed with the account payment?`,
    //        button1: {
    //            id: "btnYes",
    //            label: "Yes, Proceed",
    //            result: "Yes"
    //        },
    //        button2: {
    //            id: "btnNo",
    //            label: "No, Cancel",
    //            result: "No"
    //        }
    //    };

    //    return this.context.runtime.executeAsync( new ShowMessageDialogClientRequest<ShowMessageDialogClientResponse>(dialogOptions))
    //        .then((result: ClientEntities.ICancelableDataResult<ShowMessageDialogClientResponse>) => {

    //            if (result.canceled) {
    //                return false;
    //            }

    //            return result.data.result.dialogResult === "Yes";
    //        });
    //}

    //private _addTenderAndConclude(cart: ProxyEntities.Cart, amount: number, tenderTypeId: string): Promise<ClientEntities.ICancelable>
    //{

    //    const tenderLine: ProxyEntities.TenderLine = {
    //        TenderLineId: "",
    //        TenderTypeId: tenderTypeId,
    //        Currency: "AED",
    //        Amount: amount,
    //        CustomerId: cart.CustomerId,
    //        SignatureData: null,
    //        IsPolicyBypassed: false,
    //        ExtensionProperties: []
    //    };

    //    this.context.logger.logVerbose(
    //        "PreOperationTrigger: Adding tender line — type=" + tenderTypeId +
    //        " amount=" + amount + " currency=" + this._deviceCurrency
    //    );

    //    return this.context.runtime
    //        .executeAsync(new AddPreprocessedTenderLineToCartClientRequest(tenderLine))
    //        .then((tenderResp) => {

    //            if (tenderResp.canceled) {
    //                this.context.logger.logWarning(
    //                    "PreOperationTrigger: AddPreprocessedTenderLine was canceled."
    //                );
    //                return Promise.resolve({ canceled: true });
    //            }

    //            const updatedCart = tenderResp.data.result;

    //            this.context.logger.logVerbose(
    //                "PreOperationTrigger: Tender added. AmountDue after=" + updatedCart.AmountDue
    //            );

    //            if (updatedCart.AmountDue > 0) {
    //                this.context.logger.logWarning(
    //                    "PreOperationTrigger: AmountDue still > 0 after tender — not concluding."
    //                );
    //                return Promise.resolve({ canceled: true });
    //            }

    //            // Amount fully covered — conclude the transaction
    //            const correlationId = this.context.logger.getNewCorrelationId();

    //            return this.context.runtime
    //                .executeAsync(new ConcludeTransactionClientRequest(correlationId))
    //                .then(() => {
    //                    this.context.logger.logVerbose(
    //                        "PreOperationTrigger: Transaction concluded successfully."
    //                    );
    //                    return Promise.resolve({ canceled: false });
    //                });
    //        });
    //}


    private _addTenderAndConclude(cart: ProxyEntities.Cart, amount: number, tenderTypeId: string): Promise<ClientEntities.ICancelable>
    {

        const tenderLine: ProxyEntities.TenderLine = {
            TenderLineId: "",
            TenderTypeId: tenderTypeId,
            Currency: "AED",
            Amount: amount,
            CustomerId: cart.CustomerId,
            SignatureData: null,
            IsPolicyBypassed: false,
            ExtensionProperties: []
        };

        this.context.logger.logVerbose(
            "PreOperationTrigger: Adding tender line — type=" + tenderTypeId +
            " amount=" + amount +
            " currency=" + this._deviceCurrency +
            " customerId=" + cart.CustomerId
        );

        return this.context.runtime .executeAsync(new AddPreprocessedTenderLineToCartClientRequest(tenderLine))
            .then((tenderResp) => {

                if (tenderResp.canceled) {
                    this.context.logger.logWarning(
                        "PreOperationTrigger: AddPreprocessedTenderLine was canceled."
                    );
                    return Promise.resolve({ canceled: true });
                }

                const updatedCart = tenderResp.data.result;

                this.context.logger.logVerbose(
                    "PreOperationTrigger: Tender added. AmountDue after=" + updatedCart.AmountDue
                );

                if (updatedCart.AmountDue > 0) {
                    this.context.logger.logWarning(
                        "PreOperationTrigger: AmountDue still > 0 after tender — not concluding."
                    );
                    return Promise.resolve({ canceled: true });
                }

                const correlationId = this.context.logger.getNewCorrelationId();

                return this.context.runtime.executeAsync(new ConcludeTransactionClientRequest(correlationId))
                    .then(() => {
                        this.context.logger.logVerbose(
                            "PreOperationTrigger: Transaction concluded successfully."
                        );
                        // ── Transaction is done — return canceled: true so the POS
                        //    does NOT attempt to run PayCustomerAccount again on the
                        //    now-concluded (non-existent) cart. ─────────────────────
                        return Promise.resolve({ canceled: true });
                    });
            });
    }

    private _setCustomerOnCart(customerAccountNumber: string): Promise<ClientEntities.ICancelable>
    {

        const correlationId = this.context.logger.getNewCorrelationId();

        const setCustomerRequest = new SetCustomerOnCartOperationRequest<SetCustomerOnCartOperationResponse>( correlationId,customerAccountNumber);

        return this.context.runtime.executeAsync(setCustomerRequest)
            .then((result: ClientEntities.ICancelableDataResult<SetCustomerOnCartOperationResponse>): Promise<ClientEntities.ICancelable> => {

                if (result.canceled) {
                    this.context.logger.logWarning(
                        "PreOperationTrigger: SetCustomerOnCart was canceled for " + customerAccountNumber
                    );
                    return Promise.resolve({ canceled: true });
                }

                this.context.logger.logVerbose(
                    "PreOperationTrigger: Customer " + customerAccountNumber +
                    " successfully set on cart. Allowing payment to proceed."
                );

                // Customer is now on the cart — let PayCustomerAccount operation run
                return Promise.resolve({ canceled: false });
            });
    }

    private _showMessage(message: string): void {
        const opts: IMessageDialogOptions = { message };
        this.context.runtime.executeAsync(new ShowMessageDialogClientRequest(opts));
    }
}