import {
    DualDisplayCustomControlBase,
    IDualDisplayCustomControlContext,
    CartChangedData,
    CustomerChangedData,
    LogOnStatusChangedData,
    DualDisplayConfigurationChangedData
} from "PosApi/Extend/DualDisplay";
import { IDataList, IDataListOptions } from "PosApi/Consume/Controls";
import * as Controls from "PosApi/Consume/Controls";
import { ObjectExtensions, StringExtensions } from "PosApi/TypeExtensions";
import { ProxyEntities } from "PosApi/Entities";
import ko from "../Libraries/knockout";
import { Observable, ObservableArray, Computed } from "../Libraries/knockout";
//import DataHolder from "../../Data/DataHolder"
//import { GetDeviceConfigurationClientRequest, GetDeviceConfigurationClientResponse } from "PosApi/Consume/Device"

interface ContentItem {
    name: string;
    type: number; // 0 for image, 1 for video
    duration: number; // duration in seconds
}

interface MediaContent {
    rootUrl: string;
    content: ContentItem[];
}

export default class DualDisplayCustomControl extends DualDisplayCustomControlBase {


    public readonly cartLinesDataList: IDataList<ProxyEntities.CartLine>;
    public dataList: Controls.IDataList<ProxyEntities.CartLine>;

    public readonly cartTotalAmount: Computed<number>;
    public readonly customerName: Computed<string>;
    public readonly customerAccountNumber: Computed<string>;
    public readonly isLoggedOn: Computed<boolean>;
    public readonly employeeName: Computed<string>;
    public readonly isCartEmpty: Computed<boolean>;
    public readonly cartTotalQuantity: Computed<string>;
    public readonly cartTotalDiscount: Computed<string>;

    public readonly cartTotalAmountLabel: string;
    public readonly customerNameLabel: string;
    public readonly customerAccountNumberLabel: string;
    public readonly employeeNameLabel: string;

    private static readonly TEMPLATE_ID: string = "Microsot_Pos_Extensibility_DualDisplay";

    private readonly _cart: Observable<ProxyEntities.Cart>;
    private readonly _cartLinesObservable: ObservableArray<ProxyEntities.CartLine>;
    private readonly _customer: Observable<ProxyEntities.Customer>;
    private readonly _loggedOn: Observable<boolean>;
    private readonly _employee: Observable<ProxyEntities.Employee>;
    // private readonly _images: ObservableArray<string>;
    private readonly _widthCart: Observable<string>;
    private readonly _widthRotator: Observable<string>;
    _widthPercentage: number;

    private readonly _currentMediaItem: Observable<ContentItem>;
    private readonly _currentMediaUrl: Observable<string>;
    private readonly _isCurrentMediaVideo: Observable<boolean>;

    private _mediaContent: MediaContent;
    private _currentMediaIndex: number = 0;
    private _mediaTimer: any;


    private readonly _shukranFirstName: Observable<string>;
    private readonly _shukranTier: Observable<string>;
    private readonly _shukranJoinDate: Observable<string>;
    private readonly _shukranPoints: Observable<string>;
    private readonly _shukranPointCashValue: Observable<string>;
    private readonly _hasShukranCustomer: Observable<boolean>;

    constructor(id: string, context: IDualDisplayCustomControlContext) {
        super(id, context);

        this.cartTotalAmountLabel = "Total Amount";
        this.customerNameLabel = "Cust Name";
        this.customerAccountNumberLabel = "Cust Account";
        this.employeeNameLabel = "Emp Name";

        this._cart = ko.observable<ProxyEntities.Cart>(null);
        this._cartLinesObservable = ko.observableArray<ProxyEntities.CartLine>([]);
        this._customer = ko.observable<ProxyEntities.Customer>(null);
        this._loggedOn = ko.observable<boolean>(false);
        this._employee = ko.observable<ProxyEntities.Employee>(null);
        // this._images = ko.observableArray<string>([]);
        this._widthCart = ko.observable<string>('50%');
        this._widthRotator = ko.observable<string>('50%');
        this._widthPercentage = 0;

        this._currentMediaItem = ko.observable<ContentItem>(null);
        this._currentMediaUrl = ko.observable<string>('');
        this._isCurrentMediaVideo = ko.observable<boolean>(false);

        this._mediaContent = null;

        this._shukranFirstName = ko.observable<string>('');
        this._shukranTier = ko.observable<string>('');
        this._shukranJoinDate = ko.observable<string>('');
        this._shukranPoints = ko.observable<string>('0');
        this._shukranPointCashValue = ko.observable<string>('0');
        this._hasShukranCustomer = ko.observable<boolean>(false);


        this.cartTotalAmount = ko.computed(() => {
            //return ObjectExtensions.isNullOrUndefined(this._cart()) ? 0.00 : this._cart().TotalAmount.toFixed(2);
            let total = this._cart() && this._cart().TotalAmount
                ? this._cart().TotalAmount
                : 0;

            return total.toFixed(2);
        });

        this.cartTotalQuantity = ko.computed(() => {
            const lines = this._cartLinesObservable();
            const qty = lines.filter(line => !line.IsVoided).reduce((sum, line) => sum + (line.Quantity || 0), 0);
            return qty.toFixed(2);
        });

        this.cartTotalDiscount = ko.computed(() => {
            const lines = this._cartLinesObservable();
            const disc = lines.filter(line => !line.IsVoided).reduce((sum, line) => sum + (line.DiscountAmount || 0), 0);
            return disc.toFixed(2);
        });

        this.customerName = ko.computed(() => {
            return ObjectExtensions.isNullOrUndefined(this._customer()) ? StringExtensions.EMPTY : this._customer().Name;
        });

        this.customerAccountNumber = ko.computed(() => {
            return ObjectExtensions.isNullOrUndefined(this._customer()) ? StringExtensions.EMPTY : this._customer().AccountNumber;
        });

        this.isLoggedOn = ko.computed(() => {
            return this._loggedOn();
        });

        this.employeeName = ko.computed(() => {
            return ObjectExtensions.isNullOrUndefined(this._employee()) ? StringExtensions.EMPTY : this._employee().Name;
        });

        this.isCartEmpty = ko.computed(() => {
            return this._cartLinesObservable().length === 0;
        });

        this.cartChangedHandler = (data: CartChangedData) => {
            this._cart(data.cart);
            this._cartLinesObservable(ObjectExtensions.isNullOrUndefined(data.cart) ? [] : data.cart.CartLines);
            this.dataList.data = this._cartLinesObservable();
            this.toggleLayout(data.cart);
            this.updateShukranData(data.cart);   //Shukran loyalty data
            this.scrollDataListToBottom();
        };

        this.customerChangedHandler = (data: CustomerChangedData) => {
            this._customer(data.customer);
            if (ObjectExtensions.isNullOrUndefined(data.customer)) {
                this._hasShukranCustomer(false);
                this._shukranFirstName('');
                this._shukranTier('');
                this._shukranJoinDate('');
                this._shukranPoints('0');
                this._shukranPointCashValue('0');
            }
        };

        this.logOnStatusChangedHandler = (data: LogOnStatusChangedData) => {
            this.isProcessing = true;
            window.setTimeout(() => {
                this.isProcessing = false;
            }, 1000);

            this._loggedOn(data.loggedOn);
            this._employee(data.employee);

            this.toggleLayout(this._cart());

        };

        this.dualDisplayConfigurationChangedHandler = (data: DualDisplayConfigurationChangedData) => {
            this.fillMediaContent(data.imageRotatorPath);
            //this.fillRotatorImages(data.imageRotatorPath);
            this._widthPercentage = data.receiptWidthPercentage;
            //this._widthCart('0%');
            //this._widthRotator('100%');
            this.toggleLayout(this._cart());

        };

        this.isCartEmpty = ko.computed(() => {
            return this._cartLinesObservable().length === 0;
        });


    }

    public onReady(element: HTMLElement): void {
        ko.applyBindingsToNode(element, {
            template: {
                name: DualDisplayCustomControl.TEMPLATE_ID,
                data: this
            }
        }, this);

        let cartLinesDataListOptions: IDataListOptions<ProxyEntities.CartLine> = {
            data: this._cartLinesObservable(),
            interactionMode: Controls.DataListInteractionMode.None,
            columns: [
                {
                    title: "Item Name",
                    ratio: 30,
                    collapseOrder: 5,
                    minWidth: 60,
                    computeValue: (cartLine: ProxyEntities.CartLine): string => {
                        let value = ObjectExtensions.isNullOrUndefined(cartLine.Description) ? StringExtensions.EMPTY : cartLine.Description;
                        const styled = `<span style="display:block; text-align:left; width:100%;">${value}</span>`;
                        return cartLine.IsVoided
                            ? `<span class="voided-item" style="display:block; text-align:left; width:100%;">${value}</span>`
                            : styled;
                    }
                },
                {
                    title: "QTY",
                    ratio: 16,
                    collapseOrder: 3,
                    minWidth: 50,
                    computeValue: (cartLine: ProxyEntities.CartLine): string => {
                        let value = ObjectExtensions.isNullOrUndefined(cartLine.Quantity) ? StringExtensions.EMPTY : cartLine.Quantity.toFixed(0);
                        const styled = `<span style="display:block; text-align:left; width:100%;">${value}</span>`;
                        return cartLine.IsVoided
                            ? `<span class="voided-item" style="display:block; text-align:left; width:100%;">${value}</span>`
                            : styled;
                    }
                },
                {
                    title: "Unit Price",
                    ratio: 17,
                    collapseOrder: 4,
                    minWidth: 20,
                    computeValue: (cartLine: ProxyEntities.CartLine): string => {
                        let value = ObjectExtensions.isNullOrUndefined(cartLine.Price) ? StringExtensions.EMPTY : cartLine.Price.toFixed(2);
                        const styled = `<span style="display:block; text-align:left; width:100%;">${value}</span>`;
                        return cartLine.IsVoided
                            ? `<span class="voided-item" style="display:block; text-align:left; width:100%;">${value}</span>`
                            : styled;
                    }
                },
                {
                    title: "Discount",
                    ratio: 17,
                    collapseOrder: 2,
                    minWidth: 40,
                    computeValue: (cartLine: ProxyEntities.CartLine): string => {
                        let value = ObjectExtensions.isNullOrUndefined(cartLine.DiscountAmount)? StringExtensions.EMPTY : cartLine.DiscountAmount.toFixed(2);
                        const styled = `<span style="display:block; text-align:right; width:100%;">${value}</span>`;
                        return cartLine.IsVoided
                            ? `<span class="voided-item" style="display:block; text-align:right; width:100%;">${value}</span>`
                            : styled;
                    }
                },
                {
                    title: "Net Amt",
                    ratio: 20,
                    collapseOrder: 1,
                    minWidth: 60,
                    computeValue: (cartLine: ProxyEntities.CartLine): string => {
                        let value = ObjectExtensions.isNullOrUndefined(cartLine.TotalAmount) ? StringExtensions.EMPTY : cartLine.TotalAmount.toFixed(2);
                        //return cartLine.IsVoided ? `<span class="voided-item">${value} </span>` : value;
                        const styled = `<span style="display:block; text-align:right; width:100%;">${value}</span>`;
                        return cartLine.IsVoided
                            ? `<span class="voided-item" style="display:block; text-align:right; width:100%;">${value}</span>`
                            : styled;
                    }
                }
            ]
        };

        let dataListRootElem: HTMLDivElement = element.querySelector("#dualDisplayDataListView") as HTMLDivElement;
        this.dataList = this.context.controlFactory.create(this.context.logger.getNewCorrelationId(), "DataList", cartLinesDataListOptions, dataListRootElem);

        this.dataList.addEventListener("ItemInvoked", (eventData: { item: ProxyEntities.CartLine }) => {
            this.context.logger.logInformational("DualDisplayCustomControl constructed", this.context.logger.getNewCorrelationId());
        });


        // Add custom styles
        const style = document.createElement('style');
        style.textContent = `
            .voided-item { color: red; }
            .media-container {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;
                width: 100%;
                overflow: hidden;
                background-color: #000;
            }
            .media-content {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            .row { display: flex; height: 100vh; }
            .left-col {
                display: flex;
                flex-direction: column;
                height: 100vh;
                overflow: hidden;
                transition: width 0.5s ease-in-out;
            }
            .right-col {
                height: 100vh;
                overflow: hidden;
                transition: width 0.5s ease-in-out;
            }

            .datalist-wrapper {
                flex: 1;
             /*   overflow-y: auto;*/
                overflow: hidden;
                min-height: 0;
            }

            #dualDisplayDataListView {
                width: 100%;
                height: 100%;
            }

            #dualDisplayDataListView [class*="header"],
            #dualDisplayDataListView [role="columnheader"],
            #dualDisplayDataListView [class*="column"] {
                text-align: left !important;
                justify-content: flex-start !important;
            }

            #dualDisplayDataListView [class*="header"]:last-child,
            #dualDisplayDataListView [role="columnheader"]:last-child,
            #dualDisplayDataListView [class*="column"]:last-child {
                text-align: right !important;
                justify-content: flex-end !important;
            }

            #dualDisplayDataListView [class*="cell"] {
                text-align: left !important;
                justify-content: flex-start !important;
            }
            #dualDisplayDataListView [class*="cell"]:last-child {
                text-align: right !important;
                justify-content: flex-end !important;
            }


            #dualDisplayDataListView [class*="header"]:nth-child(4),
            #dualDisplayDataListView [role="columnheader"]:nth-child(4),
            #dualDisplayDataListView [class*="column"]:nth-child(4) {
                text-align: right !important;
                justify-content: flex-end !important;
            }

            #dualDisplayDataListView [class*="cell"]:nth-child(4) {
                text-align: right !important;
                justify-content: flex-end !important;
            }


            .total-amount-container {
                flex-shrink: 0;
                background-color: rgba(255, 255, 255, 0.95);
                padding: 12px 16px;
                border-top: 2px solid #eee;
            }
            .totals-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                
            }
            
            .total-label {
                font-size: 14px;
                font-weight: 600;
                color: #555;
                text-align: left;
            }
            .total-value {
                font-size: 14px;
                font-weight: bold;
                color: #111;
                text-align: right;
            }
            .discount-value {
                color: #c0392b;
            }
            .total-amount-main {
                margin-top: 2px;
                padding-top: 5px;
            }
            .total-amount-main .total-label {
                font-size: 20px;
                font-weight: bold;
                color: #000;
            }
            .total-amount-main .total-value {
                font-size: 20px;
                font-weight: bold;
                color: #000;
            }

            .voided-item {
                color: red;
                text-decoration: line-through;
            }

            /* Shukran Loyalty Card */
            .shukran-card {
                margin: 8px 12px;
                border-radius: 10px;
                background: linear-gradient(135deg, #0d2137 0%, #1a3a5c 100%);
                color: #fff;
                padding: 16px 18px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            .shukran-card-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            .shukran-logo {
                font-size: 15px;
                font-weight: bold;
                letter-spacing: 2px;
                color: #f0a500;
            }
            .shukran-tier-badge {
                background: #f0a500;
                color: #0d2137;
                font-size: 11px;
                font-weight: bold;
                padding: 3px 10px;
                border-radius: 20px;
                letter-spacing: 1px;
            }
            .shukran-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 4px 0;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                font-size: 12px;
            }
            .shukran-row:last-child { border-bottom: none; }
            .shukran-label { color: rgba(255,255,255,0.6); font-size: 11px; text-transform: uppercase; }
            .shukran-value { color: #fff; font-weight: 600; }
            .shukran-points-value { color: #f0a500; font-weight: bold; font-size: 14px; }
            

        `;
        element.appendChild(style);


    }


    private toggleLayout(cart: Commerce.Proxy.Entities.Cart): void {
        if (cart == null || cart.CartLines.length == 0) {
            this._widthCart('0%');
            this._widthRotator('100%');
            if (this._mediaContent && this._mediaContent.content.length > 0 && !this._mediaTimer) {
                this.initializeMediaRotation();
            }
        } else {
            this._widthCart(this._widthPercentage + '%');
            this._widthRotator(100 - this._widthPercentage + '%');
            if (this._mediaContent && this._mediaContent.content.length > 0 && !this._mediaTimer) {
                this.initializeMediaRotation();
            }
        }
    }


    private initializeMediaRotation(): void {
        if (this._mediaContent && this._mediaContent.content.length > 0) {
            this.showNextMedia();
        }
    }

    private showNextMedia(): void {
        if (!this._mediaContent || this._mediaContent.content.length === 0) {
            return;
        }

        const currentMedia = this._mediaContent.content[this._currentMediaIndex];
        const mediaUrl = this._mediaContent.rootUrl + currentMedia.name;

        this._currentMediaItem(currentMedia);
        this._currentMediaUrl(mediaUrl);
        this._isCurrentMediaVideo(currentMedia.type === 1);

        // Clear any existing timer
        if (this._mediaTimer) {
            clearTimeout(this._mediaTimer);
        }

        // Set timer for next media based on duration
        this._mediaTimer = setTimeout(() => {
            this._currentMediaIndex = (this._currentMediaIndex + 1) % this._mediaContent.content.length;
            this.showNextMedia();
        }, currentMedia.duration * 1000); // Convert seconds to milliseconds
    }


    protected init(state: Commerce.Extensibility.DualDisplayExtensionTypes.IDualDisplayCustomControlState): void {
        this.fillMediaContent(state.configuration.imageRotatorPath);
        // this.fillRotatorImages(state.configuration.imageRotatorPath);
        this._widthPercentage = state.configuration.receiptWidthPercentage
        this.toggleLayout(state.cart);

        // Check if there are items in the cart
        if (state.cart && state.cart.CartLines && state.cart.CartLines.length > 0) {
            this._cart(state.cart);
            this._cartLinesObservable(state.cart.CartLines);
            this.dataList.data = this._cartLinesObservable();
            this.updateShukranData(state.cart);
        }
        this.toggleLayout(state.cart);

    }

    fillMediaContent(path: string) {
        if (path != undefined && path != null && path != "") {
            try {
                var json = <MediaContent>JSON.parse(path);
                this._mediaContent = json;

                // Start media rotation after loading content
                if (this._mediaContent.content.length > 0) {
                    this._currentMediaIndex = 0;
                    this.initializeMediaRotation();
                }
            } catch (error) {
                this.context.logger.logError("Error parsing media content JSON: " + error, this.context.logger.getNewCorrelationId());
                // Fallback to empty content
                this._mediaContent = {
                    "rootUrl": "",
                    "content": []
                };
            }
        }
    }

    private updateShukranData(cart: ProxyEntities.Cart): void {
        if (ObjectExtensions.isNullOrUndefined(cart) ||
            ObjectExtensions.isNullOrUndefined(cart.ExtensionProperties) ||
            cart.ExtensionProperties.length === 0) {
            this._hasShukranCustomer(false);
            return;
        }

        if (StringExtensions.isNullOrWhitespace(cart.CustomerId)) {
            this._hasShukranCustomer(false);
            return;
        }
        const props = cart.ExtensionProperties;

        const getVal = (key: string): string => {
            const match = props.find(p => p.Key === key);
            return match && match.Value && match.Value.StringValue ? match.Value.StringValue : '';
        };

        const getDecimalVal = (key: string): string => {
            const match = props.find(p => p.Key === key);
            return match && match.Value && match.Value.DecimalValue !== undefined && match.Value.DecimalValue !== null
                ? match.Value.DecimalValue.toString() : '0';
        };

        const firstName = getVal('SHUKRAN_FIRST_NAME');
        const tier = getVal('SHUKRAN_TIER');
        const joinDateRaw = getVal('SHUKRAN_JOIN_DATE');
        const joinDate = joinDateRaw ? new Date(joinDateRaw).toLocaleDateString('en-GB').replace(/\//g, '-') : '';
        const points = getDecimalVal('SHUKRAN_AVAILABLE_PTS');
        const cashValue = getDecimalVal('SHUKRAN_AVAILABLE_PTS_CASHVALUE');

        // Only show the card if first name exists
        if (firstName) {
            this._shukranFirstName(firstName);
            this._shukranTier(tier);
            this._shukranJoinDate(joinDate);
            this._shukranPoints(points || '0');
            this._shukranPointCashValue(cashValue || '0');
            this._hasShukranCustomer(true);
        } else {
            this._hasShukranCustomer(false);
        }
    }

    private scrollDataListToBottom(): void {
        setTimeout(() => {
            //const dataListInner = document.querySelector('#dualDisplayDataListView');
            //if (!dataListInner) return;

            //// Find the actual scrollable element inside the POS DataList
            //const allDivs = Array.from(dataListInner.querySelectorAll('div'));
            //const scrollable = allDivs.find(el => el.scrollHeight > el.clientHeight + 5);

            //if (scrollable) {
            //    scrollable.scrollTop = scrollable.scrollHeight;
            //}
            const viewport = document.querySelector('#dualDisplayDataListView .win-viewport') as HTMLElement;
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }

    //fillRotatorImages(path: string) {
    //    if (path != undefined && path != null && path != "") {
    //        var json = <RotatorImages>JSON.parse(path);

    //        let images: string[] = [];
    //        json.images.forEach((value: string) => {
    //            images.push(json.rootUrl + value);
    //        });

    //        this._images(images);
    //    }
    //}

}
