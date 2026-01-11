export interface VoltaMatch {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  isLive: boolean;
  streamUrl?: string;
  startTime: string;
  serverTime: string;
  odds: {
    home: number;
    away: number;
  };
  bettingStats: {
    homeAmount: number;
    awayAmount: number;
    homeCount: number;
    awayCount: number;
  };
  liveBets: VoltaBet[];
  result?: {
    home: number;
    away: number;
  };
  resultSignature?: string;
  md5Hash?: string;
}

export interface VoltaBet {
  matchId: number;
  amount: number;
  side: 'Home' | 'Away';
  username: string;
  currency: string;
}

export interface VoltaLeague {
  id: number;
  name: string;
  matches: VoltaMatch[];
}

export interface VoltaWebSocketMessage {
  t: string;
  d: string;
}

export function parseVoltaData(data: string): VoltaLeague | null {
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    const league = parsed[0];
    const matches: VoltaMatch[] = [];

    if (league["2"] && Array.isArray(league["2"])) {
      for (const m of league["2"]) {
        // Parse odds from field 7.16
        let homeOdds = 1.98;
        let awayOdds = 1.98;
        if (m["7"]?.["16"]?.[0]) {
          const oddsStr = m["7"]["16"][0];
          const oddsMatch = oddsStr.match(/(\d+\.?\d*)\*\d+h\s+(\d+\.?\d*)\*\d+a/);
          if (oddsMatch) {
            homeOdds = parseFloat(oddsMatch[1]);
            awayOdds = parseFloat(oddsMatch[2]);
          }
        }

        // Parse result from field 30 if exists
        let result: { home: number; away: number } | undefined;
        if (m["30"]) {
          const resultMatch = m["30"].match(/\{(\d+),(\d+)\}/);
          if (resultMatch) {
            result = {
              home: parseInt(resultMatch[1]),
              away: parseInt(resultMatch[2]),
            };
          }
        }

        // Parse live bets from field 31
        const liveBets: VoltaBet[] = [];
        if (m["31"] && Array.isArray(m["31"])) {
          for (const bet of m["31"]) {
            liveBets.push({
              matchId: bet["1"],
              amount: bet["2"],
              side: bet["3"],
              username: bet["4"],
              currency: bet["5"],
            });
          }
        }

        matches.push({
          matchId: m["8"],
          homeTeam: m["2"],
          awayTeam: m["3"],
          homeLogo: m["19"],
          awayLogo: m["20"],
          isLive: m["1"] === true,
          streamUrl: m["22"],
          startTime: m["0"],
          serverTime: m["28"] || m["0"],
          odds: { home: homeOdds, away: awayOdds },
          bettingStats: {
            homeAmount: m["24"]?.["0"] || 0,
            awayAmount: m["24"]?.["1"] || 0,
            homeCount: m["24"]?.["2"] || 0,
            awayCount: m["24"]?.["3"] || 0,
          },
          liveBets,
          result,
          resultSignature: m["30"],
          md5Hash: m["29"],
        });
      }
    }

    return {
      id: league["0"],
      name: league["1"],
      matches,
    };
  } catch (e) {
    console.error("Failed to parse Volta data:", e);
    return null;
  }
}
