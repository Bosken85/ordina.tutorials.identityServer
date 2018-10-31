using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IdentityServer4.Models;
using IdentityServer4.Validation;

namespace Ordina.Security.Extensions
{
    public class DelegationGrantValidator : IExtensionGrantValidator
    {
        private readonly ITokenValidator _validator;

        public DelegationGrantValidator(ITokenValidator validator)
        {
            _validator = validator;
        }

        public string GrantType => "delegation";

        public async Task ValidateAsync(ExtensionGrantValidationContext context)
        {
            var userToken = context.Request.Raw.Get("token");

            if (string.IsNullOrEmpty(userToken))
            {
                context.Result = new GrantValidationResult(TokenRequestErrors.InvalidGrant);
                return;
            }

            var result = await _validator.ValidateAccessTokenAsync(userToken);
            if (result.IsError)
            {
                context.Result = new GrantValidationResult(TokenRequestErrors.InvalidGrant);
                return;
            }

            // get user's identity
            var sub = result.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault();
            if (sub == null)
            {
                context.Result = new GrantValidationResult(TokenRequestErrors.InvalidGrant);
                return;
            }

            /*
             * When using delegation for calling from client to client
             * The claims can differ so we need to set the ClientId to the
             * ClientId of the Client we want to access. This can be achieved
             * by adding the following line of code:
             * context.Request.Client.ClientId = "private_api";
             */

            context.Result = new GrantValidationResult(sub, GrantType);
            return;
        }
    }
}
