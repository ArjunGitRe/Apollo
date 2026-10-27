System.register(["PosApi/Create/Operations"], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };
        return function (d, b) {
            if (typeof b !== "function" && b !== null)
                throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var Operations_1, NIVoidPaymentOperationRequest;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Operations_1_1) {
                Operations_1 = Operations_1_1;
            }
        ],
        execute: function () {
            NIVoidPaymentOperationRequest = (function (_super) {
                __extends(NIVoidPaymentOperationRequest, _super);
                function NIVoidPaymentOperationRequest(correlationId) {
                    return _super.call(this, 6111, correlationId) || this;
                }
                return NIVoidPaymentOperationRequest;
            }(Operations_1.ExtensionOperationRequestBase));
            exports_1("default", NIVoidPaymentOperationRequest);
        }
    };
});
//# sourceMappingURL=K:/TSC/SourceCode/TSCLMGApollo/TSC.LMG.POS.Extension/Operations/Network/NIVoid/NIVoidPaymentOperationRequest.js.map