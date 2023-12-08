// crypto.js
fetch(
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=1&sparkline=false"
)
  .then((response) => response.json())
  .then((data) => {
    const cryptoTypeDropdown = document.getElementById("cryptoType");

    data.forEach((crypto) => {
      const option = document.createElement("option");
      option.value = crypto.id;
      option.text = crypto.name;
      cryptoTypeDropdown.add(option);
    });
  })
  .catch((error) =>
    console.error("Error fetching top cryptocurrencies:", error)
  );
