import { IMessageDialogOptions, ShowMessageDialogClientRequest } from "PosApi/Consume/Dialogs";
import * as Dialogs from "PosApi/Create/Dialogs";
import ko from "../../../Libraries/knockout";

export default class ShukranRedeemDialog extends Dialogs.ExtensionTemplatedDialogBase {

    public availableCashValue: ko.KnockoutObservable<number>;
    public redeemAmount: ko.KnockoutObservable<number>;
    public availablePoints: ko.KnockoutObservable<number>;

    private _resolve: (value: number | null) => void;
   

    constructor() {
        super();

        this.availableCashValue = ko.observable(0);
        this.redeemAmount = ko.observable(0);
        this.availablePoints = ko.observable(0);
    }

    public onReady(element: HTMLElement): void {
        ko.applyBindings(this, element);
    }

   

    public open(points: number, cashValue: number): Promise<number | null> {

        this.availableCashValue(cashValue);
        this.redeemAmount(null);
        this.availablePoints(points);

        let promise: Promise<number | null> =
            new Promise((resolve: (value: number | null) => void): void => {

                this._resolve = resolve;
                
                let dialogOptions: Dialogs.ITemplatedDialogOptions = {

                    title: "",
                    subTitle: "SHUKRAN REDEMPTION",

                    button1: {
                        id: "RedeemButton",
                        isPrimary: true,
                        label: "Redeem",
                        onClick: this._redeemClickHandler.bind(this)
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

    public onAmountKeyDown(_data: unknown, event: KeyboardEvent): boolean {
        if (event.key === "Enter") {
            const redeemButton = document.getElementById("RedeemButton");
            if (redeemButton) {
                redeemButton.click();
            }
            return false;
        }
        return true;
    }

    private _redeemClickHandler(): boolean {
        const amount = Number(this.redeemAmount());

        if (amount <= 0) {
            return false;
        }

        if (amount > this.availableCashValue()) {
            this._showMessage("Amount exceeds available cash value");
            return false;
        }

        this._resolve(amount);
        return true;
    }

    private _showMessage(message: string): void {

        let options: IMessageDialogOptions = {
            message: message
        };

        let dialogRequest = new ShowMessageDialogClientRequest(options);
        this.context.runtime.executeAsync(dialogRequest);
    }
    private _cancelClickHandler(): boolean {
        this._resolve(null);
        return true;
    }
}