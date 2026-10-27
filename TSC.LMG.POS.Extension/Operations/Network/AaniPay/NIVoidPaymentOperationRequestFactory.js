System.register(["./NIVoidPaymentOperationRequest"], function (exports_1, context_1) {
    "use strict";
    var NIVoidPaymentOperationRequest_1, getOperationRequest;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (NIVoidPaymentOperationRequest_1_1) {
                NIVoidPaymentOperationRequest_1 = NIVoidPaymentOperationRequest_1_1;
            }
        ],
        execute: function () {
            getOperationRequest = function (_context, _operationId, _actionParameters, correlationId) {
                var operationRequest = new NIVoidPaymentOperationRequest_1.default(correlationId);
                return Promise.resolve({
                    canceled: false,
                    data: operationRequest
                });
            };
            exports_1("default", getOperationRequest);
        }
    };
});
//# sourceMappingURL=K:/TSC/SourceCode/TSCLMGApollo/TSC.LMG.POS.Extension/Operations/Network/NIVoid/NIVoidPaymentOperationRequestFactory.js.map