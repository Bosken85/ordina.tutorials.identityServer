import { AuthorizationServiceConfiguration, LocalStorageBackend, StorageBackend } from "@openid/appauth";
import { AngularRequestor, XhrSettings } from "./angularRequestor";

export interface IUserInfo {
    given_name: string;
    family_name: string;
    role: string;
    unit: string;
}

export class UserInfoRequestHandler {

    constructor(
        // use the provided storage backend
        // or initialize local storage with the default storage backend which
        // uses window.localStorage
        public storageBackend: StorageBackend = new LocalStorageBackend())
    {}

    public async performRequest(configuration: AuthorizationServiceConfiguration, requestor: AngularRequestor, accessToken: string): Promise<IUserInfo> {

        var xhrSettings = {
            url: configuration.userInfoEndpoint,
            dataType: "json",
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        } as XhrSettings

        let userInfo: IUserInfo;

        try {        
            userInfo = await requestor.xhr<IUserInfo>(xhrSettings)
            this.storageBackend.setItem("UserInfo", JSON.stringify(userInfo));
        } catch (error) {
            console.log("Could not fetch xhr request", error);
        }
        return userInfo;
    }
}
