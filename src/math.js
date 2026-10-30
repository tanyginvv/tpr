/* The same model powers every calculation on the page. */
globalThis.PurchaseMath = (() => {
  const prices = Object.freeze({ buy: 50, sell: 60, salvage: 30 });
  const demand = Object.freeze([1, 2, 3, 4]);
  const counts = Object.freeze([15, 30, 30, 25]);
  const probabilities = Object.freeze(counts.map(n => n / 100));
  const profit = (q, d) => prices.sell * Math.min(q, d) + prices.salvage * Math.max(q - d, 0) - prices.buy * q;
  const expected = (q, ps = probabilities) => demand.reduce((sum, d, i) => sum + profit(q, d) * ps[i], 0);
  const worst = q => Math.min(...demand.map(d => profit(q, d)));
  const hodgesLehmann = (nu, ps = probabilities) => {
    if (!Number.isFinite(nu) || nu < 0 || nu > 1) throw new RangeError('nu must be between 0 and 1');
    const scores = demand.map(q => nu * expected(q, ps) + (1 - nu) * worst(q));
    const maximum = Math.max(...scores);
    return { nu, scores, maximum, best: demand.filter((_, i) => Math.abs(scores[i] - maximum) < 1e-9) };
  };
  // In this model a seller who knows D before purchasing chooses q = D.
  const regret = (q, d) => profit(d, d) - profit(q, d);
  const expectedRegret = (q, ps = probabilities) => demand.reduce((sum, d, i) => sum + regret(q, d) * ps[i], 0);
  const perfectInformation = (ps = probabilities) => demand.reduce((sum, d, i) => sum + profit(d, d) * ps[i], 0);
  return Object.freeze({ prices, demand, counts, probabilities, profit, expected, worst, hodgesLehmann, regret, expectedRegret, perfectInformation });
})();
