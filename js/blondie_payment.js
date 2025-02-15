// Tämä osa käsittelee Solana Wallet -integraation Phantom Walletin kanssa

// Funktion hakemaan Solana Wallet -provider, joka on Phantom Wallet
const getProvider = () => {
  if ('solana' in window) {
    const provider = window.solana;
    if (provider.isPhantom) {
      return provider;
    }
  }
  // Jos Phantom Walletia ei ole asennettu, ohjaa käyttäjä asennussivulle
  window.open('https://phantom.app/', '_blank');
};

// Funktion yhdistämään käyttäjän wallet
const connectWallet = async () => {
  const provider = getProvider();
  try {
    // Yritä yhdistää wallet
    await provider.connect();
    console.log('Wallet connected:', provider.publicKey.toString());
  } catch (err) {
    // Jos yhdistäminen epäonnistuu, tulosta virhe konsoliin
    console.error('Failed to connect wallet:', err);
  }
};

// Tässä alkaa blondie_token_calculator.js:n sisältö

// Määritellään BLD-tokenin hinta euroissa
const bldPriceInEur = 0.00042; // 1 BLD = 0.00042 €

// Funktion laskemaan, kuinka monta BLD-tokenia käyttäjä saa SOL-määrästä
const calculateBldTokens = async (solAmount) => {
  try {
    // Hae SOL:n hinta USD:ssa DIA Data:n API:sta
    const solResponse = await fetch('https://api.diadata.org/v1/assetQuotation/Solana/0x0000000000000000000000000000000000000000');
    const solData = await solResponse.json();
    const solPriceInUsd = solData.Price;

    // Hae EUR:n hinta USD:ssa DIA Data:n API:sta
    const eurResponse = await fetch('https://api.diadata.org/v1/assetQuotation/Fiat/978');
    const eurData = await eurResponse.json();
    const eurPriceInUsd = eurData.Price;

    // Laske SOL:n hinta euroissa jakamalla SOL:n USD hinta EUR:n USD hinnalla
    const solPriceInEur = solPriceInUsd / eurPriceInUsd;

    // Muunna SOL euroiksi
    const solAmountInEur = solAmount * solPriceInEur;

    // Laske, kuinka monta BLD-tokenia saadaan jakamalla SOL:n euroarvo yhden BLD-tokenin hinnalla
    const bldTokens = Math.floor(solAmountInEur / bldPriceInEur);

    return bldTokens;
  } catch (error) {
    // Jos tapahtuu virhe datan hakemisessa, tulosta se konsoliin ja palauta 0
    console.error('Error fetching price data:', error);
    return 0; // Palauta 0 tai jokin muu oletusarvo virheen sattuessa
  }
};

// Kuuntele muutoksia maksutavan valintakentässä
document.getElementById('paymentMethod').addEventListener('change', function() {
  var solanaAmountDiv = document.getElementById('solanaAmount');
  var fiatWalletAddressDiv = document.getElementById('fiatWalletAddress');
  
  // Näytä tai piilota SOL-määrän syöttökenttä ja wallet-osoitteen kenttä riippuen valitusta maksutavasta
  if (this.value === 'solana') {
    solanaAmountDiv.style.display = 'block';
    fiatWalletAddressDiv.style.display = 'none';
  } else if (this.value === 'fiat') {
    solanaAmountDiv.style.display = 'none';
    fiatWalletAddressDiv.style.display = 'block';
  } else {
    solanaAmountDiv.style.display = 'none';
    fiatWalletAddressDiv.style.display = 'none';
  }
});

// Kuuntele lomakkeen lähetystä
document.getElementById('presaleForm').addEventListener('submit', function(event) {
  event.preventDefault();
  var paymentMethod = document.getElementById('paymentMethod').value;
  var walletAddress = document.getElementById('walletAddress').value;
  
  if (paymentMethod === 'solana') {
        var solAmount = parseFloat(document.getElementById('solAmount').value);
    // Tarkista, että syötetty SOL-määrä on sallitulla alueella (0.1 - 2 SOL)
    if (solAmount >= 0.1 && solAmount <= 2) {
      // Laske BLD-tokenien määrä annetusta SOL-määrästä
      calculateBldTokens(solAmount).then((bldTokens) => {
        if (bldTokens > 0) {
          // Näytä käyttäjälle, kuinka monta BLD-tokenia hän saa
          document.getElementById('bldAmount').innerText = `You will receive approximately ${bldTokens} BLD tokens.`;
          // Pyydä käyttäjältä vahvistus maksusta
          if (confirm(`You are about to proceed with a payment of ${solAmount} SOL for ${bldTokens} BLD tokens. Confirm?`)) {
            // Jos käyttäjä vahvistaa, ohjaa hänet Solana-maksusivulle
            window.location.href = `solana_payment.html?amount=${solAmount}&tokens=${bldTokens}`;
          }
        } else {
          // Jos laskenta epäonnistui, näytä virheilmoitus
          document.getElementById('bldAmount').innerText = 'Error fetching price data. Please try again.';
        }
      });
    } else {
      // Jos syötetty SOL-määrä on väärä, näytä ilmoitus
      alert('Please enter an amount between 0.1 and 2 SOL.');
    }
  } else if (paymentMethod === 'fiat') {
    // Tarkista, että käyttäjä on syöttänyt Solana wallet -osoitteen
    if (walletAddress) {
      // Lähetä käyttäjä Stripelle maksamaan fiat-valuutalla ja lisää wallet-osoite URL-parametrina
      window.location.href = `https://buy.stripe.com/dR6g1k93z19I06Y4gg?walletAddress=${encodeURIComponent(walletAddress)}`;
    } else {
      // Jos wallet-osoitetta ei ole syötetty, näytä ilmoitus
      alert('Please enter your Solana wallet address.');
    }
  } else {
    // Jos maksutapaa ei ole valittu, näytä ilmoitus
    alert('Please select a payment method.');
  }
});
