using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace TSC.LMG.Runtime.Model.Language
{
    public enum Language
    {
        [EnumMember (Value = "English")]
        EN_US,

        [EnumMember (Value = "Arabic")]
        AR_SA
    }
}
