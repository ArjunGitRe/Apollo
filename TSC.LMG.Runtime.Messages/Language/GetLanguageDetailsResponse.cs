using Microsoft.Dynamics.Commerce.Runtime.Messages;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using TSC.LMG.Runtime.Model.Language;

namespace TSC.LMG.Runtime.Messages.Language
{
    public class GetLanguageDetailsResponse:Response
    {
        public GetLanguageDetailsResponse ( Collection<LanguageOption> languageOptions )
        {
            LanguageOptions = languageOptions;
        }
        public Collection<LanguageOption> LanguageOptions { get; set; }
    }
}
