using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using IdentityServer4;
using IdentityServer4.Models;
using IdentityServer4.Test;

namespace Ordina.Security
{
    public class Configuration
    {
        public static IEnumerable<IdentityResource> IdentityResources = new List<IdentityResource>
        {
            new IdentityServer4.Models.IdentityResources.OpenId(),
            new IdentityServer4.Models.IdentityResources.Profile(),
            new IdentityServer4.Models.IdentityResources.Address()
        };

        public static IEnumerable<ApiResource> ApiResources = new List<ApiResource>
        {
            new ApiResource("demo_api", "Demo API")
        };

        public static IEnumerable<Client> Clients = new List<Client>
        {
            new Client
            {
                ClientId = "mvc",
                ClientName = "MVC Client",
                AllowedGrantTypes = GrantTypes.Hybrid,
                AlwaysIncludeUserClaimsInIdToken = false, //is the default and is done to minimize the payload of the id_token
                ClientSecrets =
                {
                    new Secret("secret".Sha256())
                },
                RedirectUris           = { "https://localhost:44373/signin-oidc" },
                PostLogoutRedirectUris = { "https://localhost:44373/signout-callback-oidc" },
                AllowedScopes =
                {
                    IdentityServerConstants.StandardScopes.OpenId,
                    IdentityServerConstants.StandardScopes.Profile,
                    IdentityServerConstants.StandardScopes.Address,
                    "demo_api"
                },
                AllowOfflineAccess = true
            }
        };

        public static List<TestUser> Users = new List<TestUser>
        {
            new TestUser
            {
                SubjectId = "85441825-C3EC-4314-8102-08EE8699D96A",
                Username = "kevin",
                Password = "pass",
                Claims = new List<Claim>
                {
                    new Claim("given_name", "Kevin"),
                    new Claim("family_name", "Bosteels"),
                    new Claim("address", "Rooien 96, 9280 Wieze, Belgium")
                }
            }
        };
    }
}
