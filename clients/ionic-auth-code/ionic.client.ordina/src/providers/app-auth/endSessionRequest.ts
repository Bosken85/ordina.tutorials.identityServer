import { DefaultCrypto } from "@openid/appauth";

export interface EndSessionRequestJson {
    idTokenHint: string;
    postLogoutRedirectURI: string;
    state?: string;
}

const BYTES_LENGTH = 10;
const newState = function(crypto: DefaultCrypto): string {
  return crypto.generateRandom(BYTES_LENGTH);
};

export class EndSessionRequest {

    state: string;

    constructor(
        public idTokenHint: string,
        public postLogoutRedirectURI: string,
        state?: string,
        crypto: DefaultCrypto = new DefaultCrypto()) {
        this.state = state || newState(crypto);
    }

    toJson(): EndSessionRequestJson {
        let json: EndSessionRequestJson = { idTokenHint: this.idTokenHint, postLogoutRedirectURI: this.postLogoutRedirectURI };

        if (this.state) {
            json['state'] = this.state;
        }

        return json;
    }

    static fromJson(input: EndSessionRequestJson): EndSessionRequest {
        return new EndSessionRequest(
            input.idTokenHint, input.postLogoutRedirectURI, input.state);
    }
}
