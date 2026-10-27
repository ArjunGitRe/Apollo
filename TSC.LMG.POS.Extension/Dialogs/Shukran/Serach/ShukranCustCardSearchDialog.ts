import * as Dialogs from "PosApi/Create/Dialogs";
import ko, { Observable } from "../../../Libraries/knockout";

export interface ICardSearchResult {
    confirmed: boolean;
    cardNumber: string;
    hasVoSuffix: boolean;
}

export default class ShukranCustCardSearchDialog extends Dialogs.ExtensionTemplatedDialogBase {

    public cardNumber: Observable<string>;
    public validationMessage: Observable<string>;

    private _resolve: (result: ICardSearchResult) => void;

    // Scan buffer — populated by the element-level keydown listener
    private _scanBuffer: string = "";
    private _scanTimer: ReturnType<typeof setTimeout> | null = null;

    private _hasVoSuffix: boolean = false;
    constructor() {
        super();
        this.cardNumber = ko.observable("");
        this.validationMessage = ko.observable("");
    }

    public onReady(element: HTMLElement): void {
        ko.applyBindings(this, element);

        
        const input = element.querySelector<HTMLInputElement>("#cardScanInput");
        if (input) {
            input.focus();
            input.addEventListener("keydown", (e: KeyboardEvent) => {
                this._onScanKeyDown(e);
            });
        }
    }


    public open(): Promise<ICardSearchResult> {
        this.cardNumber("");
        this.validationMessage("");
        this._scanBuffer = "";
        this._hasVoSuffix = false; 

        return new Promise((resolve) => {
            this._resolve = resolve;

            const dialogOptions: Dialogs.ITemplatedDialogOptions = {
                title: "",
                subTitle: "CARD NUMBER SEARCH",
                button1: {
                    id: "CardSearchButton",
                    isPrimary: true,
                    label: "Search",
                    onClick: this._searchClickHandler.bind(this)
                },
                button2: {
                    id: "CardCancelButton",
                    isPrimary: false,
                    label: "Back",
                    onClick: this._cancelClickHandler.bind(this)
                },
                onCloseX: this._cancelClickHandler.bind(this)
            };

            this.openDialog(dialogOptions);
        });
    }


    private _onScanKeyDown(e: KeyboardEvent): void {
        if (e.key === "Enter" || e.key === "Tab") {
            // Scanner finished sending — flush the buffer
            let raw = this._scanBuffer.trim();
            this._scanBuffer = "";

            if (this._scanTimer !== null) {
                clearTimeout(this._scanTimer);
                this._scanTimer = null;
            }

            if (!raw) return;

            // Detect and record VO suffix BEFORE stripping
            this._hasVoSuffix = raw.toUpperCase().endsWith("VO"); 

            // Strip scanner suffix "VO" — same as original numpad flow
            if (this._hasVoSuffix) {
                raw = raw.slice(0, -2).replace(/\s+/g, "");
            }

            this.cardNumber(raw);
            this.validationMessage("");
            //e.preventDefault();

            const searchButton = document.getElementById("CardSearchButton");
            if (searchButton) {
                searchButton.click();
            }


        } else if (e.key.length === 1) {
            // Accumulate printable characters into the buffer
            this._scanBuffer += e.key;

            // If characters stop arriving for 100 ms it was keyboard, not scanner — discard
            if (this._scanTimer !== null) clearTimeout(this._scanTimer);
            this._scanTimer = setTimeout(() => {
                this._scanBuffer = "";
                this._scanTimer = null;
            }, 100) as unknown as ReturnType<typeof setTimeout>;
        }

        // Prevent the readonly input's own value from changing
        e.preventDefault();
    }

   

    private _searchClickHandler(): boolean {
        const value = this.cardNumber().trim();

        if (!value) {
            this.validationMessage("Please scan the card barcode.");
            return false;  // keep dialog open
        }

        if (value.length < 16) {
            this.validationMessage("Invalid card number. Please scan again.");
            this.cardNumber("");
            this._hasVoSuffix = false; 
            return false;  // keep dialog open
        }

        this._resolve({ confirmed: true, cardNumber: value, hasVoSuffix: this._hasVoSuffix });
        return true;  // close dialog
    }

    private _cancelClickHandler(): boolean {
        this._resolve({ confirmed: false, cardNumber: "", hasVoSuffix: false });
        return true;  // close dialog
    }
}