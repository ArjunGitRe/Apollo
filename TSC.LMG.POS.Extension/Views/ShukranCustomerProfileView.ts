//import { ProxyEntities } from "PosApi/Entities";
import { CustomViewControllerBase, CustomViewControllerExecuteCommandArgs, ICustomViewControllerConfiguration, ICustomViewControllerContext } from "PosApi/Create/Views";
import * as Views from "PosApi/Create/Views";
import ko from "../Libraries/knockout";
import { Entities, StoreOperations } from "../DataService/DataServiceRequests.g"
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import * as Cart from "PosApi/Consume/Cart";
import { SaveExtensionPropertiesOnCartClientRequest, SaveExtensionPropertiesOnCartClientResponse } from "PosApi/Consume/Cart";
//import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";
import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse, TriggerToastNotificationClientRequest, TriggerToastNotificationClientResponse } from "PosApi/Consume/Device";
import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";

export interface IShukranCustomerProfileViewOptions {
    customerProfile: Entities.CustomerProfileSearchResponse;
    searchType?: string;
    inputMethod?: string;
}

export default class ShukranCustomerProfileView extends CustomViewControllerBase {
    
    public hasProfile: ko.Observable<boolean>;
    public profileDetails: ko.Observable<Entities.CustomerProfileDetails>;

    public tierUpgradeCriteria: ko.Observable<string>;
    public tierRetentionCriteria: ko.Observable<string>;
    public accruableRedeemable: ko.Observable<string>;
    public accruableClass: ko.Observable<string>;
    public redeemableClass: ko.Observable<string>;
    public availablePoints: ko.Observable<string>;
    public availablePointsCashValue: ko.Observable<string>;
    public languageDisplay: ko.Observable<string>;


    public coupons: ko.ObservableArray<Entities.CustomerCouponDetails>;
    public couponState: ko.Observable<"idle" | "loading" | "loaded" | "error">;
    public couponsError: ko.Observable<string>;
    public hasCoupons: ko.Computed<boolean>;
    public loadCoupons: () => void;

    public addToCartState: ko.Observable<"idle" | "loading" | "success" | "error">;
    public addToCartMessage: ko.Observable<string>;

    private _profileId: string;
    private _storeCode: string;
    private _conceptCode: string;
    private _shukranCustAccount: string; 
    private _searchType: string;
    private _inputMethod: string;
    private _decimalPrecision: number = 2;

    public selectedCoupon: ko.Observable<Entities.CustomerCouponDetails | null>;
    public voucherState: ko.Observable<"idle" | "loading" | "success" | "error">;
    public voucherMessage: ko.Observable<string>;
    public selectCoupon: (coupon: Entities.CustomerCouponDetails) => void;
    public applySelectedVoucher: () => void;

    constructor(context: ICustomViewControllerContext, options?: IShukranCustomerProfileViewOptions) {
        let config: ICustomViewControllerConfiguration =
        {
            title: "Shurkan Customer Profile",
            commandBar:
            {
                commands:
                    [
                        {
                            name: "Cancel Data",
                            label: "Cancel",
                            icon: Views.Icons.Cancel,
                            isVisible: true,
                            canExecute: true,
                            execute: (args: CustomViewControllerExecuteCommandArgs): void => {
                                //this.warningMessage(" Are you sure do you want to cancel.? ")
                                this.context.navigator.navigateToPOSView("CartView");
                                
                            }
                        },
                        {
                            name: "Add",
                            label: "Add",
                            icon: Views.Icons.Add,
                            isVisible: true,
                            canExecute: true,
                            execute: (args: CustomViewControllerExecuteCommandArgs): void => {
                                this._addCustomerToCart();
                            }
                        }
                    ]
            }
        };

        super(context, config);
        this._searchType = options && options.searchType ? options.searchType : "";
        this._inputMethod = options?.inputMethod ?? "TYPED"; 

        const response = options && options.customerProfile ? options.customerProfile : null;
        const details = response && response.Success && response.CustomerProfileDetails
            ? response.CustomerProfileDetails
            : null;

        this.hasProfile = ko.observable(details !== null);
        this.profileDetails = ko.observable(details);
       

        this.languageDisplay = ko.computed(() => {
            const details = this.profileDetails();
            if (!details) { return "—"; }

            const languageMap: { [key: string]: string } = {
                "EN_US": "English",
                "AR_AE": "Arabic"
            };

            const code = (details.LanguageCode || "").toUpperCase();
            return languageMap[code] || details.LanguageCode || "—";
        });

        this.coupons = ko.observableArray([]);
        this.couponState = ko.observable<"idle" | "loading" | "loaded" | "error">("idle");
        this.couponsError = ko.observable("");
        this.hasCoupons = ko.computed(() => this.coupons().length > 0);

        this.addToCartState = ko.observable<"idle" | "loading" | "success" | "error">("idle");
        this.addToCartMessage = ko.observable("");

        this.loadCoupons = () => { this._fetchCoupons(); };

        this._shukranCustAccount = response && response.ShukranCustAccount? response.ShukranCustAccount.trim(): "";

        this.selectedCoupon = ko.observable<Entities.CustomerCouponDetails | null>(null);
        this.voucherState = ko.observable<"idle" | "loading" | "success" | "error">("idle");
        this.voucherMessage = ko.observable("");

        this.selectCoupon = (coupon: Entities.CustomerCouponDetails): void => {
            // Toggle selection — clicking the same coupon deselects it
            if (this.selectedCoupon() && this.selectedCoupon().VoucherNumber === coupon.VoucherNumber) {
                this.selectedCoupon(null);
            } else {
                this.selectedCoupon(coupon);
                this.voucherState("idle");
                this.voucherMessage("");
            }
        };
        this.applySelectedVoucher = (): void => {
            const coupon = this.selectedCoupon();
            if (!coupon) {
                this.voucherMessage("Please select a coupon first.");
                this.voucherState("error");
                return;
            }
            this._applyVoucherToCart(coupon);
        };

        if (details) {
            const ext = details.JsonExternalData as any;  // JsonExternalData holds ReqQualTxnForNxtTier, RetTierQualTxn, AvailablePoints
            
           
            // "X qualifying transactions required by <LastEvaluateDate>"
            const reqTxn = ext && ext.ReqQualTxnForNxtTier != null ? ext.ReqQualTxnForNxtTier : null;
            const evalDate = details.LastEvaluateDate
                ? new Date(details.LastEvaluateDate).toLocaleDateString()
                : null;
            this.tierUpgradeCriteria = ko.observable(
                reqTxn !== null && evalDate ? `${reqTxn} by ${evalDate}`: evalDate ? `By ${evalDate}`: "—"
            );

            
            // "X qualifying transactions — expires <TierExpiryDate>"
            const retTxn = ext && ext.RetTierQualTxn != null ? ext.RetTierQualTxn : null;
            const expiryDate = details.TierExpiryDate && details.TierExpiryDate !== ""
                ? new Date(details.TierExpiryDate).toLocaleDateString()
                : null;

            this.tierRetentionCriteria = ko.observable(
                retTxn !== null && expiryDate ? `${retTxn}  by ${expiryDate}`: retTxn !== null
                        ? `${retTxn} ` : expiryDate ? `by  ${expiryDate}` : "—"
            );


            // Y if EnrollmentStatus = "Active" OR "Suspended"
            const status = (details.EnrollmentStatus || "").toLowerCase();
            const accruable = (status === "active" || status === "suspended");

            
            // Y if Active AND has phone AND AvailablePoints > 0
            const hasPhone = details.Phones && details.Phones.length > 0
                && details.Phones.some((p: any) => p.PhoneNumber && p.PhoneNumber !== "Null" && p.PhoneNumber !== "");
            const availPoints = ext && ext.AvailablePoints != null ? Number(ext.AvailablePoints) : 0;
            const availPointsCashValue = ext && ext.AvailablePointsCashValue != null ? Number(ext.AvailablePointsCashValue) : 0;
            const redeemable = (status === "active") && hasPhone && (availPoints > 0);

            this.availablePoints = ko.observable(availPoints);
            this.availablePointsCashValue = ko.observable(availPointsCashValue);


            const accStr = accruable ? "Y" : "N";
            const redStr = redeemable ? "Y" : "N";

            this.accruableRedeemable = ko.observable(`${accStr} / ${redStr}`);

            // CSS classes for colour coding each letter
            this.accruableClass = ko.observable(accruable ? "spv-badge--yes" : "spv-badge--no");
            this.redeemableClass = ko.observable(redeemable ? "spv-badge--yes" : "spv-badge--no");

            this._profileId = details.ProfileId || "";
            this._storeCode = response.CustomerProfileDetails.EnrollmentStoreCode || "";
            this._conceptCode = "";

        } else {
            this.tierUpgradeCriteria = ko.observable("—");
            this.tierRetentionCriteria = ko.observable("—");
            this.accruableRedeemable = ko.observable("— / —");
            this.accruableClass = ko.observable("");
            this.redeemableClass = ko.observable("");
            this.availablePoints = ko.observable("0");
            this._profileId = "";
            this._storeCode = "";
            this._conceptCode = "";
            this.availablePointsCashValue = ko.observable("0");
           
        }

       
    }
    cancelOperation() {
        throw new Error("Method not implemented.");
    }
    _addCustomerToCart() {

        if (this.addToCartState() === "loading") {
            return;
        }

        if (!this._shukranCustAccount) {
            this.addToCartMessage("No Shukran account found for this customer.");
            this.addToCartState("error");
            return;
        }

        this.addToCartState("loading");
        this.addToCartMessage("");

        const setCustomerReq = new Cart.SetCustomerOnCartOperationRequest<Cart.SetCustomerOnCartOperationResponse>("", this._shukranCustAccount);
        this.context.runtime.executeAsync(setCustomerReq)
            .then((resp: ClientEntities.ICancelableDataResult<Cart.SetCustomerOnCartOperationResponse>) => {
                if (resp && !resp.canceled) {
                    this.addToCartState("success");
                    this.addToCartMessage("Customer successfully added to cart.");
                   
                } else {
                    this.addToCartState("idle");
                    this.addToCartMessage("");
                }
                return this._saveCustomerExtensionPropertiesOnCart()
                    .then(() => {
                        ShukranCustomerProfileView._showToastNotification(
                            this.context.runtime,
                            "Shukran",
                            "Shukran customer is added.",
                            "",   // or a static GUID string if correlationId() isn't available
                            ClientEntities.ToastMessageType.SUCCESS
                        );
                    })
                    .then(() => {
                        this.context.navigator.navigateToPOSView("CartView");
                    });
                
            })
            .catch((err: any) => {
                console.error("Add customer to cart error:", err);
                this.addToCartState("error");
                this.addToCartMessage("Failed to add customer to cart. Please try again.");
            });
    }

    onReady(element: HTMLElement): void {
        ko.applyBindings(this, element);
        this._loadDecimalPrecision().then(() => {
            this._applyFormattedValues();
        });
        this._refreshAddButtonVisibility();
       
    }

    private _fetchCoupons(): void {
        if (!this._profileId) {
            this.couponsError("No profile ID available.");
            this.couponState("error");
            return;
        }

        // Prevent double-fetch
        if (this.couponState() === "loading" || this.couponState() === "loaded") {
            return;
        }

        this.couponState("loading");
        this.couponsError("");

        const getCartReq = new Cart.GetCurrentCartClientRequest<Cart.GetCurrentCartClientResponse>();
        this.context.runtime.executeAsync(getCartReq)
            .then((cartResp: ClientEntities.ICancelableDataResult<Cart.GetCurrentCartClientResponse>) => {
                const transactionId = (!cartResp || cartResp.canceled || !cartResp.data?.result)
                    ? ""
                    : cartResp.data.result.Id || "";

                // ── Step 2: Fire coupon request with transaction ID ──
                const couponReq = new StoreOperations.CustomerCoupnDetailsRequest<StoreOperations.CustomerCoupnDetailsResponse>(this._storeCode, this._profileId, this._conceptCode, "INQUIRY", transactionId);
                return this.context.runtime.executeAsync(couponReq);
            })
            .then((resp: ClientEntities.ICancelableDataResult<StoreOperations.CustomerCoupnDetailsResponse>) => {
                if (!resp || resp.canceled || !resp.data) {
                    this.couponsError("No response received.");
                    this.couponState("error");
                    return;
                }

                const result = resp.data.result;
                if (!result) {
                    this.couponsError("Empty response from coupon service.");
                    this.couponState("error");
                    return;
                }

                const couponResult = result.CustomerCouponDetails;
                if (couponResult && couponResult.Success && couponResult.Coupons && couponResult.Coupons.length > 0) {
                    this.coupons(couponResult.Coupons);
                } else if (couponResult && couponResult.Success) {
                    this.coupons([]);
                } else {
                    const msg = (couponResult && couponResult.Message) ? couponResult.Message : "No coupons returned.";
                    this.couponsError(msg);
                    this.couponState("error");
                    return;
                }
                this.couponState("loaded");
            })
            .catch((err: any) => {
                console.error("Coupon fetch error:", err);
                this.couponsError("Failed to load coupons. Please try again.");
                this.couponState("error");
            });
    }

    private _saveCustomerExtensionPropertiesOnCart(): Promise<any> {

        const details = this.profileDetails();
        const ext = details ? (details.JsonExternalData as any) : null;

        // Helper to create a string-typed CommerceProperty
        const strProp = (key: string, value: string): ProxyEntities.CommerceProperty => ({
            Key: key,
            Value: { StringValue: value || "" } as ProxyEntities.CommercePropertyValue
        });

        // Helper to create a decimal-typed CommerceProperty
        const decProp = (key: string, value: number): ProxyEntities.CommerceProperty => ({
            Key: key,
            Value: { DecimalValue: value } as ProxyEntities.CommercePropertyValue
        });

        const properties: ProxyEntities.CommerceProperty[] = [];

        // Always write the Shukran account number
        properties.push(strProp("SHUKRAN_ACCT", this._shukranCustAccount));
        if (details) {
            properties.push(strProp("SHUKRAN_PROFILE_ID", details.ProfileId || ""));
            properties.push(strProp("SHUKRAN_TIER", details.TierName || ""));
            properties.push(strProp("SHUKRAN_CARDNO", details.CardNumber || ""));
            properties.push(strProp("SHUKRAN_ENROLLMENT", details.EnrollmentStatus || ""));
            properties.push(strProp("SHUKRAN_STORE_CODE", this._storeCode));
            properties.push(strProp("SHUKRAN_SEARCH_TYPE", this._searchType));
            properties.push(strProp("SHUKRAN_INPUT_METHOD", this._inputMethod));
            
            const status = (details.EnrollmentStatus || "").toLowerCase();
            const accruable = status === "active" || status === "suspended";
            const hasPhone = details.Phones && details.Phones.length > 0
                && details.Phones.some((p: any) => p.PhoneNumber && p.PhoneNumber !== "Null" && p.PhoneNumber !== "");
            const availPts = ext && ext.AvailablePoints != null ? Number(ext.AvailablePoints) : 0;
            const availPointsCashValue = ext && ext.AvailablePointsCashValue != null ? Number(ext.AvailablePointsCashValue) : 0;
            const redeemable = status === "active" && hasPhone && availPts > 0;

            properties.push(strProp("SHUKRAN_ACCRUABLE", accruable ? "Y" : "N"));
            properties.push(strProp("SHUKRAN_REDEEMABLE", redeemable ? "Y" : "N"));
            properties.push(decProp("SHUKRAN_AVAILABLE_PTS", availPts));
            properties.push(decProp("SHUKRAN_AVAILABLE_PTS_CASHVALUE", availPointsCashValue));

            let phoneNumber: string = "";

            if (details.Phones && details.Phones.length > 0) {
                const phone = details.Phones.find((p: any) =>
                    p.PhoneNumber && p.PhoneNumber !== "Null" && p.PhoneNumber !== ""
                );

                if (phone) {
                    phoneNumber = phone.PhoneNumber;
                }
            }

            properties.push(strProp("SHUKRAN_PHONE", phoneNumber));

            properties.push(strProp("SHUKRAN_FIRST_NAME", details.FirstName || ""));
            properties.push(strProp("SHUKRAN_LAST_NAME", details.LastName || ""));
            properties.push(strProp("SHUKRAN_PREFIX", details.Prefix || ""));
            properties.push(strProp("SHUKRAN_EMAIL", details.Email || ""));
            properties.push(strProp("SHUKRAN_STATUS", details.EnrollmentStatus || ""));
            properties.push(strProp("SHUKRAN_LANGUAGE_CODE", details.LanguageCode || ""));

            //country code
            const countryCode = (details.Phones && details.Phones.length > 0 && details.Phones[0].ISDCode)
                ? details.Phones[0].ISDCode
                : (details.CountryCode || "");
            properties.push(strProp("SHUKRAN_COUNTRY_CODE", countryCode));

            //joindate
            const joinDateRaw = details.JoinDate || (ext && ext.JoinDate) || "";
            const joinDateStr = joinDateRaw
                ? new Date(joinDateRaw).toISOString() 
                : "";
            properties.push(strProp("SHUKRAN_JOIN_DATE", joinDateStr));
            properties.push(strProp("SHUKRAN_CUST_COUNTRY", details.Country || ""));

            properties.push(strProp("SHUKRAN_GENDER", details.Gender || ""));
            properties.push(strProp("SHUKRAN_NATIONALITY", details.Nationality || ""));

            const phoneCountry = (details.Phones && details.Phones.length > 0 && details.Phones[0].CountryRegionId)
                ? details.Phones[0].ShortName
                : "";
            properties.push(strProp("SHUKRAN_COUNTRY", phoneCountry));

            const birthDateRaw = details.BirthDate || "";
            const birthDateStr = birthDateRaw ? new Date(birthDateRaw).toISOString().split("T")[0] : "";
            properties.push(strProp("SHUKRAN_BIRTH_DATE", birthDateStr));


        }

        const saveExtPropsReq =
            new SaveExtensionPropertiesOnCartClientRequest<SaveExtensionPropertiesOnCartClientResponse>(properties);

        return this.context.runtime.executeAsync(saveExtPropsReq)
            .then((resp: ClientEntities.ICancelableDataResult<SaveExtensionPropertiesOnCartClientResponse>) => {
                if (resp && resp.canceled) {
                    console.warn("SaveExtensionPropertiesOnCart was cancelled.");
                }
                
            })
            .catch((err: any) => {
                
                console.error("Failed to save extension properties on cart:", err);
            });
    }

    private _refreshAddButtonVisibility(): void {
        const getCartReq = new Cart.GetCurrentCartClientRequest<Cart.GetCurrentCartClientResponse>();
        this.context.runtime.executeAsync(getCartReq)
            .then((resp: ClientEntities.ICancelableDataResult<Cart.GetCurrentCartClientResponse>) => {
                if (resp && !resp.canceled && resp.data && resp.data.result) {
                    const cart = resp.data.result;
                    const hasCustomer = !!(cart.CustomerId && cart.CustomerId.trim() !== "");
                    this.state.commandBar.commands[1].isVisible = !hasCustomer;
                    this.state.commandBar.commands[1].canExecute = !hasCustomer;
                }
            })
            .catch((err: any) => {
                console.error("Failed to get cart for customer check:", err);
            });
    }

   
    private _showNotification(message: string): Promise<void> {
        let options: IMessageDialogOptions = {
            message: message,
            title: "Shukran"
        };
        let dialogRequest = new ShowMessageDialogClientRequest(options);
        return this.context.runtime.executeAsync(dialogRequest)
            .then(() => { return; })
            .catch(() => { return; });
    }

    private static _showToastNotification(runtime: ICustomViewControllerContext["runtime"], title: string, msg: string, correlationId: string, notificationMessageType: ClientEntities.ToastMessageType): void
    {
        const notificationContent: Commerce.Client.Entities.IToastNotificationComponentContent = {
            notificationTitle: title,
            notificationMessageType: notificationMessageType,
            notificationBody: msg
        };

        const showMessageReq = new TriggerToastNotificationClientRequest<TriggerToastNotificationClientResponse>(correlationId, notificationContent);
        runtime.executeAsync(showMessageReq);
    }

    private _loadDecimalPrecision(): Promise<void> {
        const request = new GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse>();

        return this.context.runtime.executeAsync(request)
            .then((response: ClientEntities.ICancelableDataResult<GetDeviceConfigurationClientResponse>) => {
                if (response && !response.canceled && response.data && response.data.result) {
                    const config = response.data.result;

                    const decimalValue = config.ExtensionProperties?.find(p => p.Key === "TscDecimalPoint");

                    if (decimalValue && decimalValue.Value && decimalValue.Value.StringValue) {
                        this._decimalPrecision = Number(decimalValue.Value.StringValue);
                    }
                }
            })
            .catch((err: any) => {
                console.error("Failed to load decimal precision:", err);
            });
    }

    private _formatDecimal(value: number): string {
        return value.toFixed(this._decimalPrecision);

    }

    private _applyFormattedValues(): void {
        const details = this.profileDetails();
        const ext = details ? (details.JsonExternalData as any) : null;

        const availPoints = ext && ext.AvailablePoints != null ? Number(ext.AvailablePoints) : 0;
        const availPointsCashValue = ext && ext.AvailablePointsCashValue != null ? Number(ext.AvailablePointsCashValue) : 0;

        this.availablePoints(this._formatDecimal(availPoints));
        this.availablePointsCashValue(this._formatDecimal(availPointsCashValue));

    }

    private _ensureCustomerOnCart(cart: ProxyEntities.Cart): Promise<void> {
        const alreadyLinked = !!(cart.CustomerId && cart.CustomerId.trim() !== "");

        if (alreadyLinked || !this._shukranCustAccount) {
            return Promise.resolve();
        }

        const setCustomerReq = new Cart.SetCustomerOnCartOperationRequest<Cart.SetCustomerOnCartOperationResponse>(
            "", this._shukranCustAccount
        );

        return this.context.runtime.executeAsync(setCustomerReq)
            .then((resp: ClientEntities.ICancelableDataResult<Cart.SetCustomerOnCartOperationResponse>) => {
                if (resp && !resp.canceled) {
                    return this._saveCustomerExtensionPropertiesOnCart();
                }
                return Promise.resolve();
            })
            .catch((err: any) => {
                console.error("Failed to set Shukran customer on cart during coupon apply:", err);
            });
    }
    

    private _applyVoucherToCart(coupon: Entities.CustomerCouponDetails): void {
        if (this.voucherState() === "loading") return;

        this.voucherState("loading");
        this.voucherMessage("");

        const getCartReq = new Cart.GetCurrentCartClientRequest<Cart.GetCurrentCartClientResponse>();
        this.context.runtime.executeAsync(getCartReq)
            .then((resp: ClientEntities.ICancelableDataResult<Cart.GetCurrentCartClientResponse>) => {
                if (!resp || resp.canceled || !resp.data?.result) {
                    this.voucherState("error");
                    this.voucherMessage("Unable to retrieve cart.");
                    return Promise.reject("cart_unavailable");
                }

                const cart = resp.data.result;

                return this._ensureCustomerOnCart(cart)
                    .then(() => {

                        return this._validateProductHasOffer(cart, coupon)
                            .then((hasOffer: boolean) => {
                                if (!hasOffer) {
                                    
                                    return Promise.reject("no_offer_for_product");
                                }
                           
                            // ── Eligible lines: active, positive qty, NO existing discount ──
                            const eligibleLines = (cart.CartLines || []).filter((l: ProxyEntities.CartLine) => {
                                if (l.IsVoided || (l.Quantity || 0) <= 0) return false;
                                const hasDiscount =
                                    (l.DiscountAmount != null && l.DiscountAmount > 0) ||
                                    (l.LineDiscount != null && l.LineDiscount > 0) ||
                                    (l.LinePercentageDiscount != null && l.LinePercentageDiscount > 0) ||
                                    (l.LineManualDiscountAmount != null && l.LineManualDiscountAmount > 0) ||
                                    (l.DiscountLines != null && l.DiscountLines.length > 0) ||
                                    (l.LineManualDiscountPercentage != null && l.LineManualDiscountPercentage > 0);
                                return !hasDiscount;
                            });

                            if (eligibleLines.length === 0) {
                                this.voucherState("error");
                                this.voucherMessage("All cart items already have a discount applied. Voucher cannot be used.");
                                return Promise.reject("no_eligible_lines");
                            }

                            // ── FIX: parse threshold as number, calculate total synchronously ──
                            const threshold = coupon.ThresholdAmount ? parseFloat(String(coupon.ThresholdAmount)) : 0;

                            const eligibleTotal = eligibleLines.reduce((sum: number, l: ProxyEntities.CartLine) => {
                                return sum + (l.Price || 0) * (l.Quantity || 1);
                            }, 0);

                            // ── FIX: only block if threshold is actually set (> 0) ──
                            if (threshold > 0 && eligibleTotal < threshold) {
                                this.voucherState("error");
                                this.voucherMessage(
                                    `Minimum spend of ${threshold.toLocaleString()} required on eligible items. ` +
                                    `Eligible total: ${eligibleTotal.toLocaleString()}.`
                                );
                                return Promise.reject("threshold_not_met");
                            }

                            // ── Route to correct discount strategy ──
                            const isCouponCode = !!(coupon.DiscountCode && coupon.DiscountCode.trim() !== "");

                            if (isCouponCode)
                            {
                                return this._applyCouponCode(cart, coupon.DiscountCode.trim(), coupon);
                            }
                            else
                            {
                                this.voucherState("error");
                                this.voucherMessage("No discount code available for this coupon.");
                                return Promise.reject("no_discount_code");
                            }
                        });
                    });
                
            })
            .catch((err: any) => {
                if (!["threshold_not_met", "cart_unavailable", "no_discount_value", "no_eligible_lines"].includes(err)) {
                    console.error("Apply voucher error:", err);
                    this.voucherState("error");
                    this.voucherMessage("Failed to apply voucher. Please try again.");
                }
            });
    }

    private _applyCouponCode(cart: ProxyEntities.Cart, couponCode: string, coupon: Entities.CustomerCouponDetails): Promise<void>
    {
        const correlationId = this.context.logger.getNewCorrelationId();
        const req = new Commerce.AddCouponsOperationRequest<Commerce.AddCouponsOperationResponse>(correlationId, couponCode);
        return this.context.runtime.executeAsync(req)
            .then((resp: ClientEntities.ICancelableDataResult<Commerce.AddCouponsOperationResponse>) => {
                if (!resp || resp.canceled) {
                    this.voucherState("error");
                    this.voucherMessage("Coupon application was cancelled.");
                    return Promise.reject("coupon_cancelled");
                }
                return this._redeemAndSaveVoucher(coupon, cart.Id || "");
            })
            .then(() => {
                this.voucherState("success");
                this.voucherMessage(`Coupon "${couponCode}" applied successfully.`);
                return this._showNotification(`Coupon applied: ${couponCode}.`)
                    .then(() => {
                        this.context.navigator.navigateToPOSView("CartView");
                    });
            })
            .catch((err: any) => {
                if (err !== "coupon_cancelled") {
                    console.error("Coupon code apply error:", err);
                    this.voucherState("error");
                    this.voucherMessage("Failed to apply coupon code. Please try again.");
                }
            });
    }

    //private _applyLinePercentageDiscount(cart: ProxyEntities.Cart, eligibleLines: ProxyEntities.CartLine[], percentage: number, coupon: Entities.CustomerCouponDetails): Promise<void>
    //{


    //    let appliedCount = 0;
    //    let skippedCount = 0;

    //    const applyNext = (index: number): Promise<void> => {
    //        if (index >= eligibleLines.length) return Promise.resolve();

    //        const line = eligibleLines[index];
    //        const correlationId = this.context.logger.getNewCorrelationId();
    //        const req = new Commerce.LineDiscountPercentOperationRequest<Commerce.LineDiscountPercentOperationResponse>(
    //            [{ cartLine: line, discountValue: percentage }],
    //            correlationId
    //        );

    //        return this.context.runtime.executeAsync(req)
    //            .then((resp) => {
    //                if (resp && !resp.canceled) {
    //                    appliedCount++;
    //                } else {
    //                    console.warn(`Line ${line.LineId} discount cancelled:`, resp);
    //                    skippedCount++;
    //                }
    //            })
    //            .catch((err) => {
    //                console.error(`Line ${line.LineId} discount failed:`, err);
    //                skippedCount++;
    //            })
    //            .then(() => applyNext(index + 1));
    //    };

    //    return applyNext(0)
    //        .then(() => {
    //            if (appliedCount === 0) {
    //                this.voucherState("error");
    //                this.voucherMessage("Discount could not be applied — items may not be eligible.");
    //                return Promise.resolve();
    //            }
    //            return this._redeemAndSaveVoucher(coupon, cart.Id || "");
    //        })
    //        .then(() => {
    //            if (appliedCount === 0) return Promise.resolve();
    //            const skipNote = skippedCount > 0 ? ` (${skippedCount} item(s) skipped)` : "";
    //            this.voucherState("success");
    //            this.voucherMessage(`${percentage}% discount applied to ${appliedCount} eligible line(s).${skipNote}`);
    //            return this._showNotification(`Voucher applied: ${percentage}% off.${skipNote}`)
    //                .then(() => {
    //                    this.context.navigator.navigateToPOSView("CartView");
    //                });
    //        });
    //}

    /**
     * Amount OFF — applied as a cart-level discount on the transaction total.
     * After applying, calls the Redeem API and saves extension properties.
     */

    //private async _applyCartAmountDiscount(cart: ProxyEntities.Cart, amount: number, coupon: Entities.CustomerCouponDetails): Promise<void>
    //{
    //    const correlationId = this.context.logger.getNewCorrelationId();
    //    const req = new Commerce.TotalDiscountAmountOperationRequest<Commerce.TotalDiscountAmountOperationResponse>(cart, correlationId, amount);

    //    return this.context.runtime.executeAsync(req)
    //        .then((resp: ClientEntities.ICancelableDataResult<Commerce.TotalDiscountAmountOperationResponse>) => {
    //            if (!resp || resp.canceled) {
    //                this.voucherState("error");
    //                this.voucherMessage("Cart discount was cancelled.");
    //                return Promise.reject("discount_cancelled");
    //            }
    //            return this._redeemAndSaveVoucher(coupon, cart.Id || "");
    //        })
    //        .then(() => {
    //            this.voucherState("success");
    //            this.voucherMessage(`Amount discount of ${amount.toLocaleString()} applied successfully.`);
    //            return this._showNotification(`Voucher applied: ${amount.toLocaleString()} off total.`)
    //                .then(() => {
    //                    this.context.navigator.navigateToPOSView("CartView");
    //                });
    //        })
    //        .catch((err: any) => {
    //            if (err !== "discount_cancelled") {
    //                console.error("Cart amount discount error:", err);
    //                this.voucherState("error");
    //                this.voucherMessage("Failed to apply discount. Please try again.");
    //            }
    //        });
    //}

    /**
     * Calls the Redeem API then persists voucher metadata as cart extension properties.
     * TransactionNumber uses the cart Id as the preliminary transaction reference.
     */
    private _redeemAndSaveVoucher(coupon: Entities.CustomerCouponDetails, cartId: string): Promise<void>
    {

    // Call the Redeem API via StoreOperations
        const voucherReq = new StoreOperations.CustomerVoucherDetailsRequest<StoreOperations.CustomerVoucherDetailsResponse>(this._profileId,/* this._storeCode*/"",coupon.ConceptCode,coupon.DiscountCode,coupon.VoucherNumber,cartId, "Redeem");
        return this.context.runtime.executeAsync(voucherReq)
            .then((resp: ClientEntities.ICancelableDataResult<StoreOperations.CustomerVoucherDetailsResponse>) => {
                const result = resp?.data?.result;

                // Log the redeem result; non-fatal if API fails — discount already applied
                if (!result || !result.VoucherResult?.Success) {
                    console.warn("Voucher redeem API returned non-success:", result);
                }

                // Save voucher metadata as cart extension properties regardless
                return this._saveVoucherExtensionPropertiesOnCart(coupon, cartId);
            })
            .catch((err: any) => {
                // Redeem API failure is non-fatal — discount is already on the cart
                // Extension properties still get saved so CRT can retry/reconcile
                console.error("Voucher redeem API error:", err);
                return this._saveVoucherExtensionPropertiesOnCart(coupon, cartId);
            });
    }

    /**
     * Saves all coupon/voucher metadata to cart extension properties.
     * CRT receipt handlers and the transaction posting service can read these.
     */

    private _saveVoucherExtensionPropertiesOnCart(coupon: Entities.CustomerCouponDetails, cartId: string): Promise<void>
    {

        const strProp = (key: string, value: string): ProxyEntities.CommerceProperty => ({
            Key: key,
            Value: { StringValue: value || "" } as ProxyEntities.CommercePropertyValue
        });

        const decProp = (key: string, value: number): ProxyEntities.CommerceProperty => ({
            Key: key,
            Value: { DecimalValue: value } as ProxyEntities.CommercePropertyValue
        });

        const isPercentage = !!(coupon.PercentageOff && coupon.PercentageOff !== "");
        
        const properties: ProxyEntities.CommerceProperty[] = [
            strProp("SHUKRAN_VOUCHER_NUMBER",      coupon.VoucherNumber  || ""),
            strProp("SHUKRAN_VOUCHER_STATUS",       "Redeemed"),
            strProp("SHUKRAN_VOUCHER_TYPE",         isPercentage ? "PERCENTAGE" : "AMOUNT"),
            strProp("SHUKRAN_DISCOUNT_CODE",        coupon.DiscountCode  || ""),
            strProp("SHUKRAN_CONCEPT_CODE",         coupon.ConceptCode   || ""),
            strProp("SHUKRAN_MEMBER_CARD",          coupon.MemberCardNumber || ""),
            strProp("SHUKRAN_VOUCHER_CART_ID",      cartId),
            strProp("SHUKRAN_VOUCHER_REDEEM_TIME",  new Date().toISOString()),
            decProp("SHUKRAN_VOUCHER_THRESHOLD",    coupon.ThresholdAmount || 0),
            decProp("SHUKRAN_VOUCHER_PCT_OFF",      isPercentage ? parseFloat(coupon.PercentageOff) : 0),
            decProp("SHUKRAN_VOUCHER_AMT_OFF",      !isPercentage && coupon.AmountOff ? parseFloat(coupon.AmountOff) : 0),
        ];

        const saveReq = new SaveExtensionPropertiesOnCartClientRequest<SaveExtensionPropertiesOnCartClientResponse>(properties);
        return this.context.runtime.executeAsync(saveReq)
            .then(() => { return; })
            .catch((err: any) => {
                console.error("Failed to save voucher extension properties:", err);
            });
    }


    private _validateProductHasOffer(cart: ProxyEntities.Cart, coupon: Entities.CustomerCouponDetails): Promise<boolean>
    {

        const offerId = coupon.DiscountCode ? coupon.DiscountCode.trim() : "";

        if (!offerId) {
            this.voucherState("error");
            this.voucherMessage("This coupon has no offer ID configured.");
            return Promise.resolve(false);
        }

        const req = new StoreOperations.ShukranGetProductOffersRequest<StoreOperations.ShukranGetProductOffersResponse>(offerId);

        return this.context.runtime.executeAsync(req)
            .then((resp: ClientEntities.ICancelableDataResult<StoreOperations.ShukranGetProductOffersResponse>) => {
                if (!resp || resp.canceled || !resp.data?.result) {
                    this.voucherState("error");
                    this.voucherMessage("Unable to validate offer. Please try again.");
                    return false;
                }

                const productOffers = resp.data.result.ProductOfferMap || [];

                // No offer rows at all for this OfferId
                if (productOffers.length === 0) {
                    this.voucherState("error");
                    this.voucherMessage("This item does not have any offers.");
                    return false;
                }

                // Build a set of product IDs covered by this offer
                const offerProductIds = new Set( productOffers.map((p) => String(p.ProductId)) );

                // Check if any active cart line's product is covered by this offer
                const matchingLine = (cart.CartLines || []).find((l: ProxyEntities.CartLine) =>
                    !l.IsVoided && (l.Quantity || 0) > 0 &&
                    offerProductIds.has(String(l.ProductId))
                );

                if (!matchingLine) {
                    this.voucherState("error");
                    this.voucherMessage("This item does not have any offers.");
                    return false;
                }

                return true;
            })
            .catch((err: any) => {
                console.error("Product offer validation error:", err);
                this.voucherState("error");
                this.voucherMessage("Failed to validate product offers. Please try again.");
                return false;
            });
    }

    dispose(): void {
    }
}