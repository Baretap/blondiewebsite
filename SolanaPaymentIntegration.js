document.getElementById('paymentMethod').addEventListener('change', function() {
    var solanaAmountDiv = document.getElementById('solanaAmount');
    var fiatWalletAddressDiv = document.getElementById('fiatWalletAddress');
    
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

document.getElementById('presaleForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var paymentMethod = document.getElementById('paymentMethod').value;
    var walletAddress = document.getElementById('walletAddress').value;
    
    if (paymentMethod === 'solana') {
        var solAmount = document.getElementById('solAmount').value;
        if (solAmount >= 0.1 && solAmount <= 2) {
            // Laske BLD-tokenien määrä
            const bldPriceInUsd = 0.00042; // Hinta per BLD token USD:ssa
            const solToUsdRate = 0.05; // Staattinen konversio SOL -> USD, pitäisi olla dynaaminen
            const solAmountInUsd = solAmount * solToUsdRate; // Muunna SOL USD:ksi
            const bldTokens = Math.floor(solAmountInUsd / bldPriceInUsd); // Laske BLD tokenien määrä
            
            document.getElementById('bldAmount').innerText = `You will receive approximately ${bldTokens} BLD tokens.`;
            
            // Siirry maksuosioon
            if (confirm(`You are about to proceed with a payment of ${solAmount} SOL for ${bldTokens} BLD tokens. Confirm?`)) {
                window.location.href = `solana_payment.html?amount=${solAmount}&tokens=${bldTokens}`;
            }
        } else {
            alert('Please enter an amount between 0.1 and 2 SOL.');
        }
    } else if (paymentMethod === 'fiat') {
        if (walletAddress) {
            // Lisää wallet-osoite URL-parametrina
            window.location.href = `https://buy.stripe.com/dR6g1k93z19I06Y4gg?walletAddress=${encodeURIComponent(walletAddress)}`;
        } else {
            alert('Please enter your Solana wallet address.');
        }
    } else {
        alert('Please select a payment method.');
    }
});

    // Tarkista, onko käyttäjä palannut maksun jälkeen
    window.addEventListener('load', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('paymentStatus');
        const walletAddress = urlParams.get('walletAddress');
        
        if (paymentStatus === 'success' && walletAddress) {
            // Näytä ilmoitus onnistuneesta ostoksesta
            showPaymentSuccess(walletAddress);
        }
    });
});

// Funktion toteutus ostoksen onnistumisilmoitusta varten
function showPaymentSuccess(walletAddress) {
    const successMessage = document.createElement('div');
    successMessage.style.cssText = 'background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; margin: 20px auto; border-radius: 5px; max-width: 600px; text-align: center;';
    successMessage.innerHTML = `<h2>Payment Successful!</h2><p>Your payment has been processed successfully. BLD tokens will be sent to your Solana wallet address: <strong>${walletAddress}</strong>.</p>`;
    
    document.getElementById('content').insertBefore(successMessage, document.getElementById('content').firstChild);
}
