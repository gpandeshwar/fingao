import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TICKER_HOLDINGS_TABLE = process.env.TICKER_HOLDINGS_TABLE || "";

interface GetTickerHoldingsEvent {
  arguments?: { ticker: string };
  ticker?: string;
}

interface UnderlyingHolding {
  ticker: string;
  weight: number;
  name: string;
}

interface GetTickerHoldingsResult {
  ticker: string;
  holdings: UnderlyingHolding[];
  lastUpdated: string | null;
  found: boolean;
  dividendYield: number | null;
}

export const handler = async (
  event: GetTickerHoldingsEvent
): Promise<GetTickerHoldingsResult> => {
  const ticker = (event.arguments?.ticker || event.ticker || "").toUpperCase();

  if (!ticker) {
    return { ticker: "", holdings: [], lastUpdated: null, found: false, dividendYield: null };
  }

  if (!TICKER_HOLDINGS_TABLE) {
    console.error("TICKER_HOLDINGS_TABLE not set");
    return { ticker, holdings: [], lastUpdated: null, found: false, dividendYield: null };
  }

  try {
    const result = await ddbClient.send(
      new GetCommand({
        TableName: TICKER_HOLDINGS_TABLE,
        Key: { ticker },
      })
    );

    if (!result.Item) {
      return { ticker, holdings: [], lastUpdated: null, found: false, dividendYield: null };
    }

    // Extract dividend yield from the item
    const dividendYield = parseFloat(
      result.Item.dividend_yield ?? result.Item.dividendYield ?? result.Item.yield ?? "0"
    ) || null;

    // Parse holdings — the agent stores them in various formats
    // Try to extract a holdings array from the item
    let holdings: UnderlyingHolding[] = [];

    const rawHoldings = result.Item.holdings;
    let holdingsArray: any[] = [];

    if (Array.isArray(rawHoldings)) {
      holdingsArray = rawHoldings;
    } else if (typeof rawHoldings === "string") {
      try {
        const parsed = JSON.parse(rawHoldings);
        if (Array.isArray(parsed)) {
          holdingsArray = parsed;
        }
      } catch {
        // Not parseable
      }
    }

    if (holdingsArray.length > 0) {
      console.log(`Ticker ${ticker}: found ${holdingsArray.length} underlying holdings`);
      console.log(`Sample item keys:`, Object.keys(holdingsArray[0]));

      holdings = holdingsArray.map((h: any) => {
        const tickerVal = (h.ticker || h.symbol || h.Ticker || h.Symbol || "").toUpperCase();

        // Try multiple field names for weight
        let weight =
          h.weight_pct ?? h.weight ?? h.percentage ?? h.allocation ?? h.Weight ??
          h.Percentage ?? h.Allocation ?? h.pct ?? h.weightPercent ??
          h.percent ?? h.portfolioWeight ?? 0;

        // Convert to number
        weight = typeof weight === "string" ? parseFloat(weight) : Number(weight);

        // weight_pct is already in percentage form (e.g., 7.5 = 7.5%, 0.75 = 0.75%)
        // Do NOT convert decimals to percentages

        const name = h.name || h.company || h.Name || h.Company || h.description || "";

        return { ticker: tickerVal, weight, name };
      }).filter((h: UnderlyingHolding) => h.ticker && h.weight > 0);

      console.log(`Ticker ${ticker}: parsed ${holdings.length} valid holdings with weights`);
    }

    return {
      ticker,
      holdings,
      lastUpdated: result.Item.lastUpdated || null,
      found: true,
      dividendYield,
    };
  } catch (err: any) {
    console.error(`Error fetching ticker ${ticker}:`, err);
    return { ticker, holdings: [], lastUpdated: null, found: false, dividendYield: null };
  }
};
