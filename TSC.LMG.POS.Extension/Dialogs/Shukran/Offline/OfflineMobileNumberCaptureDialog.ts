import { ExtensionTemplatedDialogBase, ITemplatedDialogOptions } from "PosApi/Create/Dialogs";
import ko from "../../../Libraries/knockout";

export default class OfflineMobileNumberCaptureDialog extends ExtensionTemplatedDialogBase {
    public title: ko.Observable<string>;
    public mobileNumber: ko.Observable<string>;
    public errorMessage: ko.Observable<string>;

    private _resolve: (result: string | null) => void;

    constructor() {
        super();
        this.title = ko.observable("Enter customer mobile number");
        this.mobileNumber = ko.observable("");
        this.errorMessage = ko.observable("");
    }

    public onReady(element: HTMLElement): void {
        ko.applyBindings(this, element);
    }

    public open(): Promise<string | null> {
        return new Promise<string | null>((resolve) => {
            this._resolve = resolve;
            const option: ITemplatedDialogOptions = {
                title: "Shukran (Offline)",
                subTitle: "",
                onCloseX: () => { this._resolveAndClose(null); return true; },
                button1: {
                    id: "btnOk",
                    label: "OK",
                    isPrimary: true,
                    onClick: () => this._onOkClick()
                },
                button2: {
                    id: "btnCancel",
                    label: "Cancel",
                    onClick: () => { this._resolveAndClose(null); return true; }
                }
            };
            this.openDialog(option);
        });
    }

    public onKeyPress = (data: any, event: KeyboardEvent): boolean => {
        if (event.key === "Enter") {
            this._onOkClick();
            return false;
        }
        // digits only
        return /[0-9]/.test(event.key);
    };

    private _onOkClick(): boolean {
        const mobile: string = (this.mobileNumber() || "").trim();
        if (!this._isValidMobile(mobile)) {
            this.errorMessage("Please enter a valid mobile number (e.g. 05XXXXXXXX).");
            return false; // keep dialog open
        }
        this._resolveAndClose(mobile);
        return true;
    }

    private _isValidMobile(mobile: string): boolean {
        return /^(05\d{8}|9715\d{8})$/.test(mobile);
    }

    private _resolveAndClose(result: string | null): void {
        if (this._resolve) {
            this._resolve(result);
            this._resolve = null;
        }
        this.closeDialog();
    }
}