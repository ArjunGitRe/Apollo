import { ExtensionRequestBase } from "PosApi/Create/RequestHandlers";
import SearchShukranForPaymentResponse from "./SearchShukranForPaymentResponse";
import { ProxyEntities } from "PosApi/Entities";

/**
 * Request to search/validate a Shukran customer profile before NI/Aani payment.
 * Pass the current cart so the handler can read extension properties.
 */
export default class SearchShukranForPaymentRequest<TResponse extends SearchShukranForPaymentResponse>
    extends ExtensionRequestBase<TResponse> {

    public readonly cart: ProxyEntities.Cart;

    constructor(cart: ProxyEntities.Cart) {
        super();
        this.cart = cart;
    }
}