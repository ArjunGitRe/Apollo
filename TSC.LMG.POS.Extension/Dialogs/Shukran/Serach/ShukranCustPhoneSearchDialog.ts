import * as Dialogs from "PosApi/Create/Dialogs";
import { ClientEntities, ProxyEntities } from "PosApi/Entities";
import { StoreOperations } from "../../../DataService/DataServiceRequests.g";
import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device";
import ko, { Observable, ObservableArray } from "../../../Libraries/knockout";

export interface IPhoneSearchResult {
    confirmed: boolean;
    phoneWithPrefix: string;
    phoneNumber: string;
    selectedPrefix: number;
    countryRegionId: string;
}

export default class ShukranCustPhoneSearchDialog extends Dialogs.ExtensionTemplatedDialogBase {

   
    public countryCodeList: ObservableArray<any>;
    public selectedPrefix: Observable<any>;
    public phoneNumber: Observable<string>;
    public phoneError: Observable<string>;

    private _resolve: (result: IPhoneSearchResult) => void;

    constructor() {
        super();
        this.countryCodeList = ko.observableArray([]);
        this.selectedPrefix = ko.observable(null);
        this.phoneNumber = ko.observable("");
        this.phoneError = ko.observable("");
    }

    

    public onReady(element: HTMLElement): void {
        ko.applyBindings(this, element);
        this._loadCountryCodes();
    }

    

    public open(): Promise<IPhoneSearchResult> {
        this.phoneNumber("");
        this.phoneError("");
        this.selectedPrefix(null);

        let promise: Promise<IPhoneSearchResult> =
            new Promise((resolve: (result: IPhoneSearchResult) => void): void => {
                this._resolve = resolve;

                let dialogOptions: Dialogs.ITemplatedDialogOptions = {
                    title: "",
                    subTitle: "PHONE NUMBER SEARCH",
                    button1: {
                        id: "SearchButton",
                        isPrimary: true,
                        label: "Search",
                        onClick: this._searchClickHandler.bind(this)
                    },
                    button2: {
                        id: "CancelButton",
                        isPrimary: false,
                        label: "Cancel",
                        onClick: this._cancelClickHandler.bind(this)
                    },
                    onCloseX: this._cancelClickHandler.bind(this)
                };

                this.openDialog(dialogOptions);
            });

        return promise;
    }

    

    public onPrefixChange(): void {
        this._enforceMaxLength();
    }

    public onPhoneInput(): void {
        this._enforceMaxLength();
    }

    
    public onKeyDown(_data: unknown, event: KeyboardEvent): boolean {
        if (event.key === "Enter") {
            const searchButton = document.getElementById("SearchButton");
            if (searchButton) { searchButton.click(); }
            return false;
        }
        return true;
    }

    

    private _searchClickHandler(): boolean {
        if (!this._validate()) {
            return false; // keep dialog open
        }

        const prefix = this.selectedPrefix();
        const phoneDigits = this.phoneNumber().trim();

        const selectedCode = this.countryCodeList().find(
            (c: any) => c.MobileCountryCode === prefix
        );
        const countryRegionId: string = selectedCode ? selectedCode.CountryRegionId : "";

        this._resolve({
            confirmed: true,
            phoneWithPrefix: String(prefix) + phoneDigits,
            phoneNumber: phoneDigits,
            selectedPrefix: Number(prefix),
            countryRegionId: countryRegionId
        });

        return true; // close dialog
    }

    private _cancelClickHandler(): boolean {
        this._resolve({
            confirmed: false,
            phoneWithPrefix: "",
            phoneNumber: "",
            selectedPrefix: 0,
            countryRegionId: ""
        });
        return true; // close dialog
    }

    

    private _loadCountryCodes(): void {
        let codeReq = new StoreOperations.GetMobileNumberCountryCodeRequest<
            StoreOperations.GetMobileNumberCountryCodeResponse>("");

        this.context.runtime.executeAsync(codeReq)
            .then((resp: ClientEntities.ICancelableDataResult<
                StoreOperations.GetMobileNumberCountryCodeResponse>) => {

                this.countryCodeList(resp.data.result.CountryCodeDetails);
                return this._getDefaultPrefix();
            })
            .then((defaultPrefix: string) => {
                if (defaultPrefix) {
                    this.selectedPrefix(parseInt(defaultPrefix, 10));
                } else if (this.countryCodeList().length > 0) {
                    this.selectedPrefix(this.countryCodeList()[0].MobileCountryCode);
                }
            })
            .catch((expection:any) => {
                console.log(expection)
            });
    }

    private _getDefaultPrefix(): Promise<string> {
        let deviceReq = new GetDeviceConfigurationClientRequest<GetDeviceConfigurationClientResponse>(
            this.context.logger.getNewCorrelationId()
        );

        return this.context.runtime.executeAsync(deviceReq)
            .then((response: ClientEntities.ICancelableDataResult<
                GetDeviceConfigurationClientResponse>) => {
                const props: ProxyEntities.CommerceProperty[] = response.data.result.ExtensionProperties;
                const match = props.find(
                    (p: ProxyEntities.CommerceProperty) => p.Key === "TSCDEFAULTCOUNTRYPREFIX"
                );
                return match ? (match.Value.StringValue || "") : "";
            });
    }

    /** Trim the phone input to the MobileNumberLength of the selected prefix. */
    private _enforceMaxLength(): void {
        const prefix = this.selectedPrefix();
        if (!prefix) { return; }

        const selectedCode = this.countryCodeList().find(
            (c: any) => c.MobileCountryCode === prefix
        );
        if (!selectedCode || !selectedCode.MobileNumberLength) { return; }

        const digits = this.phoneNumber().replace(/\D/g, "");
        const maxLength = selectedCode.MobileNumberLength;

        if (digits.length > maxLength) {
            this.phoneNumber(digits.slice(0, maxLength));
        }
    }

    private _validate(): boolean {
        this.phoneError("");

        const phone = this.phoneNumber().trim();

        if (!this.selectedPrefix()) {
            this.phoneError("Please select a country code.");
            return false;
        }

        if (!phone) {
            this.phoneError("Phone number is required.");
            return false;
        }

        if (!/^\d+$/.test(phone)) {
            this.phoneError("Digits only.");
            return false;
        }

        if (phone.length < 8) {
            this.phoneError("Phone number too short (min 8 digits).");
            return false;
        }

        return true;
    }
}