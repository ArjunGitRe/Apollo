import * as Dialogs from "PosApi/Create/Dialogs";
//import { Entities } from "PosApi/Entities";
import ko from "../../../Libraries/knockout";

export default class EnrollmentPreviewDialog extends Dialogs.ExtensionTemplatedDialogBase {

    public firstName: ko.KnockoutObservable<string>;
    public lastName: ko.KnockoutObservable<string>;
    public phone: ko.KnockoutObservable<string>;
    public email: ko.KnockoutObservable<string>;
    public city: ko.KnockoutObservable<string>;
    public country: ko.KnockoutObservable<string>;
    public gender: ko.KnockoutObservable<string>;
    public nationality: ko.KnockoutObservable<string>;
    public dob: ko.KnockoutObservable<string>;       
    public language: ko.KnockoutObservable<string>;
    public consentGiven: ko.KnockoutObservable<string>;
    public marketingConsentGiven: ko.KnockoutObservable<string>;

    private _resolve: (value: string) => void;

    constructor() {
        super();

        this.firstName = ko.observable("");
        this.lastName = ko.observable("");
        this.phone = ko.observable("");
        this.email = ko.observable("");
        this.city = ko.observable("");
        this.country = ko.observable("");
        this.gender = ko.observable("");
        this.nationality = ko.observable("");
        this.dob = ko.observable("");
        this.language = ko.observable("");
        this.consentGiven = ko.observable("");
        this.marketingConsentGiven = ko.observable("");
    }

    public onReady(element: HTMLElement): void {
        ko.applyBindings(this, element);
    }

    public open(customerDetails: any): Promise<string> {

        if (customerDetails != null) {

            this.firstName(customerDetails.firstName);
            this.lastName(customerDetails.lastName);
            this.phone(customerDetails.phone);
            this.email(customerDetails.email);
            this.city(customerDetails.city);
            this.country(customerDetails.country);
            this.gender(customerDetails.gender);
            this.nationality(customerDetails.nationality);
            this.dob(customerDetails.dob || "—");
            this.language(customerDetails.language || "—");
            this.consentGiven(customerDetails.consentGiven ? "Yes" : "No");
            this.marketingConsentGiven(customerDetails.marketingConsentGiven ? "Yes" : "No");
        }

        let promise: Promise<string> =
            new Promise((resolve: (value: string) => void, reject: (reason: any) => void): void => {

                this._resolve = resolve;

                let dialogOptions: Dialogs.ITemplatedDialogOptions = {

                    title: "",
                    subTitle: "CONFIRM CUSTOMER ENROLLMENT",

                    button1: {
                        id: "EnrollButton",
                        isPrimary: true,
                        label: "Enroll",
                        onClick: (): boolean => {

                            this._resolve("Enroll");
                            return true;
                        }
                    },

                    button2: {
                        id: "EditButton",
                        isPrimary: false,
                        label: "Edit",
                        onClick: (): boolean => {

                            this._resolve("Edit");
                            return true;
                        }
                    },

                    onCloseX: (): boolean => {
                        this._resolve("Edit");
                        return true;
                    }
                };

                this.openDialog(dialogOptions);
            });

        return promise;
    }
}