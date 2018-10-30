using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using IdentityModel.Client;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Ordina.Client.MVC.Authorization;

namespace Ordina.Client.MVC
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.TryAddScoped<IDemoApiHttpClient, DemoApiHttpClient>();
            services.AddScoped<IAuthorizationHandler, RequiresLevelAuthorizationHandler>();

            services.AddAuthorization(options =>
            {
                options.AddPolicy("CanReadValues", x =>
                {
                    x.RequireAuthenticatedUser();
                    x.RequireClaim("unit", "NCore");
                    x.RequireClaim("role", "Employee");
                    x.AddRequirements(new RequiresLevel("Senior"));
                });
            });

            var cookieName = "Cookies";
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = cookieName;
                options.DefaultChallengeScheme = "oidc";

            }).AddCookie(cookieName, options =>
                {
                    options.Events = new CookieAuthenticationEvents
                    {
                        OnValidatePrincipal = async context => await RefreshTokens(context)
                    };
                })
              .AddOpenIdConnect("oidc", options =>
               {
                   options.SignInScheme = cookieName;
                   options.Authority = "https://localhost:44385/";
                   options.ClientId = "mvc";
                   options.ClientSecret = "secret";
                   options.ResponseType = "code id_token";

                   //Required to get tokens from HttpContext
                   options.SaveTokens = true;

                   //Required to fetch additional claims because we kept the initial id_token as small as possible
                   options.GetClaimsFromUserInfoEndpoint = true;

                   #region Manage Scopes

                   options.Scope.Add("openid");
                   options.Scope.Add("profile");
                   options.Scope.Add("address");
                   options.Scope.Add("roles");
                   options.Scope.Add("ordina");
                   options.Scope.Add("demo_api");
                   options.Scope.Add("offline_access");

                   #endregion

                   #region Manage claims

                   options.ClaimActions.DeleteClaim("sid");
                   options.ClaimActions.DeleteClaim("idp");

                   //Add additional claims when fetching from userinfo endpoint
                   options.ClaimActions.MapUniqueJsonKey("role", "role");
                   options.ClaimActions.MapUniqueJsonKey("unit", "unit");
                   options.ClaimActions.MapUniqueJsonKey("function", "function");
                   options.ClaimActions.MapUniqueJsonKey("level", "level");
                   options.ClaimActions.MapUniqueJsonKey("years_service", "years_service");

                   #endregion
               });



        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();
            app.UseAuthentication();
            app.UseMvcWithDefaultRoute();
        }

        private async Task RefreshTokens(CookieValidatePrincipalContext context)
        {
            // since our cookie lifetime is based on the access token one,
            // check if we're more than halfway of the cookie lifetime
            var now = DateTimeOffset.UtcNow;
            var timeElapsed = now.Subtract(context.Properties.IssuedUtc.Value);
            var timeRemaining = context.Properties.ExpiresUtc.Value.Subtract(now);

            if (timeElapsed > timeRemaining)
            {
                var refreshToken = context.Properties.GetTokenValue(OpenIdConnectParameterNames.RefreshToken);
                var discoveryClient = new DiscoveryClient("https://localhost:44385/");
                var metaDataReponse = await discoveryClient.GetAsync();

                var tokenClient = new TokenClient(metaDataReponse.TokenEndpoint, "mvc", "secret");
                var tokenResult = await tokenClient.RequestRefreshTokenAsync(refreshToken);
                if (!tokenResult.IsError)
                {
                    var updateTokens = new List<AuthenticationToken>
                        {
                            new AuthenticationToken
                            {
                                Name = OpenIdConnectParameterNames.IdToken,
                                Value = tokenResult.IdentityToken
                            },
                            new AuthenticationToken
                            {
                                Name = OpenIdConnectParameterNames.AccessToken,
                                Value = tokenResult.AccessToken
                            },
                            new AuthenticationToken
                            {
                                Name = OpenIdConnectParameterNames.RefreshToken,
                                Value = tokenResult.RefreshToken
                            }
                        };

                    context.Properties.StoreTokens(updateTokens);
                    context.ShouldRenew = true;
                }
            }
        }
    }
}
