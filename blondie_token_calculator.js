// BLD-tokenin hinta euroissa
const bldPriceInEur = 0.00042; // 1 BLD = 0.00042 €

// Funktion laskemaan BLD-tokenien määrä
const calculateBldTokens = async (solAmount) => {
  try {
    // Hae SOL:n hinta USD:ssa
    const solResponse = await fetch('https://api.diadata.org/v1/assetQuotation/Solana/0x0000000000000000000000000000000000000000');
    const solData = await solResponse.json();
    const solPriceInUsd = solData.Price;

    // Hae EUR:n hinta USD:ssa
    const eurResponse = await fetch('https://api.diadata.org/v1/assetQuotation/Fiat/978');
    const eurData = await eurResponse.json();
    const eurPriceInUsd = eurData.Price;

    // Laske SOL:n hinta euroissa
    const solPriceInEur = solPriceInUsd / eurPriceInUsd;

    // Muunna SOL euroiksi
    const solAmountInEur = solAmount * solPriceInEur;

    // Laske, kuinka monta BLD-tokenia saadaan
    const bldTokens = Math.floor(solAmountInEur / bldPriceInEur);

    return bldTokens;
  } catch (error) {
    console.error('Error fetching price data:', error);
    return 0; // Palauta 0 tai jokin muu oletusarvo virheen sattuessa
  }
};

// Käyttäjän syöttämä SOL määrä lomakkeesta
const solAmount = parseFloat(document.getElementById('solAmount').value);

if (solAmount >= 0.1 && solAmount <= 2) {
  calculateBldTokens(solAmount).then((bldTokens) => {
    if (bldTokens > 0) {
      document.getElementById('bldAmount').innerText = `You will receive approximately ${bldTokens} BLD tokens.`;
    } else {
      document.getElementById('bldAmount').innerText = 'Error fetching price data. Please try again.';
    }
  });
} else {
  alert('Please enter an amount between 0.1 and 2 SOL.');
}c
