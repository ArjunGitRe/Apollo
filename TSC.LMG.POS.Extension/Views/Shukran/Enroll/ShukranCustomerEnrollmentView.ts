import {
    CustomViewControllerBase,
    CustomViewControllerExecuteCommandArgs,
    ICustomViewControllerConfiguration,
    ICustomViewControllerContext
} from "PosApi/Create/Views";
import * as Views from "PosApi/Create/Views";
import ko from "../../../Libraries/knockout";
import * as Controls from "PosApi/Consume/Controls";
import ShukranCustomerEnrollOTP, { IOTPDialogResult } from "../../../Dialogs/Shukran/EnrollOtp/ShukranCustomerEnrollOTP";
import { Entities, StoreOperations } from "../../../DataService/DataServiceRequests.g";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse, TriggerToastNotificationClientRequest, TriggerToastNotificationClientResponse } from "PosApi/Consume/Device";
import { SaveExtensionPropertiesOnCartClientRequest, SaveExtensionPropertiesOnCartClientResponse } from "PosApi/Consume/Cart";
import * as Cart from "PosApi/Consume/Cart";
import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";
import EnrollmentPreviewDialog from "../../../Dialogs/Shukran/Enroll/EnrollmentPreviewDialog";

export default class ShukranCustomerEnrollmentView extends CustomViewControllerBase {

    // Form fields
    public prefix: ko.Observable<string>;
    public firstName: ko.Observable<string>;
    public lastName: ko.Observable<string>;
    public phone: ko.Observable<string>;
    public countryCode: ko.ObservableArray<any>;
    public shukranCountries: ko.ObservableArray<any>;
    public email: ko.Observable<string>;
    public gender: ko.Observable<string>;
    public nationality: ko.Observable<string>;
    public city: ko.Observable<string>;
    public country: ko.Observable<string>;
    public language: ko.Observable<string>;
    public custPrefix: ko.Observable<string>;
    public consentGiven: ko.Observable<boolean>;
    cityOption: ko.ObservableArray<ProxyEntities.CityInfo>;
    countries: ko.ObservableArray<Entities.CountryRegion>;
    genderOption: ko.ObservableArray<Entities.GenderOption>;
    custPrefixOption: ko.ObservableArray<Entities.PrefixOption>;
    //countries: ko.ObservableArray<Entities.CountryRegion>;
    public selectedCountryRegionId: string;
    cityValue: string;
    countryValue: string;
    nationalityValue: string;
    genderValue: string;
    custPrefixValue: string;
    phoneprefixValue: number;
    public datePicker: Controls.IDatePicker;
    public dob: ko.Observable<Date>;
    public marketingConsentGiven: ko.Observable<boolean>;
    private _marketingConsentToggle: Controls.IToggle;

    private _enrollChannelCode: string = "";
    private _sourceCode: string = "";

    private _prefillPhone: { phoneNumber: string; phonePrefix: number; countryRegionId: string } | null = null;

    citySelectElement: HTMLSelectElement;
    
    // Validation errors
    public firstNameError: ko.Observable<string>;
    public lastNameError: ko.Observable<string>;
    public phoneError: ko.Observable<string>;
    public consentError: ko.Observable<string>;
    public emailError: ko.Observable<string>;
    public dobError: ko.Observable<string>;
    private _isDobSelected: boolean = false;
    private _consentToggle: Controls.IToggle;

    public nationalitySearch: ko.Observable<string>;
    public nationalityDropdownOpen: ko.Observable<boolean>;
    public filteredNationalities: ko.ObservableArray<Entities.CountryRegion>;

    public languageOption: ko.ObservableArray<Entities.LanguageOption>;

    private _isInitializing: boolean = true;

    constructor(context: ICustomViewControllerContext, options?: any) {
        

        let config: ICustomViewControllerConfiguration = {
            title: "Shukran Customer Enrollment",
            commandBar: {
                commands: [
                    {
                        name: "Cancel",
                        label: "Cancel",
                        icon: Views.Icons.Back,
                        isVisible: true,
                        canExecute: true,
                        execute: (args: CustomViewControllerExecuteCommandArgs): void => {
                            this.context.navigator.navigateBack();
                        }
                    },
                    {
                        name: "Enroll",
                        label:"Enroll",
                        icon: Views.Icons.Save,
                        isVisible: true,
                        canExecute: true,
                        execute: (args: CustomViewControllerExecuteCommandArgs): void => {
                            this._showPreviewDialog();
                        }
                    }
                ]
            }
        };

        super(context, config);

        if (options && options.prefillPhone) {
            this._prefillPhone = {
                phoneNumber: options.prefillPhone.phoneNumber || "",
                phonePrefix: options.prefillPhone.phonePrefix || 0,
                countryRegionId: options.prefillPhone.countryRegionId || ""
            };
        }

        this.prefix = ko.observable("");
        this.firstName = ko.observable("");
        this.lastName = ko.observable("");
        this.phone = ko.observable("");
        this.countryCode = ko.observableArray([]);
        this.shukranCountries = ko.observableArray([]);
        this.email = ko.observable("");
        this.gender = ko.observable("");
        this.custPrefix = ko.observable("");
        this.nationality = ko.observable("");
        this.city = ko.observable("");
        this.country = ko.observable("");
        this.language = ko.observable("");
        this.consentGiven = ko.observable(false);
        this.cityOption = ko.observableArray([]);
        this.countries = ko.observableArray([]);
        this.genderOption = ko.observableArray([]);
        this.custPrefixOption = ko.observableArray([]);
        this.dob = ko.observable(new Date());
        this.marketingConsentGiven = ko.observable(false);

        this.countryValue = "";
        this.cityValue = "";
        this.genderValue = "";
        this.nationalityValue = "";
        this.custPrefixValue = "";
        this.phoneprefixValue = 0;

        this.firstNameError = ko.observable("");
        this.lastNameError = ko.observable("");
        this.phoneError = ko.observable("");
        this.consentError = ko.observable("");
        this.emailError = ko.observable("");
        this.dobError = ko.observable("");
        this.languageOption = ko.observableArray([]);

        //this.country.subscribe((newValue: string): void => {
        //    if (typeof newValue === 'string') {
        //        this.fillAddressCity(newValue);
        //    }

        //});

        this.nationalitySearch = ko.observable("");
        this.nationalityDropdownOpen = ko.observable(false);
        this.filteredNationalities = ko.observableArray([]);

        this.nationalitySearch.subscribe((search: string) => {
            const term = search.toLowerCase().trim();
            if (!term) {
                this.filteredNationalities(this.countries());
            } else {
                this.filteredNationalities(
                    this.countries().filter((c: any) =>
                        c.ShortName && c.ShortName.toLowerCase().startsWith(term)
                    )
                );
            }
        });

        this.prefix.subscribe((newValue: any): void => {
            if (this._isInitializing) return;

            if (newValue) {
                const selected = this.countryCode().find((code: any) =>
                    String(code.MobileCountryCode) === String(newValue)
                );

                if (selected?.CountryRegionId) {
                    this.fillAddressCity(selected.CountryRegionId);
                }
            }
        });
        
       
    }

    public onReady(element: HTMLElement): void {
        ko.applyBindings(this, element);

        document.addEventListener("click", () => {
            this.nationalityDropdownOpen(false);
        });

        this.citySelectElement = element.querySelector("#customerCityInput") as HTMLSelectElement;

        this._initConsentToggle(element);
        this._initMarketingConsentToggle(element); 
        this.createDobDatePicker(element);  
        this.fillCountry();
        this.fillCountryCode(); 
        this.fillNationality();
        this.fillGenderType();
        this.fillCustPrefixType();
        this.fillLanguageType();
    }

    public dispose(): void {
        const root = document.getElementById("enrollRoot");
        if (root) { ko.cleanNode(root); }
    }


    public toggleNationalityDropdown(data: any, event: MouseEvent): void {
        event.stopPropagation();
        this.nationalityDropdownOpen(!this.nationalityDropdownOpen());
        if (this.nationalityDropdownOpen()) {
            this.nationalitySearch("");
            // Focus the search input on next tick
            setTimeout(() => {
                const input = document.getElementById("nationalitySearchInput") as HTMLInputElement;
                if (input) { input.focus(); }
            }, 50);
        }
    }

    public selectNationality(item: any): void {
        this.nationality(item.ShortName);
        this.nationalityDropdownOpen(false);
        this.nationalitySearch("");
    }


    private _initConsentToggle(element: HTMLElement): void {
        let toggleOptions: Controls.IToggleOptions = {
            labelOn: "Yes",
            labelOff: "No",
            checked: this.consentGiven(),
            enabled: true,
            tabIndex: 0
        };

        let toggleElement: HTMLDivElement = element.querySelector("#ToggleConsent") as HTMLDivElement;

        this._consentToggle = this.context.controlFactory.create(this.context.logger.getNewCorrelationId(),
            "Toggle",toggleOptions,toggleElement);

        this._consentToggle.addEventListener("CheckedChanged", (eventData: { checked: boolean }) => {
            this.consentGiven(eventData.checked);
            if (eventData.checked) {
                this.consentError(""); // Clear error when toggled on
            }
        });
    }
    private _initMarketingConsentToggle(element: HTMLElement): void {
        let toggleOptions: Controls.IToggleOptions = {
            labelOn: "Yes",
            labelOff: "No",
            checked: false,
            enabled: true,
            tabIndex: 0
        };

        let toggleElement: HTMLDivElement = element.querySelector("#ToggleMarketingConsent") as HTMLDivElement;

        this._marketingConsentToggle = this.context.controlFactory.create(this.context.logger.getNewCorrelationId(),"Toggle",toggleOptions,toggleElement);

        this._marketingConsentToggle.addEventListener("CheckedChanged", (eventData: { checked: boolean }) => {
            this.marketingConsentGiven(eventData.checked);
        });
    }

    public _validate(): boolean {
        this.firstNameError("");
        this.lastNameError("");
        this.phoneError("");
        this.consentError("");
        //this.emailError("");
        this.dobError("");  

        let valid = true;

        if (!this.firstName().trim()) {
            this.firstNameError("Required");
            valid = false;
        }
        if (!this.lastName().trim()) {
            this.lastNameError("Required");
            valid = false;
        }
        if (!this.phone().trim()) {
            this.phoneError("Required");
            valid = false;
        } else if (!/^\d+$/.test(this.phone().trim())) {
            this.phoneError("Digits only");
            valid = false;
        }
        if (!this.consentGiven()) {
            this.consentError("Consent is required to enroll");
            valid = false;
        }

        const emailVal = this.email().trim();
        if (emailVal && (!/[@]/.test(emailVal) || !/[.]/.test(emailVal))) {
            this.emailError("Invalid email address");
            valid = false;
        }

        return valid;
    }
    private validatePhoneNumber(): void {
        const selectedPrefix = this.prefix();
        const currentCountryCode = this.countryCode()
            .find((code: any) => code.MobileCountryCode === selectedPrefix);

        if (!selectedPrefix || !currentCountryCode) { return; }

        const phoneInput = document.getElementById("phone") as HTMLInputElement;
        if (!phoneInput) { return; }

        const digitsOnly = phoneInput.value.replace(/\D/g, "");

        if (!currentCountryCode) {
            this.phone(digitsOnly);
            return;
        }

        const maxLength = currentCountryCode.MobileNumberLength;

        if (digitsOnly.length > maxLength)
        {
            const truncated = digitsOnly.slice(0, maxLength);
            phoneInput.value = truncated;
            this.phone(truncated);
        }
        else
        {
            this.phone(digitsOnly);
        }
    }
    public onCountryCodeChange(): void {
        this.validatePhoneNumber();
    }
    public onPhoneInput(): void {
        this.validatePhoneNumber();
    }

    public fillCountry(): void {
        let CountryRegion = new StoreOperations.GetShukranCountryDetailsRequest<StoreOperations.GetShukranCountryDetailsResponse>("");
        this.context.runtime.executeAsync(CountryRegion)
            .then((resp: ClientEntities.ICancelableDataResult<StoreOperations.GetShukranCountryDetailsResponse>) => {
                this.shukranCountries(resp.data.result.SkrnCountry);
                this.country(this.countryValue);
                //this.selectedCountryRegionId = resp.data.result.SkrnCountry[0].CountryRegionId;
                //this.fillAddressCity(this.selectedCountryRegionId);
                //this.nationality(this.countryValue);
                
            });

    }

    public fillNationality(): void {
        let CountryRegion = new StoreOperations.GetCountryRegionDetailsRequest<StoreOperations.GetCountryRegionDetailsResponse>("");
        this.context.runtime.executeAsync(CountryRegion)
            .then((resp: ClientEntities.ICancelableDataResult<StoreOperations.GetCountryRegionDetailsResponse>) => {
                this.countries(resp.data.result.CountryRegions);
                this.filteredNationalities(resp.data.result.CountryRegions);
                this.nationality(this.nationalityValue);

            });

    }
    public fillAddressCity(countryRegionId: string) {
        let addressCity: StoreOperations.GetCityDetailsRequest<StoreOperations.GetCityDetailsResponse> =
            new StoreOperations.GetCityDetailsRequest<StoreOperations.GetCityDetailsResponse>(countryRegionId);
        this.context.runtime.executeAsync(addressCity)
            .then((cityResp: ClientEntities.ICancelableDataResult<StoreOperations.GetCityDetailsResponse>) => {
                this.cityOption(cityResp.data.result.CityInfos);
                //if (cityResp.data.result.CityInfos != undefined && cityResp.data.result.CityInfos.length > 0) {
                //    this.citySelectElement.disabled = false;
                //}
                //else {
                //    this.citySelectElement.disabled = true;
                //}
                if (this.citySelectElement)
                {
                    const hasCities = cityResp.data.result.CityInfos != undefined && cityResp.data.result.CityInfos.length > 0;
                    this.citySelectElement.disabled = !hasCities;
                }
                this.city(this.cityValue);
            });

    }

    public getDefaultPrefix() {

        let correlationId: string = this.context.logger.getNewCorrelationId();
        let deviceReq: GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse> = new
            GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse>(correlationId)
        return this.context.runtime.executeAsync(deviceReq)

            .then((response: ClientEntities.ICancelableDataResult<GetDeviceConfigurationClientResponse>) => {

                let defaultCountryprefix: ProxyEntities.CommerceProperty[] =
                    response.data.result.ExtensionProperties.filter((extension: ProxyEntities.CommerceProperty) => extension.Key === "TSCDEFAULTCOUNTRYPREFIX");
                let val = defaultCountryprefix.length > 0 ? defaultCountryprefix[0].Value.StringValue : "";

                return val;
            });


    }
    public fillCountryCode(): void {
        let code = new StoreOperations.GetMobileNumberCountryCodeRequest<StoreOperations.GetMobileNumberCountryCodeResponse>("");
        this.context.runtime.executeAsync(code)
            .then((resp: ClientEntities.ICancelableDataResult<StoreOperations.GetMobileNumberCountryCodeResponse>) => {
                this.countryCode(resp.data.result.CountryCodeDetails);
                this.prefix(String(this.phoneprefixValue));
            }).then(() => {
                //this.setDefaultPrefix();
                if (this._prefillPhone && this._prefillPhone.phonePrefix) {
                    this.prefix(this._prefillPhone.phonePrefix);
                    this.phone(this._prefillPhone.phoneNumber);

                    // Trigger city load if countryRegionId is available
                    if (this._prefillPhone.countryRegionId) {
                        this.fillAddressCity(this._prefillPhone.countryRegionId);
                    }
                } else {
                    // Fall back to device default prefix
                    this.setDefaultPrefix();
                }
                this._isInitializing = false;
            });
    }

    setDefaultPrefix() {
        this.getDefaultPrefix()
            .then((prefix: string) => {
                this.phoneprefixValue = parseInt(prefix);
                this.prefix(String(this.phoneprefixValue));
            });
    }

    public fillGenderType() {
        let genderType: StoreOperations.GetGenderDetailsRequest<StoreOperations.GetGenderDetailsResponse> =
            new StoreOperations.GetGenderDetailsRequest<StoreOperations.GetGenderDetailsResponse>();
        this.context.runtime.executeAsync(genderType)
            .then((genderResp: ClientEntities.ICancelableDataResult<StoreOperations.GetGenderDetailsResponse>) => {
                this.genderOption(genderResp.data.result.GenderOptions);
                this.gender(this.genderValue);
            });
    }

    public fillCustPrefixType() {
        let custPrefixType: StoreOperations.GetPrefixNameDetailsRequest<StoreOperations.GetPrefixNameDetailsResponse> =
            new StoreOperations.GetPrefixNameDetailsRequest<StoreOperations.GetPrefixNameDetailsResponse>();
        this.context.runtime.executeAsync(custPrefixType)
            .then((custPrefixResp: ClientEntities.ICancelableDataResult<StoreOperations.GetPrefixNameDetailsResponse>) => {
                this.custPrefixOption(custPrefixResp.data.result.PrefixOptions);
                this.custPrefix(this.custPrefixValue);
            });
    }

    public fillLanguageType(): void {
        let languageType: StoreOperations.GetLanguageDetailsRequest<StoreOperations.GetLanguageDetailsResponse> =
            new StoreOperations.GetLanguageDetailsRequest<StoreOperations.GetLanguageDetailsResponse>();
        this.context.runtime.executeAsync(languageType) .then((resp: ClientEntities.ICancelableDataResult<StoreOperations.GetLanguageDetailsResponse>) => {
            this.languageOption(resp.data.result.LanguageOptions);

            const first = resp.data.result.LanguageOptions[0];
            if (first) {
                this.language(first.Value);
            }
        });
    }

    public createDobDatePicker(element: HTMLElement): void {
        let datePickerOptions: Controls.IDatePickerOptions = {
            date: this.dob(),
            enabled: true
        };

        let datePickerRootElem: HTMLDivElement = element.querySelector("#datePickerDob") as HTMLDivElement;
        this.datePicker = this.context.controlFactory.create(this.context.logger.getNewCorrelationId(),"DatePicker",datePickerOptions,datePickerRootElem);

        this.datePicker.addEventListener("DateChanged", (eventData: { date: Date }) => {
            this.dob(eventData.date);
            this._isDobSelected = true; 
        });
    }

    //public _submitEnrollment(): void {
    //    if (!this._validate()) { return; }
    //    let otpDialog: ShukranCustomerEnrollOTP = new ShukranCustomerEnrollOTP();
    //        otpDialog.open(this.phone()).then((result: IOTPDialogResult) => {
    //            if (result.success) {

    //                this.context.logger.logInformational("Shukran enrollment successful.");
    //                this.context.navigator.navigateBack();
    //            }
    //        });
    //}

    //public _submitEnrollment(): void {
    //    if (!this._validate()) { return; }

    //    const today = new Date().toISOString().split("T")[0];

    //    // Build using proper entity classes
    //    const enrollPhone = new Entities.EnrollPhone();
    //    enrollPhone.PhoneNumber = this.prefix() + this.phone();

    //    const enrollEmail = new Entities.EnrollEmail();
    //    enrollEmail.EmailAddress = this.email();

    //    const consent = new Entities.EnrollConsent();
    //    consent.ProvidedDate = today;
    //    consent.Source = "POS";
    //    consent.Status = this.consentGiven() ? "Consent Provided" : "Consent Not Provided";
    //    consent.Segment = "";

    //    const jsonExternalData = new Entities.EnrollJsonExternalData();
    //    jsonExternalData.CashierID = "";
    //    jsonExternalData.EnrollmentInvoiceNumber = "";
    //    jsonExternalData.LandLineNumber = "";
    //    jsonExternalData.Nationality = this.nationality();
    //    jsonExternalData.PH_OTPVerified = "Y";
    //    jsonExternalData.ActivatedIn = "";
    //    jsonExternalData.ActivatedLanguauge = this.language();
    //    jsonExternalData.ActivationDate = today;
    //    jsonExternalData.LMG_PDPL_Flag = this.consentGiven() ? "Y" : "N";
    //    jsonExternalData.Consent = consent;

    //    const enrollCustomerRequest = new Entities.EnrollCustomerRequest();
    //    enrollCustomerRequest.FirstName = this.firstName();
    //    enrollCustomerRequest.LastName = this.lastName();
    //    enrollCustomerRequest.City = this.city();
    //    enrollCustomerRequest.Gender = this.gender();
    //    enrollCustomerRequest.BirthDate = "";
    //    enrollCustomerRequest.Prefix = this.prefix();
    //    enrollCustomerRequest.Emails = [enrollEmail];
    //    enrollCustomerRequest.Phones = [enrollPhone];
    //    enrollCustomerRequest.SourceCode = "";
    //    enrollCustomerRequest.EnrollmentStoreCode = "";
    //    enrollCustomerRequest.LanguageCode = this.language();
    //    enrollCustomerRequest.JoinDate = today;
    //    enrollCustomerRequest.CardNumber = "";
    //    enrollCustomerRequest.EnrollChannelCode = "";
    //    enrollCustomerRequest.JsonExternalData = jsonExternalData;

    //    let enrollRequest = new StoreOperations.EnrollShukranCustomerRequest<StoreOperations.EnrollShukranCustomerResponse>(enrollCustomerRequest);

    //    this.context.runtime.executeAsync(enrollRequest)
    //        .then((resp: ClientEntities.ICancelableDataResult<StoreOperations.EnrollShukranCustomerResponse>) => {
    //            const result = resp.data.result;
    //            if (result.Success) {
    //                this.context.logger.logInformational(`Enrollment successful. ProfileId: ${result.EnrollmentResult?.ProfileId}, Card: ${result.EnrollmentResult?.CardNumber}`);
    //                this.context.navigator.navigateBack();
    //            } else {
    //                this.context.logger.logError(`Enrollment failed: ${result.Message}`);
    //            }
    //        })
    //        .catch((err: any) => {
    //            this.context.logger.logError(`Enrollment request error: ${JSON.stringify(err)}`);
    //        });
    //}

    public _submitEnrollment(): void {
        //if (!this._validate()) { return; }

        // Step 1: Send OTP to phone first
        const selectedCountryCode = this.countryCode()
            .find((code: any) => String(code.MobileCountryCode) === String(this.prefix()));
        const territory = selectedCountryCode ? selectedCountryCode.CountryRegionId : "";

        const selectedLanguage = this.languageOption().find((lang: any) => lang.Value === this.language());
        const languageText = selectedLanguage ? selectedLanguage.Text : this.language();

 
        let storedGuid: string = "";

        this._getTransactionAndStore().then(data => {

            let otpRequest = new StoreOperations.CustomerEnrollOTPDetailsRequest<StoreOperations.CustomerEnrollOTPDetailsResponse>(this.prefix() + this.phone(), territory, languageText, "", "", data.transactionId);
            this.context.runtime.executeAsync(otpRequest)
                .then((otpResp: ClientEntities.ICancelableDataResult<StoreOperations.CustomerEnrollOTPDetailsResponse>) => {
                    const otpResult = otpResp.data.result;

                    if (!otpResult.OTPDetails.success) {
                        this.context.logger.logError(`OTP send failed: ${otpResult.OTPDetails.errorMessage}`);
                        return;
                    }

                    storedGuid = otpResult.Guid;

                    // Step 2: OTP sent successfully - open dialog for user to enter OTP
                    let otpDialog: ShukranCustomerEnrollOTP = new ShukranCustomerEnrollOTP();
                    otpDialog.open(this.phone()).then((result: IOTPDialogResult) => {
                        if (!result.success) { return; }


                        let verifyRequest = new StoreOperations.VerifyShukranOTPRequest<StoreOperations.VerifyShukranOTPResponse>(storedGuid, result.otpValue);

                        this.context.runtime.executeAsync(verifyRequest)
                            .then((verifyResp: ClientEntities.ICancelableDataResult<StoreOperations.VerifyShukranOTPResponse>) => {
                                if (!verifyResp.data.result.IsValid) {
                                    this.showMessage("Invalid OTP. Please try again.");
                                    return;
                                }
                                //OTP valid - proceed with enrollment
                                //this._enrollCustomer(territory,true);

                                this._enrollChannelCode = data.enrollChannelCode;
                                this._sourceCode = data.sourceCode;

                                this._enrollCustomer(territory, true, data.transactionId, data.storeId, data.staffId);

                            });

                    });
                })
                .catch((err: any) => {
                    this.context.logger.logError(`OTP send error: ${JSON.stringify(err)}`);
                });

        })
       

        
    }

    private _addEnrolledCustomerToCart(shukranCustAccount: string, enrolledDetails: Entities.EnrollCustomerDetails): Promise<void> {
        if (!shukranCustAccount) {
            this.context.logger.logError("No Shukran account found after enrollment.");
            return Promise.resolve();
        }

        const setCustomerReq = new Cart.SetCustomerOnCartOperationRequest<Cart.SetCustomerOnCartOperationResponse>("", shukranCustAccount);
        return this.context.runtime.executeAsync(setCustomerReq)
            .then((resp: ClientEntities.ICancelableDataResult<Cart.SetCustomerOnCartOperationResponse>) => {
                if (resp && !resp.canceled) {
                    this.context.logger.logInformational("Enrolled customer successfully added to cart.");
                    ShukranCustomerEnrollmentView._showToastNotification(
                        this.context.runtime,
                        "Shukran Enrollment",
                        "Customer enrolled successfully.",
                        this.context.logger.getNewCorrelationId(),
                        ClientEntities.ToastMessageType.SUCCESS
                    );
                }
                return this._saveEnrolledCustomerExtensionProperties(shukranCustAccount, enrolledDetails);
            })
            .then(() => {
                //return this.showMessage("Customer enrolled and details saved successfully.")
                ShukranCustomerEnrollmentView._showToastNotification(
                    this.context.runtime,
                    "Shukran",
                    "Shukran customer is added.",
                    this.context.logger.getNewCorrelationId(),
                    ClientEntities.ToastMessageType.SUCCESS
                );
            })
            .then(() => {
                this.context.navigator.navigateToPOSView("CartView");
            })
            .catch((err: any) => {
                this.context.logger.logError(`Add enrolled customer to cart error: ${JSON.stringify(err)}`);
                // Still navigate back on error rather than leaving user stuck
                this.context.navigator.navigateBack();
            });
    }

    private _saveEnrolledCustomerExtensionProperties(shukranCustAccount: string, enrolledDetails: Entities.EnrollCustomerDetails): Promise<void> {

        const strProp = (key: string, value: string): ProxyEntities.CommerceProperty => ({
            Key: key,
            Value: { StringValue: value || "" } as ProxyEntities.CommercePropertyValue
        });

        const selectedCountryCode = this.countryCode().find((code: any) => String(code.MobileCountryCode) === String(this.prefix()));
        const countryRegionId = selectedCountryCode ? selectedCountryCode.CountryRegionId : "";
        const countryShortName = selectedCountryCode ? selectedCountryCode.ShortName : "";


        const fullPhone = this.prefix() + this.phone();
        const joinDateStr = new Date().toISOString();

        const properties: ProxyEntities.CommerceProperty[] = [
            strProp("SHUKRAN_ACCT", shukranCustAccount),
            strProp("SHUKRAN_PROFILE_ID", enrolledDetails?.ProfileId || ""),
            strProp("SHUKRAN_CARDNO", enrolledDetails?.CardNumber || ""),

            strProp("SHUKRAN_FIRST_NAME", this.firstName() || ""),
            strProp("SHUKRAN_LAST_NAME", this.lastName() || ""),
            strProp("SHUKRAN_PHONE", fullPhone),
            strProp("SHUKRAN_EMAIL", this.email() || ""),
            strProp("SHUKRAN_PREFIX", this.custPrefix() || ""),
            strProp("SHUKRAN_CUST_COUNTRY", countryRegionId || ""),
            strProp("SHUKRAN_LANGUAGE_CODE", this.language() || ""),
            strProp("SHUKRAN_STATUS", "ACTIVE"),            
            strProp("SHUKRAN_JOIN_DATE", joinDateStr),
            strProp("SHUKRAN_SEARCH_TYPE", "PhoneNumber"), 
            strProp("SHUKRAN_GENDER", this.gender() || ""),
            strProp("SHUKRAN_NATIONALITY", this.nationality() || ""),
            strProp("SHUKRAN_COUNTRY", countryShortName || ""),
            strProp("SHUKRAN_BIRTH_DATE", this._isDobSelected ? this.dob().toISOString().split("T")[0] : ""),
        ];

        const saveReq = new SaveExtensionPropertiesOnCartClientRequest<SaveExtensionPropertiesOnCartClientResponse>(properties);
        return this.context.runtime.executeAsync(saveReq)
            .then((resp: ClientEntities.ICancelableDataResult<SaveExtensionPropertiesOnCartClientResponse>) => {
                if (resp?.canceled) {
                    this.context.logger.logInformational("SaveExtensionPropertiesOnCart was cancelled.");
                }
            })
            .catch((err: any) => {
                this.context.logger.logError(`Failed to save extension properties on cart: ${JSON.stringify(err)}`);
            });
    }

    //private _saveCustomerToDB(enrolledDetails: Entities.ShukranEnrollmentData): Promise<void> {

    //    let request = new StoreOperations.SaveShukranCustomerDetailsRequest<StoreOperations.SaveShukranCustomerDetailsResponse>(enrolledDetails);
    //    return this.context.runtime.executeAsync(request)
    //        .then((resp: ClientEntities.ICancelableDataResult<StoreOperations.SaveShukranCustomerDetailsResponse>) => {
    //            if (!resp.canceled && resp.data.result.IsSuccess) {
    //                this.context.logger.logInformational("Customer saved in local DB successfully.");
    //            }
    //        })
    //        .catch((err: any) => {
    //            this.context.logger.logError(`Customer save failed: ${JSON.stringify(err)}`);
    //        });
    //}

    private _enrollCustomer(territory: string, otpVerified: boolean, transactionId: string, storeId: string, staffId: string): void {
        const today = new Date().toISOString().split("T")[0];
        const todayDate = new Date();
        const mm = String(todayDate.getMonth() + 1).padStart(2, "0");
        const dd = String(todayDate.getDate()).padStart(2, "0");
        const yyyy = todayDate.getFullYear();

        const enrollPhone = new Entities.EnrollPhone();
        enrollPhone.PhoneNumber = this.prefix() + this.phone();

        //const enrollEmail = new Entities.EnrollEmail();
        //enrollEmail.EmailAddress = this.email();

        const consent = new Entities.EnrollConsent();
        consent.ProvidedDate = `${mm}/${dd}/${yyyy}`;
        consent.Source = this._enrollChannelCode;
        consent.Status = this.marketingConsentGiven() ? "Consent Provided" : "Consent Not Provided";
        consent.Segment = this.marketingConsentGiven() ? `${staffId || ""}-${storeId || ""}` : "";

        const jsonExternalData = new Entities.EnrollJsonExternalData();
        jsonExternalData.CashierID = staffId;
        jsonExternalData.EnrollmentInvoiceNumber = transactionId;
        jsonExternalData.LandLineNumber = "";
        jsonExternalData.Nationality = this.nationality() || "";
        jsonExternalData.PH_OTPVerified = otpVerified ? "Y" : "N";
        jsonExternalData.ActivatedIn = "";
        jsonExternalData.ActivatedLanguauge = this.language();
        jsonExternalData.ActivationDate = today;
        jsonExternalData.LMG_PDPL_Flag = this.consentGiven() ? "Y" : "N";
        jsonExternalData.Consent = consent;

        const enrollCustomerRequest = new Entities.EnrollCustomerRequest();
        enrollCustomerRequest.FirstName = this.firstName();
        enrollCustomerRequest.LastName = this.lastName();
        enrollCustomerRequest.City = this.city() || "";
        enrollCustomerRequest.Gender = this.gender() || "";
        enrollCustomerRequest.BirthDate = this._isDobSelected ? this.dob().toISOString().split("T")[0] : "";
        enrollCustomerRequest.Prefix ="";
        //enrollCustomerRequest.Emails =[];
        const emailVal = this.email() ? this.email().trim() : "";
        if (emailVal) {
            const enrollEmail = new Entities.EnrollEmail();
            enrollEmail.EmailAddress = emailVal;
            enrollCustomerRequest.Emails = [enrollEmail];
        } else {
            enrollCustomerRequest.Emails = [];
        }
        enrollCustomerRequest.Phones = [enrollPhone];
        enrollCustomerRequest.SourceCode = this._sourceCode;
        enrollCustomerRequest.EnrollmentStoreCode = storeId;
        enrollCustomerRequest.LanguageCode = this.language();
        enrollCustomerRequest.JoinDate = today;
        enrollCustomerRequest.CardNumber = "";
        enrollCustomerRequest.EnrollChannelCode = this._enrollChannelCode;
        enrollCustomerRequest.JsonExternalData = jsonExternalData;

        const requestJson = JSON.stringify(enrollCustomerRequest, null, 2);

        // Log full JSON before sending
        this.context.logger.logInformational("Enroll Customer Request JSON:");
        this.context.logger.logInformational(requestJson);

        let enrollRequest = new StoreOperations.EnrollShukranCustomerRequest<StoreOperations.EnrollShukranCustomerResponse>(enrollCustomerRequest, transactionId);

        this.context.runtime.executeAsync(enrollRequest)
            .then((resp: ClientEntities.ICancelableDataResult<StoreOperations.EnrollShukranCustomerResponse>) => {
                const result = resp.data.result;
                if (result.EnrollmentResult.Success) {
                    this.context.logger.logInformational(`Enrollment successful. ProfileId: ${result.EnrollmentResult?.ProfileId}, Card: ${result.EnrollmentResult?.CardNumber}`);

                    const shukranAccount = result.ShukranCustAccount;
                    this._addEnrolledCustomerToCart(shukranAccount, result.EnrollmentResult);
                }
                else
                {
                    this.context.logger.logError(`Enrollment failed: ${result.Message}`);
                    const msg = result.EnrollmentResult.Message || "Enrollment failed. Please try again.";
                    this.context.logger.logError(`Enrollment failed: ${msg}`);
                    this.showMessage(msg); 
                }
            })
            .catch((err: any) => {
                this.context.logger.logError(`Enrollment request error: ${JSON.stringify(err)}`);
            });
    }


    //private _showPreviewDialog(): void {

    //    let dialog: EnrollmentPreviewDialog = new EnrollmentPreviewDialog();

    //    dialog.open({
    //        firstName: this.firstName(),
    //        lastName: this.lastName(),
    //        phone: this.prefix() + this.phone(),
    //        //email: this.email(),
    //        city: this.city(),
    //        country: this.country(),
    //        gender: this.gender(),
    //        nationality: this.nationality()
    //    }).then((result: string) => {

    //        if (result === "Enroll") {
    //            this._submitEnrollment();
    //        }

    //        // If Edit -> do nothing (stay in view)

    //    });
    //}

    private _showPreviewDialog(): void {
        if (!this._validate()) { return; }          

        const dob = this.dob();
        const isDobSet = dob && dob.toDateString() !== new Date().toDateString();

        const dobDisplay = isDobSet
            ? `${String(dob.getDate()).padStart(2, "0")}/${String(dob.getMonth() + 1).padStart(2, "0")}/${dob.getFullYear()}`
            : "";
        const selectedCountryCode = this.countryCode().find((code: any) => code.MobileCountryCode === this.prefix());

        const countryDisplay = selectedCountryCode? (selectedCountryCode.LongName || selectedCountryCode.CountryRegionId || "—"): "—";

        const proceedToPreview = () => {
            let dialog: EnrollmentPreviewDialog = new EnrollmentPreviewDialog();
            dialog.open({
                firstName: this.firstName(),
                lastName: this.lastName(),
                phone: this.prefix() + this.phone(),
                email: this.email(), 
                city: this.city(),
                country: countryDisplay,
                gender: this.gender(),
                nationality: this.nationality(),
                dob: dobDisplay,              
                language: this.language(),         
                consentGiven: this.consentGiven(),     
                marketingConsentGiven: this.marketingConsentGiven() 
            }).then((result: string) => {
                if (result === "Enroll") {
                    this._submitEnrollment();
                }
            });
        };

        if (isDobSet) {
            this._getMinAgeFromConfig().then((minAge: number) => {
                const today = new Date();
                const age = today.getFullYear() - dob.getFullYear();
                const monthDiff = today.getMonth() - dob.getMonth();
                const dayDiff = today.getDate() - dob.getDate();
                const isUnderAge =
                    age < minAge ||
                    (age === minAge && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)));

                if (isUnderAge) {
                    this.dobError(`Customer must be at least ${minAge} years old`);
                } else {
                    this.dobError("");
                    proceedToPreview();
                }
            });
        } else {
            // DOB not filled — skip age check, proceed directly
            proceedToPreview();
        }
    }
    private showMessage(message: string): void {
        let options: IMessageDialogOptions = {
            message: message
        };
        let dialogRequest = new ShowMessageDialogClientRequest(options);
        this.context.runtime.executeAsync(dialogRequest).catch(() => { /* Ignore UI error */ });
    }

    private _getTransactionAndStore(): Promise<{ transactionId: string, storeId: string, enrollChannelCode: string, sourceCode: string, staffId: string }> {

        let cartRequest = new Cart.GetCurrentCartClientRequest<Cart.GetCurrentCartClientResponse>();
        let deviceRequest = new GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse>(
            this.context.logger.getNewCorrelationId()
        );

        return this.context.runtime.executeAsync(cartRequest)
            .then((cartResp: ClientEntities.ICancelableDataResult<Cart.GetCurrentCartClientResponse>) => {
                let transactionId = cartResp.data.result.Id;
                let staffId = cartResp.data.result.StaffId;

                return this.context.runtime.executeAsync(deviceRequest)
                    .then((deviceResp: ClientEntities.ICancelableDataResult<GetDeviceConfigurationClientResponse>) => {
                        let storeId = deviceResp.data.result.StoreNumber;
                        let extensionProps = deviceResp.data.result.ExtensionProperties;

                        let enrollChannelCodeProp = extensionProps.filter(
                            (ext: ProxyEntities.CommerceProperty) => ext.Key === "SKRNEnrollChannelCode"
                        );
                        let sourceCodeProp = extensionProps.filter(
                            (ext: ProxyEntities.CommerceProperty) => ext.Key === "SKRNSourceCode"
                        );

                        let enrollChannelCode = enrollChannelCodeProp.length > 0
                            ? enrollChannelCodeProp[0].Value.StringValue : "";
                        let sourceCode = sourceCodeProp.length > 0
                            ? sourceCodeProp[0].Value.StringValue : "";

                        return { transactionId, storeId, enrollChannelCode, sourceCode, staffId };
                    });
            });
    }

    private _getMinAgeFromConfig(): Promise<number> {
        let correlationId: string = this.context.logger.getNewCorrelationId();
        let deviceReq = new GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse>(correlationId);

        return this.context.runtime.executeAsync(deviceReq)
            .then((response: ClientEntities.ICancelableDataResult<GetDeviceConfigurationClientResponse>) => {
                let prop: ProxyEntities.CommerceProperty[] =
                    response.data.result.ExtensionProperties.filter(
                        (ext: ProxyEntities.CommerceProperty) => ext.Key === "TSCDEFAULTDOBYEAR"
                    );
                let val = prop.length > 0 ? parseInt(prop[0].Value.StringValue) : 18;
                return isNaN(val) ? 18 : val;
            });
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
    
}