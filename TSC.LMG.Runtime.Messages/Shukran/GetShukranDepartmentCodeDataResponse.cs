using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Text;
using TSC.LMG.Runtime.Model.Shukran.Data;

namespace TSC.LMG.Runtime.Messages.Shukran
{
    public class GetShukranDepartmentCodeDataResponse:Response
    {
        public GetShukranDepartmentCodeDataResponse(List<DepartmentCodeEntity> departmentCodes)
        {
            DepartmentCodes = departmentCodes;
        }
        public List<DepartmentCodeEntity> DepartmentCodes { get; private set; }
    }
}
