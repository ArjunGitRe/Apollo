import { Response } from "PosApi/Create/RequestHandlers";

/**
 * Response from SearchShukranForPaymentRequestHandler.
 *
 * isLinked:   true  → Shukran profile is linked on the cart, proceed to payment
 * isLinked:   false → profile not linked (search opened, cashier needs to retry)
 * canceled:   true  → flow was blocked (not active, etc.) — cancel the payment
 */
export default class SearchShukranForPaymentResponse extends Response {

    public readonly isLinked: boolean;
    public readonly canceled: boolean;
    public readonly message: string;

    constructor(isLinked: boolean, canceled: boolean, message: string = "") {
        super();
        this.isLinked = isLinked;
        this.canceled = canceled;
        this.message = message;
    }
}