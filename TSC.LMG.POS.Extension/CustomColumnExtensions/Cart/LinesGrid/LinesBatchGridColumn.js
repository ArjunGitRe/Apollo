System.register(["PosApi/Extend/Views/CartView", "PosApi/Extend/Views/CustomGridColumns"], function (exports_1, context_1) {
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
    var CartView_1, CustomGridColumns_1, LinesBatchGridColumn;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (CartView_1_1) {
                CartView_1 = CartView_1_1;
            },
            function (CustomGridColumns_1_1) {
                CustomGridColumns_1 = CustomGridColumns_1_1;
            }
        ],
        execute: function () {
            LinesBatchGridColumn = (function (_super) {
                __extends(LinesBatchGridColumn, _super);
                function LinesBatchGridColumn(context) {
                    return _super.call(this, context) || this;
                }
                LinesBatchGridColumn.prototype.title = function () {
                    return "Batch Number";
                };
                LinesBatchGridColumn.prototype.alignment = function () {
                    return CustomGridColumns_1.CustomGridColumnAlignment.Right;
                };
                LinesBatchGridColumn.prototype.computeValue = function (cartLine) {
                    var batchExt = cartLine.ExtensionProperties.filter(function (value) {
                        if (value.Key == "TSCBATCHNO") {
                            return true;
                        }
                        return false;
                    });
                    if (batchExt.length == 0) {
                        return "";
                    }
                    return batchExt[0].Value.StringValue;
                };
                return LinesBatchGridColumn;
            }(CartView_1.CustomLinesGridColumnBase));
            exports_1("default", LinesBatchGridColumn);
        }
    };
});
//# sourceMappingURL=C:/UTCStoreCommerce/TSC.UTC.Pos.Extensions/CustomColumnExtensions/Cart/LinesGrid/LinesBatchGridColumn.js.map