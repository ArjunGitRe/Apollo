System.register(["PosApi/Create/RequestHandlers"], function (exports_1, context_1) {
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
    var RequestHandlers_1, NIVoidPaymentOperationResponse;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (RequestHandlers_1_1) {
                RequestHandlers_1 = RequestHandlers_1_1;
            }
        ],
        execute: function () {
            NIVoidPaymentOperationResponse = (function (_super) {
                __extends(NIVoidPaymentOperationResponse, _super);
                function NIVoidPaymentOperationResponse() {
                    return _super.call(this) || this;
                }
                return NIVoidPaymentOperationResponse;
            }(RequestHandlers_1.Response));
            exports_1("default", NIVoidPaymentOperationResponse);
        }
    };
});
//# sourceMappingURL=K:/TSC/SourceCode/TSCLMGApollo/TSC.LMG.POS.Extension/Operations/Network/NIVoid/NIVoidPaymentOperationResponse.js.map