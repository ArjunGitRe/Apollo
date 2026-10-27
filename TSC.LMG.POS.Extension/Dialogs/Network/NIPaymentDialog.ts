import * as Dialogs from "PosApi/Create/Dialogs";
import { IExtensionContext } from "PosApi/Framework/ExtensionContext";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { ObjectExtensions } from "PosApi/TypeExtensions";
import { ISampleDialogResult } from "../../Dialogs/Network/ISampleDialogResult";
import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device";
import {
    AddPreprocessedTenderLineToCartClientRequest,
    AddPreprocessedTenderLineToCartClientResponse,
    ConcludeTransactionClientRequest,
    //ConcludeTransactionClientRequest
} from "PosApi/Consume/Cart";
import { StoreOperations } from "../../DataService/DataServiceRequests.g";
import ko from "../../Libraries/Knockout";
import { NIRequestType } from "../../Helper/NIRequestType";

type NIPaymentDialogResolve = (value: ISampleDialogResult) => void;
type NIPaymentDialogReject = (reason: any) => void;

export default class NIPaymentDialog extends Dialogs.ExtensionTemplatedDialogBase {

    public Amount: number;
    public AmountDue: number;
    public SourceId: ko.Observable<string>;
    public Transactionid: string;
    public TenderType: string;
    public TenderLineNumber: string;
    public originalId: string;
    public requestStatus: number;
    public paymentstatus: string;
    public val: any;
    public _paymentType: string;

    public _context: IExtensionContext;
    private resolve: NIPaymentDialogResolve;

    // Polling state
    private intervalId: number | null = null;
    private StatusInterval: number;          
    private checkStatusCount: number = 0;
    readonly maxCheckStatusCount: number;   

    public _isRefund: boolean = false;
    private createInvoiceButton: HTMLButtonElement;
    private checkStatusButton: HTMLButtonElement;
    private amountInput: HTMLInputElement;
    private statusTextLabel: HTMLLabelElement;
    public sourceIdDisplay: HTMLInputElement;

    public _transactionTypeOverride: string = "";
    public _isCashLike: boolean = false;

    private concludeAttempted: boolean;
    constructor(context: IExtensionContext, transactionid: string, tenderType: string, amount: number, tenderLineNumber: string, requestStatus: number,
        originalId: string, sourceId: string = "", statusInterval: number, maxStatusCount: number, isRefund: boolean,
        transactionTypeOverride: string = "", isCashLike: boolean = false,paymetType:string)
    {
        super();
        this._context = context;
        this.Transactionid = transactionid;
        this.TenderType = tenderType;
        this.Amount = amount;
        this.AmountDue = amount;
        this.TenderLineNumber = tenderLineNumber;
        this.requestStatus = requestStatus;
        this.originalId = originalId;
        this.SourceId = ko.observable(sourceId);
        this.paymentstatus = "";
        this.val = null;
        this.StatusInterval = statusInterval;
        this.maxCheckStatusCount = maxStatusCount;
        this._isRefund = isRefund;
        this._paymentType = paymetType;
        this._transactionTypeOverride = transactionTypeOverride;
        this._isCashLike = isCashLike;

        this.onBarcodeScanned = (_data: string): void => { /* not used */ };
    }

    // ─────────────────────────────────────────────────────────────
    //  Dialog 
    // ─────────────────────────────────────────────────────────────

    public open(): Promise<ISampleDialogResult> {
        return new Promise((resolve: NIPaymentDialogResolve, _reject: NIPaymentDialogReject) => {
            this.resolve = resolve;
            this.openDialog({
                title: "NI Payment",
                onCloseX: this.endDialogClicked.bind(this),
                button2: {
                    id: "btnCancel",
                    label: "Cancel",
                    onClick: this.closeDialogClicked.bind(this)
                }
            });
        });
    }

    public onReady(element: HTMLElement): void {
        ko.applyBindings(this, element);

        this.statusTextLabel = element.querySelector("#statusResponse") as HTMLLabelElement;
        this.createInvoiceButton = element.querySelector("#createInvoice") as HTMLButtonElement;
        this.checkStatusButton = element.querySelector("#checkStatus") as HTMLButtonElement;
        this.amountInput = element.querySelector("#amount") as HTMLInputElement;
        this.sourceIdDisplay = element.querySelector("#SourceId") as HTMLInputElement;

        // Style defaults
        this.createInvoiceButton.style.backgroundColor = "#2266E3";
        this.createInvoiceButton.style.color = "#FFFFFF";
        this.checkStatusButton.style.display = "none";

        // Void: amount is fixed (from original transaction)
        if (this.requestStatus === NIRequestType.Void) {
            this.amountInput.readOnly = true;
        }

        // If resuming from a previous start (sourceId already set)
        if (this.SourceId() !== "") {
            this.lockRequestButton();
            this.checkStatusButton.style.display = "block";
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  Request Payment button
    // ─────────────────────────────────────────────────────────────

    public createInvoice(): any {
        const amountTender = parseFloat(this.Amount.toString());

        if (amountTender <= 0) {
            this.showStatus("Amount must be greater than zero.", true);
            return;
        }

        if (amountTender > this.AmountDue) {
            this.showStatus("Amount cannot be greater than amount due.", true);
            return;
        }

        this.lockRequestButton();
        this.showStatus("Requesting payment... please wait.", false);

        // Amount sent to NI is in lowest denomination (fils), multiply × 100
        const amountInFils = (amountTender * 100).toFixed(0);
       
        this.context.runtime.executeAsync(
            new StoreOperations.InitiateNITransactionRequest<StoreOperations.InitiateNITransactionResponse>(this.Transactionid, amountInFils, this.TenderLineNumber, this.originalId, this._isRefund, this._transactionTypeOverride)// empty for sale, sourceId of original for void

        ).then((response: ClientEntities.ICancelableDataResult<StoreOperations.InitiateNITransactionResponse>): any => {

            if (ObjectExtensions.isNullOrUndefined(response) ||
                ObjectExtensions.isNullOrUndefined(response.data) ||
                response.canceled) {
                this.unlockRequestButton();
                this.showStatus("Request cancelled.", true);
                return;
            }

            const result = response.data.result;

            if (result.Id > 0) {
                // Success — store sourceId returned 
                this.SourceId(result.SourceId);
                this.showStatus("Payment sent to terminal. Waiting for customer...", false);
                this.checkStatusButton.style.display = "block";

                // Start automatic polling
                this.checkStatusCount = 0;
                this.scheduleNextPoll();

            } else if (result.errMsg && result.errMsg.indexOf("The operation has timed out.") !== -1) {
                // Timeout but CRT may have saved the sourceId — resume polling
                if (result.SourceId) {
                    this.SourceId(result.SourceId);
                    this.checkStatusButton.style.display = "block";
                    this.checkStatusCount = 0;
                    this.scheduleNextPoll();
                } else {
                    this.unlockRequestButton();
                    this.showStatus("Request timed out. Please try again.", true);
                }
            } else {
                this.unlockRequestButton();
                const msg = result.errMsg || "Failed to initiate payment.";
                this.showStatus(msg + (this.requestStatus === NIRequestType.Void ? "\nPlease do manual card return." : ""), true);
            }
        }).catch((reason: any) => {
            this._context.logger.logError("NIPaymentDialog.createInvoice: " + JSON.stringify(reason));
            this.unlockRequestButton();
            this.showStatus("Error initiating payment.", true);
        });
    }

    // ─────────────────────────────────────────────────────────────
    //  Status polling
    // ─────────────────────────────────────────────────────────────

    /**
     * Polls CRT GetNITransactionResult.
     * CRT internally calls get-status → if complete, calls get-result.
     * Schedules itself recursively via setTimeout until success, hard failure, or maxCount.
     */

    public CheckStatus(): any {
        this.checkStatusCount++;

        if (this.checkStatusCount > this.maxCheckStatusCount) {
            this.clearPollTimer();
            this._context.logger.logInformational("NIPaymentDialog: max poll count reached, stopping.");
            this.showStatus("Payment timeout: no response from terminal. Use 'Cancel' or retry 'Check Status'.", true);
            this.checkStatusButton.disabled = false;
            return;
        }

        if (this.SourceId() === "") {
            this.showStatus("Please request a payment first.", true);
            return;
        }

        this.showStatus("Checking payment status...", false);
        this.checkStatusButton.disabled = true;

        const amountInFils = (parseFloat(this.Amount.toString()) * 100).toString();

        this.context.runtime.executeAsync(
            new StoreOperations.GetNITransactionResultRequest<StoreOperations.GetNITransactionResultResponse>(this.Transactionid, this.SourceId(), amountInFils, this.TenderLineNumber, this._paymentType)
        ).then((response: ClientEntities.ICancelableDataResult<StoreOperations.GetNITransactionResultResponse>): any => {

            if (ObjectExtensions.isNullOrUndefined(response) ||
                ObjectExtensions.isNullOrUndefined(response.data) ||
                response.canceled) {
                this.scheduleNextPoll();
                return;
            }

            const result = response.data.result;

            if (result.Id > 0) {
                // ── Payment approved ──────────────────────────────────
                this.clearPollTimer();
                this.paymentstatus = "PURCHASED";
                this.showStatus("Payment approved!", false);

                // For void flow where we already have the original tender line, no need to add another tender
                //if (this.originalId !== "" && this.requestStatus === NIRequestType.Void) {
                //    this.endDialogClicked();
                //} else {
                //    this.AddingToTender(this.Amount, this.TenderType, result.CardType, result.PanMasked, result.AuthCode,result.Rrn)
                //        .then(() => {
                //        this.endDialogClicked();
                //    }).catch(() => {
                //        this.endDialogClicked();
                //    });
                //}

                this.AddingToTender(this.Amount, this.TenderType, result.CardType, result.PanMasked, result.AuthCode, result.Rrn ?? "")
                    .then(() => { this.endDialogClicked(); })
                    .catch(() => { this.endDialogClicked(); });

            } else {
                const errMsg = result.errMsg || "";

                if (errMsg.indexOf("Transaction not found") !== -1) {
                    // ── Transaction not on terminal — stop polling ──
                    this.clearPollTimer();
                    this.SourceId("");
                    this.showStatus(errMsg.replace("API_error", ""), true);
                    this.checkStatusButton.disabled = false;

                } else if (result.errCode && result.errCode !== "") {
                    // ── Hard failure (declined, error code returned) ──
                    this.clearPollTimer();
                    this.showStatus("Payment not completed: " + errMsg, true);
                    this.checkStatusButton.disabled = false;

                } else {
                    // ── Still in progress — re-poll ──────────────────
                    this.showStatus("Payment in progress... " + errMsg.replace("API_error", ""), false);
                    this.checkStatusButton.disabled = false;
                    this.scheduleNextPoll();
                }
            }
        }).catch((reason: any) => {
            this._context.logger.logError("NIPaymentDialog.CheckStatus: " + JSON.stringify(reason));
            this.checkStatusButton.disabled = false;
            this.scheduleNextPoll();
        });
    }

    // ─────────────────────────────────────────────────────────────
    //  Cancel button
    // ─────────────────────────────────────────────────────────────

    public closeDialogClicked(): void {
        this.clearPollTimer();

        if (this.SourceId() === "") {
            this.resolveAndClose("Closed");
            return;
        }

        const amountInFils = (parseFloat(this.Amount.toString()) * 100).toString();

        // Check if payment completed before cancelling
        this.context.runtime.executeAsync(
            new StoreOperations.GetNITransactionResultRequest<StoreOperations.GetNITransactionResultResponse>(this.Transactionid, this.SourceId(), amountInFils, this.TenderLineNumber, this._paymentType)
        ).then((response: ClientEntities.ICancelableDataResult<StoreOperations.GetNITransactionResultResponse>): any => {

            if (ObjectExtensions.isNullOrUndefined(response) ||
                ObjectExtensions.isNullOrUndefined(response.data) ||
                response.canceled) {
                this.resolveAndClose("Closed");
                return;
            }

            const result = response.data.result;

            if (result.Id > 0) {
                // Payment completed — add tender and close
                this.paymentstatus = "PURCHASED";
                if (this.originalId === "")
                {
                    this.AddingToTender(this.Amount, this.TenderType, result.CardType, result.PanMasked, result.AuthCode,result.Rrn)
                        .then(() => this.endDialogClicked())
                        .catch(() => this.endDialogClicked());
                } else {
                    this.endDialogClicked();
                }
            } else if (result.errMsg && result.errMsg.indexOf("Transaction not found") !== -1) {
                // Already gone from terminal — just close
                this.resolveAndClose("Closed");
            } else {
                // Not complete — send cancel to terminal
                this.context.runtime.executeAsync(
                    new StoreOperations.CancelCurrentNITransactionRequest<StoreOperations.CancelCurrentNITransactionResponse>(this.Transactionid,this.SourceId(), amountInFils,this.TenderLineNumber)
                ).then(() => {
                    this.resolveAndClose(this.paymentstatus === "PURCHASED" ? "true" : "Closed");
                }).catch(() => {
                    this.resolveAndClose(this.paymentstatus === "PURCHASED" ? "true" : "Closed");
                });
            }
        }).catch(() => {
            this.resolveAndClose("Closed");
        });
    }

    public endDialogClicked(): void {
        this.clearPollTimer();
        this.closeDialog();
        this.val = this.paymentstatus === "PURCHASED" ? "true" : "Closed";
        this.resolvePromise(this.val);
    }

    // ─────────────────────────────────────────────────────────────
    //  Tender line
    // ─────────────────────────────────────────────────────────────

    /**
     * Adds a preprocessed tender line to the cart with NI extension properties.
     * Extension properties stored:
     *   NI_INVOICENO = sourceId  (used by PreVoidPaymentTrigger to find the NI tender on void)
     *   NI_Line      = tenderLineNumber
     *   ORG_SOURCEID = originalId (for void traceability)
     */

    public AddingToTender(amount: number, selectedTenderId: string, cardType: string, panMask: string, authCode: string, rrn: string): Promise<any>
    {
        this.setButtonDisabledState("btnCancel", true);

        return this.context.runtime.executeAsync(new GetDeviceConfigurationClientRequest())
            .then((devResponse: ClientEntities.ICancelableDataResult<GetDeviceConfigurationClientResponse>): any => {

                const extensionProps: ProxyEntities.CommerceProperty[] = [
                    {
                        Key: "NI_INVOICENO",
                        Value: { StringValue: this.SourceId() } as ProxyEntities.CommercePropertyValue
                    },
                    {
                        Key: "NI_Line",
                        Value: { StringValue: this.TenderLineNumber } as ProxyEntities.CommercePropertyValue
                    },
                    {
                        Key: "ORG_SOURCEID",
                        Value: { StringValue: this.originalId } as ProxyEntities.CommercePropertyValue
                    }
                ];

                let tenderAmount = parseFloat(amount.toString());
                if (this.requestStatus === NIRequestType.Void) {
                    tenderAmount = tenderAmount * -1;
                }

                const tenderLine: ProxyEntities.TenderLine = {
                    TenderTypeId: selectedTenderId,
                    Currency: devResponse.data.result.Currency,
                    Amount: tenderAmount,
                    IsPreProcessed: true,
                    IsPolicyBypassed: false,
                    TenderLineId: "",
                    SignatureData: null,
                    IsVoidable: true,
                    ...(this._isCashLike ? {} : {
                        TransactionId: this.Transactionid,
                        CardTypeId: cardType,
                        MaskedCardNumber: panMask,
                        Authorization: this.buildAuthorizationXml(authCode, panMask, this.SourceId(), rrn),
                        StatusValue: 4,
                        ExtensionProperties: extensionProps
                    }),
                    
                };
                
                return this.context.runtime.executeAsync((new AddPreprocessedTenderLineToCartClientRequest(tenderLine)))
                    .then((cartResponse: ClientEntities.ICancelableDataResult<AddPreprocessedTenderLineToCartClientResponse>): any => {
                        if (!cartResponse.canceled) {
                            const cart: ProxyEntities.Cart = cartResponse.data.result;

                            if (cart.AmountDue <= 0 && !this.concludeAttempted) {
                                this.concludeAttempted = true;
                                const correlationId = this.context.logger.getNewCorrelationId();
                                return this.context.runtime.executeAsync(new ConcludeTransactionClientRequest(correlationId))
                                    .then(() => Promise.resolve())
                                    .catch((reason: any) => {
                                        const errStr = JSON.stringify(reason);
                                        if (errStr.indexOf("Microsoft_Dynamics_Commerce_Runtime_InvalidStatus") !== -1) {
                                            // Cart already concluded elsewhere — treat as success
                                            return Promise.resolve();
                                        }
                                        this._context.logger.logError("NIPaymentDialog.ConcludeTransaction: " + errStr);
                                        return Promise.resolve();
                                    });
                            }
                            return Promise.resolve();
                        }
                        return Promise.resolve();
                    });
            })
            .catch((reason: any) => {
                this._context.logger.logError("NIPaymentDialog.AddingToTender: " + JSON.stringify(reason));
                return Promise.resolve();
            });
    }


    private buildAuthorizationXml(authCode: string, panMask: string, sourceId: string, rrn: string): string {

        return `<![CDATA[<?xml version="1.0" encoding="utf-16"?>
                <ArrayOfPaymentProperty xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                  <PaymentProperty>
                    <Namespace>MerchantAccount</Namespace>
                    <Name>AssemblyName</Name>
                    <ValueType>String</ValueType>
                    <StoredStringValue>TSC.LMG.NIPaymentDevice</StoredStringValue>
                    <DecimalValue>0</DecimalValue>
                    <DateValue>0001-01-01T00:00:00</DateValue>
                    <SecurityLevel>None</SecurityLevel>
                    <IsEncrypted>false</IsEncrypted>
                    <IsPassword>false</IsPassword>
                    <IsReadOnly>false</IsReadOnly>
                    <IsHidden>false</IsHidden>
                    <DisplayHeight>1</DisplayHeight>
                    <SequenceNumber>0</SequenceNumber>
                  </PaymentProperty>
                  <PaymentProperty>
                    <Namespace>Connector</Namespace>
                    <Name>ConnectorName</Name>
                    <ValueType>String</ValueType>
                    <StoredStringValue>TestConnector</StoredStringValue>
                    <DecimalValue>0</DecimalValue>
                    <DateValue>0001-01-01T00:00:00</DateValue>
                    <SecurityLevel>None</SecurityLevel>
                    <IsEncrypted>false</IsEncrypted>
                    <IsPassword>false</IsPassword>
                    <IsReadOnly>false</IsReadOnly>
                    <IsHidden>false</IsHidden>
                    <DisplayHeight>1</DisplayHeight>
                    <SequenceNumber>0</SequenceNumber>
                  </PaymentProperty>
                  <PaymentProperty>
                    <Namespace>AuthorizationResponse</Namespace>
                    <Name>Properties</Name>
                    <ValueType>PropertyList</ValueType>
                    <DecimalValue>0</DecimalValue>
                    <DateValue>0001-01-01T00:00:00</DateValue>
                    <PropertyList>
                      <PaymentProperty>
                        <Namespace>AuthorizationResponse</Namespace>
                        <Name>ApprovalCode</Name>
                        <ValueType>String</ValueType>
                        <StoredStringValue>${authCode ?? ""}</StoredStringValue>
                        <DecimalValue>0</DecimalValue>
                        <DateValue>0001-01-01T00:00:00</DateValue>
                        <SecurityLevel>None</SecurityLevel>
                        <IsEncrypted>false</IsEncrypted>
                        <IsPassword>false</IsPassword>
                        <IsReadOnly>false</IsReadOnly>
                        <IsHidden>false</IsHidden>
                        <DisplayHeight>1</DisplayHeight>
                        <SequenceNumber>0</SequenceNumber>
                      </PaymentProperty>
                      <PaymentProperty>
                        <Namespace>AuthorizationResponse</Namespace>
                        <Name>CardNumber</Name>
                        <ValueType>String</ValueType>
                        <StoredStringValue>${panMask ?? ""}</StoredStringValue>
                        <DecimalValue>0</DecimalValue>
                        <DateValue>0001-01-01T00:00:00</DateValue>
                        <SecurityLevel>None</SecurityLevel>
                        <IsEncrypted>false</IsEncrypted>
                        <IsPassword>false</IsPassword>
                        <IsReadOnly>false</IsReadOnly>
                        <IsHidden>false</IsHidden>
                        <DisplayHeight>1</DisplayHeight>
                        <SequenceNumber>0</SequenceNumber>
                      </PaymentProperty>
                      <PaymentProperty>
                        <Namespace>AuthorizationResponse</Namespace>
                        <Name>ProviderTransactionId</Name>
                        <ValueType>String</ValueType>
                        <StoredStringValue>${sourceId ?? ""}</StoredStringValue>
                        <DecimalValue>0</DecimalValue>
                        <DateValue>0001-01-01T00:00:00</DateValue>
                        <SecurityLevel>None</SecurityLevel>
                        <IsEncrypted>false</IsEncrypted>
                        <IsPassword>false</IsPassword>
                        <IsReadOnly>false</IsReadOnly>
                        <IsHidden>false</IsHidden>
                        <DisplayHeight>1</DisplayHeight>
                        <SequenceNumber>0</SequenceNumber>
                      </PaymentProperty>
                      <PaymentProperty>
                        <Namespace>AuthorizationResponse</Namespace>
                        <Name>BankTransactionId</Name>
                        <ValueType>String</ValueType>
                        <StoredStringValue>${rrn ?? ""}</StoredStringValue>
                        <DecimalValue>0</DecimalValue>
                        <DateValue>0001-01-01T00:00:00</DateValue>
                        <SecurityLevel>None</SecurityLevel>
                        <IsEncrypted>false</IsEncrypted>
                        <IsPassword>false</IsPassword>
                        <IsReadOnly>false</IsReadOnly>
                        <IsHidden>false</IsHidden>
                        <DisplayHeight>1</DisplayHeight>
                        <SequenceNumber>0</SequenceNumber>
                      </PaymentProperty>
                    </PropertyList>
                    <SecurityLevel>None</SecurityLevel>
                    <IsEncrypted>false</IsEncrypted>
                    <IsPassword>false</IsPassword>
                    <IsReadOnly>false</IsReadOnly>
                    <IsHidden>false</IsHidden>
                    <DisplayHeight>1</DisplayHeight>
                    <SequenceNumber>0</SequenceNumber>
                  </PaymentProperty>
                </ArrayOfPaymentProperty>]]>`;
    }


    // ─────────────────────────────────────────────────────────────
    //  Private helpers
    // ─────────────────────────────────────────────────────────────

    private scheduleNextPoll(): void {
        this.clearPollTimer();
        this.intervalId = setTimeout(async () => {
            await this.CheckStatus();
        }, this.StatusInterval * 1000) as unknown as number;
    }

    private clearPollTimer(): void {
        if (this.intervalId !== null) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }
    }

    private lockRequestButton(): void {
        this.createInvoiceButton.disabled = true;
        this.createInvoiceButton.style.backgroundColor = "#49117C";
        this.createInvoiceButton.style.color = "#FFFFFF";
    }

    private unlockRequestButton(): void {
        this.createInvoiceButton.disabled = false;
        this.createInvoiceButton.style.backgroundColor = "#2266E3";
        this.createInvoiceButton.style.color = "#FFFFFF";
    }

    private showStatus(message: string, isError: boolean): void {
        if (this.statusTextLabel) {
            this.statusTextLabel.innerText = message;
            this.statusTextLabel.style.color = isError ? "red" : "#006600";
        }
    }

    private resolveAndClose(value: string): void {
        this.closeDialog();
        this.val = value;
        this.resolvePromise(value);
    }

    private resolvePromise(result: string): void {
        if (ObjectExtensions.isFunction(this.resolve)) {
            this.resolve({ selectedValue: result } as ISampleDialogResult);
            this.resolve = null;
        }
    }
}
