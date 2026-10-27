import * as Dialogs from "PosApi/Create/Dialogs";
import ko, { Observable } from "../../../Libraries/knockout";

export interface IEmailSearchResult {
    confirmed: boolean;
    email: string;
}

export default class ShukranCustEmailSearchDialog extends Dialogs.ExtensionTemplatedDialogBase {

    public email: Observable<string>;
    public validationMessage: Observable<string>;

    private _resolve: (result: IEmailSearchResult) => void;

    constructor() {
        super();
        this.email = ko.observable("");
        this.validationMessage = ko.observable("");
    }

    public onReady(element: HTMLElement): void {
        ko.applyBindings(this, element);
    }

    public open(): Promise<IEmailSearchResult> {
        this.email("");
        this.validationMessage("");

        return new Promise((resolve) => {
            this._resolve = resolve;

            const dialogOptions: Dialogs.ITemplatedDialogOptions = {
                title: "",
                subTitle: "EMAIL SEARCH",
                button1: {
                    id: "EmailSearchButton",
                    isPrimary: true,
                    label: "Search",
                    onClick: this._searchClickHandler.bind(this)
                },
                button2: {
                    id: "EmailCancelButton",
                    isPrimary: false,
                    label: "Back",
                    onClick: this._cancelClickHandler.bind(this)
                },
                onCloseX: this._cancelClickHandler.bind(this)
            };

            this.openDialog(dialogOptions);
        });
    }


    private _searchClickHandler(): boolean {
        const value = this.email().trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            this.validationMessage("Please enter a valid email address.");
            return false;  // keep dialog open
        }

        this._resolve({ confirmed: true, email: value });
        return true;  // close dialog
    }

    private _cancelClickHandler(): boolean {
        this._resolve({ confirmed: false, email: "" });
        return true;  // close dialog
    }
}