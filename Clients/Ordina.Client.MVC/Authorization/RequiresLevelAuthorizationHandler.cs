using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Ordina.Client.MVC.Authorization
{
    public class RequiresLevelAuthorizationHandler : AuthorizationHandler<RequiresLevel>
    {
        public RequiresLevelAuthorizationHandler()
        {
            // You can inject dependencies in the c'tor since we need to register the handler with de DI
            // This can be useful is you need to query external resources like database or API
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, RequiresLevel requirement)
        {
            var filterContext = context.Resource as AuthorizationFilterContext;
            if (filterContext == null)
            {
                context.Fail();
                return Task.CompletedTask;
            }

            //filterContext can be used to fetch data from the request

            var levelClaim = context.User.Claims.FirstOrDefault(x => x.Type == "level");
            if (levelClaim == null || !levelClaim.Value.Equals(requirement.Level, StringComparison.InvariantCultureIgnoreCase))
            {
                context.Fail();
                return Task.CompletedTask;
            }

            context.Succeed(requirement);
            return Task.CompletedTask;
        }
    }
}