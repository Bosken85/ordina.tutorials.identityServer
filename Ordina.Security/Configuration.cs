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
            new IdentityServer4.Models.IdentityResources.Address(),
            new IdentityResource("roles", "Your roles", new List<string> { "role" }),
            new IdentityResource("ordina", "Your Ordina information", new List<string>
            {
                "unit",
                "function",
                "level",
                "years_service",
            })
        };

        public static IEnumerable<ApiResource> ApiResources = new List<ApiResource>
        {
            new ApiResource("demo_api", "Demo API")
            {
                UserClaims =
                {
                    "given_name",
                    "family_name",
                    "role"
                }
            },
            new ApiResource("private_api", "Private API")
            {
                UserClaims =
                {
                    "given_name",
                    "family_name",
                    "role"
                }
            }
        };

        public static IEnumerable<Client> Clients = new List<Client>
        {
            new Client
            {
                ClientId = "mvc",
                ClientName = "MVC Client",

                AllowedGrantTypes = GrantTypes.Hybrid,
                // This is the default and is done to minimize the payload of the id_token
                AlwaysIncludeUserClaimsInIdToken = false, 
                // this is set to true because we pass identity claims in the access token
                UpdateAccessTokenClaimsOnRefresh = true,

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
                    IdentityServerConstants.StandardScopes.Email,
                    "roles",
                    "ordina",
                    "demo_api"
                },
                AllowOfflineAccess = true
            },
            // SPA client using implicit flow
            new Client
            {
                ClientId = "spa",
                ClientName = "SPA Client",

                AllowedGrantTypes = GrantTypes.Implicit,
                AllowAccessTokensViaBrowser = true,
                RequireConsent = false, // Needs to be false to enable silent refreshes
                AccessTokenLifetime = 30,

                RedirectUris =
                {
                    "https://localhost:44323/index.html",
                    "https://localhost:44323/silent-refresh.html"
                },

                PostLogoutRedirectUris = { "https://localhost:44323/index.html" },
                AllowedCorsOrigins = { "https://localhost:44323" },

                AllowedScopes =
                {
                    IdentityServerConstants.StandardScopes.OpenId,
                    IdentityServerConstants.StandardScopes.Profile,
                    IdentityServerConstants.StandardScopes.Address,
                    IdentityServerConstants.StandardScopes.Email,
                    "roles",
                    "ordina",
                    "demo_api"
                }
            },
            // Add the api that will delegate calls to the private api
            new Client
            {
                ClientId = "demo_api.client",
                ClientSecrets = new List<Secret>
                {
                    new Secret("secret".Sha256())
                },
                AllowedGrantTypes = { "delegation" },
                AllowedScopes = new List<string>
                {
                    "private_api"
                }
            },
            new Client()
            {
                ClientId = "ionic-auth-code",
                ClientName = "Ionic Auth Code Client",
                AllowedGrantTypes = GrantTypes.Hybrid,
                AlwaysIncludeUserClaimsInIdToken = false, //is the default and is done to minimize the payload of the id_token
                ClientSecrets =
                {
                    new Secret("secret".Sha256())
                },
                RedirectUris           = { "ordinaionic://profile" },
                PostLogoutRedirectUris = {  "ordinaionic://home" },
                AllowedScopes =
                {
                    IdentityServerConstants.StandardScopes.OpenId,
                    IdentityServerConstants.StandardScopes.Profile,
                    IdentityServerConstants.StandardScopes.Address,
                    IdentityServerConstants.StandardScopes.Email,
                    "roles",
                    "ordina",
                    "demo_api"
                },
                AllowOfflineAccess = true,
                RequireConsent = false,
                RequirePkce = true,
                RequireClientSecret = false,
                AccessTokenLifetime = 30,
                // Only needed for development. When running the app in production it's source is file:// so no cors is needed then.
                AllowedCorsOrigins =  { "http://localhost:8101", "http://localhost:8080", "http://localhost:8100",  "http://192.168.0.243:8100" }
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
                    new Claim("email", "kevin.bosteels@ordina.com"),
                    new Claim("address", "Red Street 16, 1000 Brussels, Belgium"),
                    new Claim("role", "Employee"),
                    new Claim("unit", "NCore"),
                    new Claim("function", "Developer"),
                    new Claim("level", "Senior"),
                    new Claim("years_service", "3")
                }
            },
            new TestUser
            {
                SubjectId = "85441825-C3EC-4314-8102-08EE8699D96B",
                Username = "guest",
                Password = "pass",
                Claims = new List<Claim>
                {
                    new Claim("given_name", "Guest"),
                    new Claim("family_name", "Anonymous"),
                    new Claim("email", "guest.anonymous@gmail.com"),
                    new Claim("address", "Green Street 18, 1000 Brussels, Belgium"),
                    new Claim("role", "Guest")
                }
            }
        };
    }
}
