import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import { authOptions } from "src/server/auth";
import { SteamProvider } from "src/server/steamProvider";

// interface TokenParams {
//   [key: string]: string | string[] | undefined;
// }

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await NextAuth(req, res, {
    ...authOptions,
    providers: [...authOptions.providers, SteamProvider(req)],
  });
};

export default handler;

// {
//   steamid: '76561198102409602',
//   communityvisibilitystate: 3,
//   profilestate: 1,
//   personaname: 'pyzdecnx',
//   commentpermission: 1,
//   profileurl: 'https://steamcommunity.com/id/skitmos/',
//   avatar: 'https://avatars.akamai.steamstatic.com/25563281bee6333c2d315a26dd6bbd8903beb074.jpg',
//   avatarmedium: 'https://avatars.akamai.steamstatic.com/25563281bee6333c2d315a26dd6bbd8903beb074_medium.jpg',
//   avatarfull: 'https://avatars.akamai.steamstatic.com/25563281bee6333c2d315a26dd6bbd8903beb074_full.jpg',
//   avatarhash: '25563281bee6333c2d315a26dd6bbd8903beb074',
//   lastlogoff: 1679056720,
//   personastate: 0,
//   realname: 'Bumbumchikabaubau',
//   primaryclanid: '103582791469037557',
//   timecreated: 1376222142,
//   personastateflags: 0,
//   loccountrycode: 'FJ'
// }
