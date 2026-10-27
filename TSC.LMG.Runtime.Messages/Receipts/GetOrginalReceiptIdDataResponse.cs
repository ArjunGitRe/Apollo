using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Receipts;

namespace TSC.LMG.Runtime.Messages.Receipts
{
    public class GetOrginalReceiptIdDataResponse:Response
    {
        public GetOrginalReceiptIdDataResponse(OrginalTransModel orginalTransModel)
        {
            OrginalTransModels=orginalTransModel;
        }
        public OrginalTransModel OrginalTransModels { get;set;}
    }
}
