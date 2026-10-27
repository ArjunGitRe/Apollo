using System;
using System.Collections.Generic;
using System.Text;

namespace TSC.LMG.CommerceRuntime.Helper
{
    public class OTPHelper
    {
        public static string GenerateOTP()
        {
            Random random = new Random();
            int otp = random.Next(1000, 99999); // 4–5 digit
            return otp.ToString();
        }
    }
}
