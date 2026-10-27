import {
 
    ICustomLinesGridColumnContext,
    CustomLinesGridColumnBase
 
} from "PosApi/Extend/Views/CartView";
 
import { CustomGridColumnAlignment } from "PosApi/Extend/Views/CustomGridColumns";
import { ProxyEntities } from "PosApi/Entities";
 
export default class LinesDiscountGridColumn  extends CustomLinesGridColumnBase {
    //private _selectedTenderLines: ProxyEntities.TenderLine[];
 
    constructor(context: ICustomLinesGridColumnContext) {
        super(context);
    }
 
    public title(): string {
        return "Discount";
    }
 
    public alignment(): CustomGridColumnAlignment {
        return CustomGridColumnAlignment.Right;
    }
 
    public computeValue(cartLine: ProxyEntities.CartLine): string {
        if (!cartLine) {
            return "";
        }

        return cartLine.DiscountAmount.toFixed(2);
    }



 
}