System.register(["PosApi/Create/Operations", "PosApi/TypeExtensions", "PosApi/Consume/Cart", "PosApi/Consume/Device", "PosApi/Consume/Dialogs", "../../../Dialogs/Network/NIPaymentDialog", "../../../Helper/NIRequestType", "./NIVoidPaymentOperationRequest", "./NIVoidPaymentOperationResponse"], function (exports_1, context_1) {
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
    var Operations_1, TypeExtensions_1, Cart_1, Device_1, Dialogs_1, Cart_2, NIPaymentDialog_1, NIRequestType_1, NIVoidPaymentOperationRequest_1, NIVoidPaymentOperationResponse_1, NIVoidPaymentOperationRequestHandler;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Operations_1_1) {
                Operations_1 = Operations_1_1;
            },
            function (TypeExtensions_1_1) {
                TypeExtensions_1 = TypeExtensions_1_1;
            },
            function (Cart_1_1) {
                Cart_1 = Cart_1_1;
                Cart_2 = Cart_1_1;
            },
            function (Device_1_1) {
                Device_1 = Device_1_1;
            },
            function (Dialogs_1_1) {
                Dialogs_1 = Dialogs_1_1;
            },
            function (NIPaymentDialog_1_1) {
                NIPaymentDialog_1 = NIPaymentDialog_1_1;
            },
            function (NIRequestType_1_1) {
                NIRequestType_1 = NIRequestType_1_1;
            },
            function (NIVoidPaymentOperationRequest_1_1) {
                NIVoidPaymentOperationRequest_1 = NIVoidPaymentOperationRequest_1_1;
            },
            function (NIVoidPaymentOperationResponse_1_1) {
                NIVoidPaymentOperationResponse_1 = NIVoidPaymentOperationResponse_1_1;
            }
        ],
        execute: function () {
            NIVoidPaymentOperationRequestHandler = (function (_super) {
                __extends(NIVoidPaymentOperationRequestHandler, _super);
                function NIVoidPaymentOperationRequestHandler() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this._niStatusInterval = 0;
                    _this._niMaxStatusCount = 0;
                    return _this;
                }
                NIVoidPaymentOperationRequestHandler.prototype.supportedRequestType = function () {
                    return NIVoidPaymentOperationRequest_1.default;
                };
                NIVoidPaymentOperationRequestHandler.prototype.executeAsync = function (request) {
                    var _this = this;
                    return this.context.runtime.executeAsync(new Cart_1.GetCurrentCartClientRequest())
                        .then(function (cartResponse) {
                        var _a, _b, _c, _d;
                        if (TypeExtensions_1.ObjectExtensions.isNullOrUndefined((_a = cartResponse === null || cartResponse === void 0 ? void 0 : cartResponse.data) === null || _a === void 0 ? void 0 : _a.result)) {
                            _this._showMessage("Unable to retrieve the current cart.");
                            return { canceled: true, data: new NIVoidPaymentOperationResponse_1.default() };
                        }
                        var cart = cartResponse.data.result;
                        var niTenderLine = _this._findNITenderLine(cart);
                        if (!niTenderLine) {
                            _this._showMessage("No NI card payment found on this transaction to void.");
                            return { canceled: true, data: new NIVoidPaymentOperationResponse_1.default() };
                        }
                        if (niTenderLine.Amount < 0) {
                            _this._showMessage("This NI payment has already been voided.");
                            return { canceled: true, data: new NIVoidPaymentOperationResponse_1.default() };
                        }
                        var niInvoiceNo = (_b = niTenderLine.ExtensionProperties
                            .filter(function (p) { return p.Key === "NI_INVOICENO"; })
                            .map(function (p) { var _a, _b; return (_b = (_a = p.Value) === null || _a === void 0 ? void 0 : _a.StringValue) !== null && _b !== void 0 ? _b : ""; })[0]) !== null && _b !== void 0 ? _b : "";
                        var lineNo = (_c = niTenderLine.ExtensionProperties
                            .filter(function (p) { return p.Key === "NI_Line"; })
                            .map(function (p) { var _a, _b; return (_b = (_a = p.Value) === null || _a === void 0 ? void 0 : _a.StringValue) !== null && _b !== void 0 ? _b : ""; })[0]) !== null && _c !== void 0 ? _c : "1";
                        var tenderLineId = (_d = niTenderLine.TenderLineId) !== null && _d !== void 0 ? _d : "";
                        if (!niInvoiceNo) {
                            _this._showMessage("Cannot find the original NI payment reference. Please do a manual void.");
                            return { canceled: true, data: new NIVoidPaymentOperationResponse_1.default() };
                        }
                        if (!tenderLineId) {
                            _this._showMessage("Cannot find the tender line ID. Please do a manual void.");
                            return { canceled: true, data: new NIVoidPaymentOperationResponse_1.default() };
                        }
                        return _this._loadDeviceConfig()
                            .then(function () {
                            var dialog = new NIPaymentDialog_1.default(_this.context, cart.Id, niTenderLine.TenderTypeId, niTenderLine.Amount, lineNo, NIRequestType_1.NIRequestType.Void, niInvoiceNo, "", _this._niStatusInterval, _this._niMaxStatusCount, false);
                            return dialog.open()
                                .then(function () {
                                var transResult = dialog.val;
                                if (transResult === "true") {
                                    var correlationId = _this.context.logger.getNewCorrelationId();
                                    return _this.context.runtime.executeAsync(new Cart_2.VoidTenderLineOperationRequest(tenderLineId, correlationId))
                                        .then(function () {
                                        return { canceled: false, data: new NIVoidPaymentOperationResponse_1.default() };
                                    }).catch(function (reason) {
                                        _this.context.logger.logError("NIVoidPaymentOperation.VoidTenderLine failed: " + JSON.stringify(reason));
                                        _this._showMessage("Payment was reversed on the terminal but the tender line " +
                                            "could not be removed automatically. Please remove it manually.");
                                        return { canceled: false, data: new NIVoidPaymentOperationResponse_1.default() };
                                    });
                                }
                                else {
                                    return Promise.resolve({ canceled: true, data: new NIVoidPaymentOperationResponse_1.default() });
                                }
                            });
                        });
                    })
                        .catch(function (error) {
                        _this.context.logger.logError("NIVoidPaymentOperationRequestHandler: " + JSON.stringify(error));
                        _this._showMessage("An error occurred during NI void.");
                        return { canceled: true, data: new NIVoidPaymentOperationResponse_1.default() };
                    });
                };
                NIVoidPaymentOperationRequestHandler.prototype._findNITenderLine = function (cart) {
                    var _a;
                    if (!cart.TenderLines || cart.TenderLines.length === 0) {
                        return null;
                    }
                    return (_a = cart.TenderLines.find(function (line) {
                        if (line.VoidStatusValue === 1)
                            return false;
                        if (!line.ExtensionProperties || line.ExtensionProperties.length === 0)
                            return false;
                        return line.ExtensionProperties.some(function (p) { var _a; return p.Key === "NI_Line" && ((_a = p.Value) === null || _a === void 0 ? void 0 : _a.StringValue); });
                    })) !== null && _a !== void 0 ? _a : null;
                };
                NIVoidPaymentOperationRequestHandler.prototype._loadDeviceConfig = function () {
                    var _this = this;
                    return this.context.runtime.executeAsync(new Device_1.GetDeviceConfigurationClientRequest(this.context.logger.getNewCorrelationId()))
                        .then(function (response) {
                        var props = response.data.result.ExtensionProperties || [];
                        var find = function (key) { var _a, _b; return ((_b = (_a = props.find(function (p) { return p.Key === key; })) === null || _a === void 0 ? void 0 : _a.Value) === null || _b === void 0 ? void 0 : _b.StringValue) || ""; };
                        var intervalRaw = find("NISTATUSINTERVAL");
                        var maxCountRaw = find("NIMAXSTATUSCOUNT");
                        _this._niStatusInterval = intervalRaw && !isNaN(Number(intervalRaw)) ? Number(intervalRaw) : 5;
                        _this._niMaxStatusCount = maxCountRaw && !isNaN(Number(maxCountRaw)) ? Number(maxCountRaw) : 12;
                    });
                };
                NIVoidPaymentOperationRequestHandler.prototype._showMessage = function (message) {
                    var options = { message: message };
                    this.context.runtime.executeAsync(new Dialogs_1.ShowMessageDialogClientRequest(options));
                };
                return NIVoidPaymentOperationRequestHandler;
            }(Operations_1.ExtensionOperationRequestHandlerBase));
            exports_1("default", NIVoidPaymentOperationRequestHandler);
        }
    };
});
//# sourceMappingURL=K:/TSC/SourceCode/TSCLMGApollo/TSC.LMG.POS.Extension/Operations/Network/NIVoid/NIVoidPaymentOperationRequestHandler.js.map