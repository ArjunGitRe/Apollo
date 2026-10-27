import * as Dialogs from "PosApi/Create/Dialogs";
import ko from "../../../Libraries/knockout";


export interface IOTPDialogResult {
    success: boolean;
    otpValue: string;
}

export default class ShukranCustomerSearchDialog extends Dialogs.ExtensionTemplatedDialogBase {

    public otpValue: ko.Observable<string>;
    public otpError: ko.Observable<string>;
    public otpValidating: ko.Observable<boolean>;
    public phoneNumber: string;

    private _resolveResult: (result: IOTPDialogResult) => void;
   
    constructor() {
        super();
        this.otpValue = ko.observable("");
        this.otpError = ko.observable("");
        this.otpValidating = ko.observable(false);
        this.phoneNumber = "";
    }

   
    public open(phoneNumber: string): Promise<IOTPDialogResult> {

        this.phoneNumber = phoneNumber;
        this.otpValue("");
        this.otpError("");

        let promise: Promise<IOTPDialogResult> = new Promise((resolve) => {
            this._resolveResult = resolve;

           
            let option: Dialogs.ITemplatedDialogOptions = {
                title: "Shukran OTP Validate",
                button1: {
                    id: "btnOK",
                    label: "Validate",
                    isPrimary: true,
                    onClick: this._validateClickHandler.bind(this)
                },
                button2: {
                    id: "btnCancel",
                    label: "Cancel",
                    isPrimary: false,
                    onClick: this._cancelClickHandler.bind(this)
                }
            };

            this.openDialog(option);
        });

        return promise;
    }

    onReady(element: HTMLElement): void {
        ko.applyBindings(this, element);
    }

    public onOtpKeyDown(_data: unknown, event: KeyboardEvent): boolean {
        if (event.key === "Enter") {
            this.otpError("");

            if (!this.otpValue().trim()) {
                this.otpError("Please enter the OTP");
                return false;
            }

            const otp = this.otpValue().trim();

            if (!/^\d+$/.test(otp)) {
                this.otpError("OTP must contain digits only");
                return false;
            }

            if (otp.length < 4 || otp.length > 5) {
                this.otpError("OTP must be 4–5 digits");
                return false;
            }

            this._resolveResult({ success: true, otpValue: otp });
            this.closeDialog();  // explicitly close since we're bypassing the button
            return false;
        }
        return true;
    }

    private _validateClickHandler(): boolean {
        this.otpError("");

        if (!this.otpValue().trim()) {
            this.otpError("Please enter the OTP");
            return false; 
        }

        const otp = this.otpValue().trim();

        if (!/^\d+$/.test(otp)) {
            this.otpError("OTP must contain digits only");
            return false;
        }

        if (otp.length < 4 || otp.length > 5) {
            this.otpError("OTP must be 4 or 5 digits");
            return false;
        }

        // TODO: call ValidateShukranOTPRequest here
        // On failure: this.otpError("Invalid OTP. Please try again."); return false;

        this._resolveResult({ success: true, otpValue: otp });
        return true; 
    }
    private _cancelClickHandler(): boolean {
        this._resolveResult({ success: false, otpValue: "" });
        return true; 
    }
}