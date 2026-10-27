import * as Dialogs from "PosApi/Create/Dialogs";
import {
    ShowListInputDialogClientRequest,
    ShowListInputDialogClientResponse
} from "PosApi/Consume/Dialogs";
//import { IAlphanumericInputDialogOptions } from "PosApi/Consume/Dialogs";
import { ClientEntities } from "PosApi/Entities";
import ko, { Observable } from "../../Libraries/knockout";
import ShukranCustPhoneSearchDialog, { IPhoneSearchResult } from "./Serach/ShukranCustPhoneSearchDialog";
import ShukranCustCardSearchDialog, { ICardSearchResult } from "./Serach/ShukranCustCardSearchDialog";
import ShukranCustEmailSearchDialog, { IEmailSearchResult } from "./Serach/ShukranCustEmailSearchDialog";

export interface IShukranSearchResult {
    confirmed: boolean;
    searchType: string;
    searchValue: string;
    inputMethod?: string;
    phoneNumber?: string;
    phonePrefix?: number;
    phoneCountryRegionId?: string;
}

export default class ShukranCustomerEnrollOTP extends Dialogs.ExtensionTemplatedDialogBase {

    public validationMessage: Observable<string>;
    public labelSearchType: Observable<string>;

    private _resolve: (result: IShukranSearchResult) => void;

    constructor() {
        super();
        this.validationMessage = ko.observable("");
        this.labelSearchType = ko.observable("Select Search Type");
    }

    public onReady(element: HTMLElement): void {
        ko.applyBindings(this, element);
    }

    public open(): Promise<IShukranSearchResult> {
        return new Promise((resolve) => {
            this._resolve = resolve;
            this.openSearchTypeList();
        });
    }

    private openSearchTypeList(): void {
        let items = [
            { label: "Phone Number", value: "PhoneNumber" },
            { label: "Card Number", value: "CardNumber" },
            { label: "Email Address", value: "Email" }
        ];

        let request = new ShowListInputDialogClientRequest({
            title: "Shukran Customer Search",
            subTitle: "Select how you want to search",
            items: items
        });

        this.context.runtime.executeAsync(request)
            .then((result: ClientEntities.ICancelableDataResult<ShowListInputDialogClientResponse>) => {
                if (result.canceled) {
                    this._resolve({ confirmed: false, searchType: "", searchValue: "" });
                    return;
                }
                //const selectedValue = result.data.result.value.value;
                let selectedItem = result.data.result.value;
                //this.openAlphanumericInput(selectedItem.value, selectedItem.label);
                if (selectedItem.value === "PhoneNumber") {
                    this._openPhoneSearchDialog();
                } else if (selectedItem.value === "CardNumber") {
                    this._openCardSearchDialog();
                } else if (selectedItem.value === "Email") {
                    this._openEmailSearchDialog();
                }
            })
            .catch(() => {
                this._resolve({ confirmed: false, searchType: "", searchValue: "" });
            });
    }

    private _openPhoneSearchDialog(): void {
        let phoneDialog = new ShukranCustPhoneSearchDialog();

        //phoneDialog.context = this.context;

        phoneDialog.open()
            .then((result: IPhoneSearchResult) => {
                if (!result.confirmed) {
                    // Go back to the search type list
                    this.openSearchTypeList();
                    return;
                }

                this._resolve({
                    confirmed: true,
                    searchType: "PhoneNumber",
                    searchValue: result.phoneWithPrefix,
                    phoneNumber: result.phoneNumber,
                    phonePrefix: result.selectedPrefix,
                    phoneCountryRegionId: result.countryRegionId
                });
            })
            .catch(() => {
                this._resolve({ confirmed: false, searchType: "", searchValue: "" });
            });
    }

    private _openCardSearchDialog(): void {
        const dialog = new ShukranCustCardSearchDialog();

        dialog.open()
            .then((result: ICardSearchResult) => {
                if (!result.confirmed) {
                    this.openSearchTypeList();   // back to list
                    return;
                }
                this._resolve({
                    confirmed: true,
                    searchType: "CardNumber",
                    searchValue: result.cardNumber,
                    inputMethod: result.hasVoSuffix ? "VO" : "CARD"
                });
            })
            .catch(() => {
                this._resolve({ confirmed: false, searchType: "", searchValue: "" });
            });
    }

    private _openEmailSearchDialog(): void {
        const dialog = new ShukranCustEmailSearchDialog();

        dialog.open()
            .then((result: IEmailSearchResult) => {
                if (!result.confirmed) {
                    this.openSearchTypeList();   // back to list
                    return;
                }
                this._resolve({
                    confirmed: true,
                    searchType: "Email",
                    searchValue: result.email,
                    inputMethod: "TYPED"
                });
            })
            .catch(() => {
                this._resolve({ confirmed: false, searchType: "", searchValue: "" });
            });
    }

    //private openAlphanumericInput(searchType: string, searchLabel: string): void {
    //    let title = "";
    //    let numPadLabel = "";

    //    switch (searchType) {
    //        //case "PhoneNumber":
    //        //    title = "Phone Number Search";
    //        //    numPadLabel = "Phone Number";
    //        //    break;
    //        case "CardNumber":
    //            title = "Card Number Search";
    //            numPadLabel = "Scan Card Barcode";
    //            break;
    //        case "Email":
    //            title = "Email Search";
    //            numPadLabel = "Email Address";
    //            break;
    //    }

    //    // Using your exact working pattern
    //    let inputOptions: IAlphanumericInputDialogOptions = {
    //        title: title,
    //        numPadLabel: numPadLabel,
    //        subTitle: searchType === "CardNumber" ? "Please scan the card barcode — manual entry is not allowed." : "",
    //        enableBarcodeScanner: searchType === "CardNumber",
    //        defaultValue: ""
    //    };

    //    let inputRequest: ShowAlphanumericInputDialogClientRequest<ShowAlphanumericInputDialogClientResponse> =
    //        new ShowAlphanumericInputDialogClientRequest<ShowAlphanumericInputDialogClientResponse>(inputOptions);

    //    this.context.runtime.executeAsync(inputRequest)
    //        .then((numpadResp: ClientEntities.ICancelableDataResult<ShowAlphanumericInputDialogClientResponse>) => {
    //            if (numpadResp.canceled || !numpadResp.data || !numpadResp.data.result) {
    //                // User cancelled — go back to list
    //                this.openSearchTypeList();
    //                return;
    //            }

    //            let rawValue: string = numpadResp.data.result.value?.trim() || "";
    //            let inputMethod = "TYPED";
    //            let inputValue = rawValue;

    //            if (searchType === "CardNumber") {
    //                if (!rawValue.toUpperCase().endsWith("VO")) {
    //                    // Manual entry detected — reject and re-prompt
    //                    this._showError("Card number must be scanned. Manual entry is not allowed.")
    //                        .then(() => this.openAlphanumericInput(searchType, searchLabel));
    //                    return;
    //                }
    //                // Strip the "VO" scan suffix
    //                inputValue = rawValue.slice(0, -2);
    //                inputValue = inputValue.replace(/\s+/g, "");
    //                inputMethod = "SCAN";
    //            }

    //            //if (searchType === "CardNumber" && inputValue.toUpperCase().endsWith("VO")) {
    //            //    inputValue = inputValue.slice(0, -2); // Remove last 2 characters "VO"
    //            //    inputValue = inputValue.replace(/\s+/g, "");
    //            //    inputMethod = "SCAN";    
    //            //}

    //            if (!this.validateInput(searchType, inputValue)) {
    //                // Invalid — re-open alphanumeric input
    //                this.openAlphanumericInput(searchType, searchLabel);
    //                return;
    //            }

    //            this._resolve({
    //                confirmed: true,
    //                searchType: searchType,
    //                searchValue: inputValue,
    //                inputMethod: inputMethod 
    //            });
    //        })
    //        .catch(() => {
    //            this._resolve({ confirmed: false, searchType: "", searchValue: "" });
    //        });
    //}

    //private _showError(message: string): Promise<void> {
        
    //    let request = new ShowListInputDialogClientRequest({
    //        title: "Invalid Input",
    //        subTitle: message,
    //        items: [{ label: "Try Again", value: "retry" }]
    //    });

    //    return this.context.runtime.executeAsync(request).then(() => { return; });

    //}
    //private validateInput(type: string, value: string): boolean {
    //    if (!value) {
    //        return false;
    //    }

    //    switch (type) {
    //        //case "PhoneNumber":
    //        //    if (!/^[0-9]{8,15}$/.test(value)) {
    //        //        return false;
    //        //    }
    //        //    break;
    //        case "Email":
    //            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    //                return false;
    //            }
    //            break;
    //        case "CardNumber":
    //            if (value.length < 16) {
    //                return false;
    //            }
    //            break;
    //    }

    //    return true;
    //}
}