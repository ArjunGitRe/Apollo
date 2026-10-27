import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import * as Triggers from "PosApi/Extend/Triggers/PaymentTriggers";
import { AddPreprocessedTenderLineToCartClientRequest, ConcludeTransactionClientRequest, GetCurrentCartClientRequest, GetCurrentCartClientResponse } from "PosApi/Consume/Cart";
import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device";
import { StoreOperations } from "../DataService/DataServiceRequests.g";
import ShukranCustomerSearchDialog, { IShukranSearchResult } from "../Dialogs/Shukran/ShukranCustomerSearchDialog";
import ShukranCustomerEnrollOTP, { IOTPDialogResult } from "../Dialogs/Shukran/EnrollOtp/ShukranCustomerEnrollOTP";
import { IMessageDialogOptions, ShowMessageDialogClientRequest, ShowMessageDialogClientResponse } from "PosApi/Consume/Dialogs";
import ShukranRedeemDialog from "../Dialogs/Shukran/Redeem/ShukranRedeemDialog";
;

export default class PrePaymentTrigger extends Triggers.PrePaymentTrigger {

    private _deviceCurrency: string = "";
    private _shukranTenderType: string = "";
    private _storeCountryCode: string = "";
    private _blockedTenderTypeIds: string[] = [];

    public execute(options: Triggers.IPrePaymentTriggerOptions): Promise<ClientEntities.ICancelable> {

       
        let currentCartReq = new GetCurrentCartClientRequest<GetCurrentCartClientResponse>();

        return this.context.runtime.executeAsync(currentCartReq)
            .then((currentCartResp) => {

                let cart = currentCartResp.data.result;

                return this._getShukranTenderType()  
                    .then(() => {

                        const selectedTenderId = options.tenderType.TenderTypeId;

                        if (this._blockedTenderTypeIds.indexOf(selectedTenderId) !== -1) {
                            return Promise.resolve({ canceled: false });
                        }

                        return this._handleShukranFlow(cart, options);

                        
                    });
            });
    }

    private _handleShukranFlow(cart: ProxyEntities.Cart, options: Triggers.IPrePaymentTriggerOptions) {

        const shukranAcct = this._getCartExtensionValue(cart, "SHUKRAN_ACCT");
        const shukranProfileId = this._getCartExtensionValue(cart, "SHUKRAN_PROFILE_ID");

        const shukranAlreadyLinked =
            !!(shukranAcct && shukranAcct.trim() !== "") ||
            !!(shukranProfileId && shukranProfileId.trim() !== "");

        if (!shukranAlreadyLinked) {

            const isShukranPayment = options.tenderType.TenderTypeId === this._shukranTenderType;

            let searchDialog = new ShukranCustomerSearchDialog();

            return searchDialog.open()
                .then((searchResult) => {

                    if (!searchResult.confirmed) {
                        return Promise.resolve({ canceled: isShukranPayment });
                    }

                    let customerReq = new StoreOperations.SearchShukranCustomerRequest<StoreOperations.SearchShukranCustomerResponse>(
                        searchResult.searchType,searchResult.searchValue, this._storeCountryCode, "", cart.Id);

                    return this.context.runtime.executeAsync(customerReq)
                        .then((resp) => {

                            const profileResponse = resp.data.result;

                            if (profileResponse && !profileResponse.Success && profileResponse.Message) {
                                const msg = profileResponse.Message.toLowerCase();

                                if (msg.includes("not active")) {
                                    this._showMessage(profileResponse.Message);
                                    return { canceled: true };
                                }

                                if (msg.includes("not found")) {
                                    return this._showNoProfileDialog(searchResult);
                                }

                                // any other API-level failure
                                this._showMessage(profileResponse.Message);
                                return { canceled: true };
                            }

                            const hasProfile = !!(profileResponse && profileResponse.Success && profileResponse.CustomerProfileDetails);

                            if (hasProfile) {
                                this.context.navigator.navigate("ShukranCustomerProfileView", { customerProfile: resp.data.result, searchType: searchResult.searchType, inputMethod: searchResult.inputMethod });
                                return { canceled: true };
                            } else {
                                return this._showNoProfileDialog(searchResult);
                            }
                        })
                        .catch((err: any) => {
                            return { canceled: true };
                        });
                });
        }

        // Profile exists — check if Shukran tender
        if (options.tenderType.TenderTypeId !== this._shukranTenderType) {
            return { canceled: false };
        }

        const shukranAlreadyPaid = cart.TenderLines && cart.TenderLines.some(
            (t) => t.TenderTypeId === this._shukranTenderType && t.VoidStatusValue === 0);

        if (shukranAlreadyPaid) {
            this._showMessage("Shukran points have already been redeemed on this transaction.\n \n Please use another payment method for the remaining balance.");
            return { canceled: true };
        }

        let validationResult = this._validateRedeemConditions(cart);

        if (validationResult !== null) {
            this._showMessage(validationResult);
            return { canceled: true };
        }

        const cashValueStr = this._getCartExtensionValue(cart, "SHUKRAN_AVAILABLE_PTS_CASHVALUE");
        const pointsStr = this._getCartExtensionValue(cart, "SHUKRAN_AVAILABLE_PTS");

        const availableCashValue = cashValueStr ? Number(cashValueStr) : 0;
        const availablePoints = pointsStr ? Number(pointsStr) : 0;

        if (availableCashValue <= 0) {
            this._showMessage("No redeemable Shukran cash value available.");
            return { canceled: true };
        }

        return this._showRedeemDialog(cart, availableCashValue, availablePoints); 

    }
    private _startRedeemOTPFlow(cart: ProxyEntities.Cart, redeemAmount: number,tenderType: string): Promise<ClientEntities.ICancelable> {

        const phone = this._getCartExtensionValue(cart, "SHUKRAN_PHONE");
        const cardNumber = this._getCartExtensionValue(cart, "SHUKRAN_CARDNO");
        const langCode = this._getCartExtensionValue(cart, "SHUKRAN_LANGUAGE_CODE");

        if (!phone) {
            this._showMessage("Customer phone number not available for OTP validation.");
            return Promise.resolve({ canceled: true });
        }

        let languageRequest = new StoreOperations.GetLanguageDetailsRequest<StoreOperations.GetLanguageDetailsResponse>();
        return this.context.runtime.executeAsync(languageRequest)
            .then((langResp: ClientEntities.ICancelableDataResult<StoreOperations.GetLanguageDetailsResponse>) => {
                const languageOptions = langResp.data.result.LanguageOptions;

                const matched = languageOptions.find((l: any) => l.Value === langCode);
                const lang = matched ? matched.Text : langCode; 

                let otpRequest = new StoreOperations.CustomerRedeemOTPDetailsRequest<StoreOperations.CustomerRedeemOTPDetailsResponse>(phone, "", lang, cardNumber, "", cart.Id);
                return this.context.runtime.executeAsync(otpRequest)
                    .then((otpResp: ClientEntities.ICancelableDataResult<StoreOperations.CustomerRedeemOTPDetailsResponse>) => {

                        const result = otpResp.data.result;

                        if (!result.Success) {
                            this._showMessage("Failed to send redemption OTP.");
                            return { canceled: true };
                        }

                        const guid = result.Guid;

                        let otpDialog: ShukranCustomerEnrollOTP = new ShukranCustomerEnrollOTP();

                        return otpDialog.open(phone)
                            .then((dialogResult: IOTPDialogResult) => {

                                if (!dialogResult.success) {
                                    return { canceled: true };
                                }

                                let verifyRequest =
                                    new StoreOperations.VerifyShukranOTPRequest<
                                        StoreOperations.VerifyShukranOTPResponse>(
                                            guid,
                                            dialogResult.otpValue
                                        );

                                return this.context.runtime.executeAsync(verifyRequest)
                                    .then((verifyResp: ClientEntities.ICancelableDataResult<StoreOperations.VerifyShukranOTPResponse>) => {

                                        if (!verifyResp.data.result.IsValid) {
                                            this._showMessage("Invalid OTP. Please try again.");
                                            return { canceled: true };
                                        }

                                        return this._addShukranTender(cart, redeemAmount, tenderType);
                                    });
                            });
                    });

            });

        
    }

    private _getShukranTenderType(): Promise<string> {

        let deviceReq = new GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse>(
            this.context.logger.getNewCorrelationId()
        );

        return this.context.runtime.executeAsync(deviceReq)
            .then((response: ClientEntities.ICancelableDataResult<GetDeviceConfigurationClientResponse>) => {

                const config = response.data.result;

                const prop = config.ExtensionProperties.find(p => p.Key === "SKRNTENDERTYPE");
                const countryProp = config.ExtensionProperties.find(p => p.Key === "StoreCountryCode");
                const blockedProp = config.ExtensionProperties.find(p => p.Key === "BlockedTenderTypeIds");


                this._shukranTenderType = prop?.Value?.StringValue || "";
                this._deviceCurrency = config.Currency || "";  
                this._storeCountryCode = countryProp?.Value?.StringValue || "";
               

                const blockedRaw = blockedProp?.Value?.StringValue || "";
                this._blockedTenderTypeIds = blockedRaw ? blockedRaw.split(",").map(id => id.trim()).filter(id => id !== "") : [];

                return this._shukranTenderType;
            });
    }

    private _showNoProfileDialog(searchResult?: IShukranSearchResult): Promise<ClientEntities.ICancelable> {

        const dialogOptions: IMessageDialogOptions = {
            title: "No Shukran Profile Found",
            message: "This customer does not have a Shukran loyalty profile.\n\nWould you like to enroll them now?",
            button1: {
                id: "btnYes",
                label: "Yes, Enroll",
                result: "Yes"
            },
            button2: {
                id: "btnNo",
                label: "No",
                result: "No"
            }
        };

        const dialogRequest = new ShowMessageDialogClientRequest<ShowMessageDialogClientResponse>(dialogOptions);

        return this.context.runtime.executeAsync(dialogRequest)
            .then((dialogResult: ClientEntities.ICancelableDataResult<ShowMessageDialogClientResponse>) => {

                if (!dialogResult.canceled &&
                    dialogResult.data.result.dialogResult === "Yes") {
                    let enrollOptions: any = {};
                    if (searchResult && searchResult.searchType === "PhoneNumber" && searchResult.phoneNumber && searchResult.phonePrefix)
                    {
                        enrollOptions.prefillPhone = {
                            phoneNumber: searchResult.phoneNumber,
                            phonePrefix: searchResult.phonePrefix,
                            countryRegionId: searchResult.phoneCountryRegionId || ""
                        };
                    }

                    this.context.navigator.navigate("ShukranCustomerEnrollmentView", enrollOptions);
                    return { canceled: true };
                }

                return { canceled: false };
            })
            .catch(() => {
                return { canceled: true };
            });
    }

    private _validateRedeemConditions(cart: ProxyEntities.Cart): string | null {

        //const storeCountry = this._getCartExtensionValue(cart, "STORE_COUNTRYCODE");
        //const customerCountry = this._getCartExtensionValue(cart, "SHUKRAN_COUNTRYCODE");

        const redeemable = this._getCartExtensionValue(cart, "SHUKRAN_REDEEMABLE");
        const accruable = this._getCartExtensionValue(cart, "SHUKRAN_ACCRUABLE");

        //const availableCashValueStr = this._getCartExtensionValue(cart, "SHUKRAN_AVAILABLE_PTS_CASHVALUE");
        //const availableCashValue = availableCashValueStr ? Number(availableCashValueStr) : 0;

        //const cartTotal = cart.TotalAmount || 0;

        // Country validation
        //if (storeCountry && customerCountry && storeCountry !== customerCountry) {
        //    return "Shukran redemption is not allowed because the store country does not match the customer's Shukran country.";
        //}


        // Redeemable / Accruable validation
        if (redeemable !== "Y" || accruable !== "Y") {
            return "This customer is not eligible to redeem Shukran points.";
        }

        // Full amount redemption validation
        //if (availableCashValue >= cartTotal) {
        //    return "Full amount redemption is not allowed. Please redeem partially and pay the balance using another payment method.";
        //}

        return null;
    }

    private _showMessage(message: string): void {

        let options: IMessageDialogOptions = {
            message: message
        };

        let dialogRequest = new ShowMessageDialogClientRequest(options);
        this.context.runtime.executeAsync(dialogRequest);
    }

    private _getCartExtensionValue(cart: ProxyEntities.Cart, key: string): string | null {

        if (!cart || !cart.ExtensionProperties || cart.ExtensionProperties.length === 0) {
            return null;
        }

        const prop = cart.ExtensionProperties.find(
            (p: ProxyEntities.CommerceProperty) => p.Key === key
        );

        if (!prop || !prop.Value) {
            return null;
        }

        if (prop.Value.StringValue !== undefined && prop.Value.StringValue !== null) {
            return prop.Value.StringValue;
        }

        if (prop.Value.DecimalValue !== undefined && prop.Value.DecimalValue !== null) {
            return prop.Value.DecimalValue.toString();
        }

        if (prop.Value.BooleanValue !== undefined && prop.Value.BooleanValue !== null) {
            return prop.Value.BooleanValue.toString();
        }
        return null;
    }

    private _showRedeemDialog(cart: ProxyEntities.Cart, availableCashValue: number, availablePoints:number): Promise<ClientEntities.ICancelable> {

        let redeemDialog = new ShukranRedeemDialog();

        return redeemDialog.open(availablePoints,availableCashValue)
            .then((redeemAmount: number | null) => {

                if (!redeemAmount) {
                    return { canceled: true };
                }

                return this._startRedeemOTPFlow(cart, redeemAmount, this._shukranTenderType);
            });
    }

    private _addShukranTender(cart: ProxyEntities.Cart,amount: number,tenderType: string): Promise<ClientEntities.ICancelable> {

        let tenderLine: ProxyEntities.TenderLine = {
            TenderTypeId: tenderType,
            Currency: this._deviceCurrency /*"USD"*/,
            Amount: amount,
            TransactionId: cart.Id,
            IsPreProcessed: true,
            ExtensionProperties: []
        };

        return this.context.runtime.executeAsync(new AddPreprocessedTenderLineToCartClientRequest(tenderLine))
            .then((response) => {

                if (response.canceled) {
                    return { canceled: true };
                }
                
                let updatedCart = response.data.result;

                if (updatedCart.AmountDue <= 0) {

                    let correlationId: string = this.context.logger.getNewCorrelationId();

                    return this.context.runtime.executeAsync(new ConcludeTransactionClientRequest(correlationId))
                        .then(() => {
                            return { canceled: false };
                        });
                }
                return { canceled: true };
            });
    } 
}