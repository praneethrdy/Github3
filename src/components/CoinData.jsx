import React, { useEffect, useContext, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import debounce from 'lodash.debounce';  // Import debounce
import { AppContext } from './Context';
import Loading from './Loading';
import '../styles/coindata.css';
import Chart from './Chart';
import { Box, Button, HStack, Stat, StatArrow } from '@chakra-ui/react';

const CoinData = () => {
  const param = useParams();
  const [coinData, setCoinData] = useState({});
  const [days, setDays] = useState('24h');
  const [load, setLoad] = useState(true);
  const [chartArray, setChartArray] = useState([]);
  const { opt, currSymbol } = useContext(AppContext);

  const btns = ['24h', '7d', '14d', '30d', '60d', '200d', '1y', 'max'];

  const url = `https://api.coingecko.com/api/v3/coins/${param.id}`;
  const coinurl = `https://api.coingecko.com/api/v3/coins/${param.id}/market_chart?vs_currency=${opt}&days=${days}`;

  // Debounced Fetch Function
  const fetchData = useCallback(
    debounce(async () => {
      try {
        setLoad(true);
        const data = await fetch(url);
        const jsonData = await data.json();
        setCoinData(jsonData);

        const singledata = await fetch(coinurl);
        const singlejsonData = await singledata.json();
        setChartArray(singlejsonData.prices);

        setLoad(false);
      } catch (error) {
        setLoad(false);
        console.error("Error fetching data:", error);
      }
    }, 2000), // 2 seconds debounce
    [param.id, days] 
  );

  useEffect(() => {
    fetchData(); // Call the debounced function
    return fetchData.cancel; // Cleanup debounce on unmount
  }, [fetchData]);

  const switchChartStats = key => {
    setDays(key);
    setLoad(true);
  };

  return (
    <>
      {load ? (
        <Loading />
      ) : (
        <section className="coin-data">
          <div className="coin-data-cont">
            <div className="top-cont">
              <div className="left">
                <h2>
                  {coinData.name} ({coinData.symbol})
                </h2>
                <p className="rank">Rank #{coinData.market_cap_rank}</p>
                <p className="price">
                  {currSymbol}
                  {coinData.market_data.current_price[opt]}
                </p>
                <Stat mb={3}>
                  <StatArrow
                    type={
                      coinData.market_data.price_change_percentage_24h > 0
                        ? 'increase'
                        : 'decrease'
                    }
                  />
                  {coinData.market_data.price_change_percentage_24h}
                </Stat>
              </div>
              <div className="right">
                <img src={coinData.image?.large} alt="coin" />
              </div>
            </div>
            <br />
            <br />
            <a href={coinData.links?.homepage[0]}>Official Site🔗</a>
            <div className="flex-cont">
              <p>
                <strong>Market Cap</strong>
                {currSymbol}
                {coinData.market_data.market_cap[opt]}
              </p>
              <p>
                <strong>Total volume</strong>
                {coinData.market_data.total_volume[opt]}
              </p>
              <p>
                <strong>24hrs high</strong>
                {currSymbol}
                {coinData.market_data.high_24h[opt]}
              </p>
              <p>
                <strong>24hrs low</strong>
                {currSymbol}
                {coinData.market_data.low_24h[opt]}
              </p>
              <p>
                <strong>Total Supply</strong>
                {coinData.market_data.total_supply}
              </p>
              <p>
                <strong>Circulating Supply</strong>
                {coinData.market_data.circulating_supply}
              </p>
            </div>
            <p className="lastupdate">
              Last Updated On {new Date(coinData.market_data.last_updated).toLocaleString()}
            </p>
          </div>
          <div className="chart-cont">
            <Box width={'full'} borderWidth={1}>
              <Chart arr={chartArray} currency={currSymbol} days={days} />
            </Box>

            <HStack p="4" overflowX={'auto'}>
              {btns.map(i => (
                <Button
                  disabled={days === i}
                  key={i}
                  onClick={() => switchChartStats(i)}
                >
                  {i}
                </Button>
              ))}
            </HStack>
          </div>
        </section>
      )}
    </>
  );
};

export default CoinData;
