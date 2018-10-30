using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;

namespace Ordina.Client.MVC.Authorization
{
    public class RequiresLevel : IAuthorizationRequirement
    {
        public string Level { get; }

        public RequiresLevel(string level)
        {
            Level = level;
        }
    }
}
