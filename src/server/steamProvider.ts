/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { NextApiRequest } from "next";
import type { Provider } from "next-auth/providers";
import { TokenSet } from "openid-client";
import { env } from "src/env.mjs";
import { v4 as uuid } from "uuid";

interface TokenParams {
  [key: string]: string | string[] | undefined;
}

export const SteamProvider = (req: NextApiRequest): Provider => ({
  id: "steam",
  name: "Steam",
  type: "oauth",
  authorization: {
    url: "https://steamcommunity.com/openid/login",
    params: {
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": `${env.NEXTAUTH_URL}/api/auth/callback/steam`,
      "openid.realm": env.NEXTAUTH_URL,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    },
  },
  token: {
    async request() {
      const token_params: TokenParams = {
        "openid.assoc_handle": req.query["openid.assoc_handle"],
        "openid.signed": req.query["openid.signed"],
        "openid.sig": req.query["openid.sig"],
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.mode": "check_authentication",
      };
      //@ts-ignore
      for (const val of req.query["openid.signed"].split(",")) {
        //@ts-ignore
        token_params[`openid.${val}`] = req.query[`openid.${val}`];
      }
      const token_url = new URL("https://steamcommunity.com/openid/login");
      //@ts-ignore
      const token_url_params = new URLSearchParams(token_params);
      //@ts-ignore
      token_url.search = token_url_params;
      const token_res = await fetch(token_url, {
        method: "POST",
        headers: {
          "Accept-language": "en",
          "Content-type": "application/x-www-form-urlencoded",
          "Content-Length": `${token_url_params.toString().length}`,
        },
        body: token_url_params.toString(),
      });
      const result = await token_res.text();
      if (result.match(/is_valid\s*:\s*true/i)) {
        // @ts-ignore
        const matches = req.query["openid.claimed_id"].match(
          /^https:\/\/steamcommunity.com\/openid\/id\/([0-9]{17,25})/
        );
        const steamid = matches[1].match(/^-?\d+$/) ? matches[1] : 0;
        const tokenset = new TokenSet({
          id_token: steamid,
          access_token: uuid(),
          steamid: steamid,
        });
        return { tokens: tokenset };
      } else {
        console.log("here");
        return { tokens: new TokenSet({}) };
      }
    },
  },
  userinfo: {
    async request(ctx) {
      const user_result = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${ctx.provider.clientSecret}&steamids=${ctx.tokens.steamid}`
      );
      const json = await user_result.json();
      return json.response.players[0];
    },
  },
  idToken: false,
  checks: ["none"],
  profile(profile: any) {
    return {
      id: profile.steamid,
      image: profile.avatarfull,
      name: profile.personaname,
    };
  },
  clientId: "empty",
  clientSecret: env.STEAM_API_KEY,
});
