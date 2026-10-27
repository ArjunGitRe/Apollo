import { ExtensionOperationRequestBase } from "PosApi/Create/Operations";
import NcpiPayOperationResponse from "./NcpiPayOperationResponse";

/**
 * NCPI Pay Operation Request — operation ID 6113.
 * Register in manifest.json under "create.operations".
 */
export default class NcpiPayOperationRequest<TResponse extends NcpiPayOperationResponse>
    extends ExtensionOperationRequestBase<TResponse> {

    constructor(correlationId: string) {
        super(6112, correlationId);
    }
}