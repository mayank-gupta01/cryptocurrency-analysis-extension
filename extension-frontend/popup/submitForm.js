const handleSubmit = async () => {
  document
    .getElementById("cryptoForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      // Get the form data
      const cryptoName = document.getElementById("cryptoType").value;
      const startDate = document.getElementById("startDate").value;
      console.log(cryptoName, startDate);
      try {
        const response = await fetch("http://127.0.0.1:3000/submit-form", {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Add this header to specify JSON content
          },
          body: JSON.stringify({
            // Convert the data to JSON format
            cryptoName: cryptoName,
            startDate: startDate,
          }),
        });

        if (response.ok) {
          console.log(
            "<---------------------response generated--------------------->"
          );
          const jsonData = await response.json();

          // Create a Blob with the JSON data
          const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
            type: "application/json",
          });

          // Create a link element
          const link = document.createElement("a");

          // Set the href attribute to a data URL representing the Blob
          link.href = URL.createObjectURL(blob);

          // Set the download attribute with the desired file name
          link.download = "weekly_data.json";

          // Append the link to the document
          document.body.appendChild(link);

          // Trigger a click event on the link to initiate the download
          link.click();

          // Remove the link from the document
          document.body.removeChild(link);
        } else {
          console.log("response not coming");
        }
      } catch (err) {
        console.log(err);
      }
    });
};

// Call the function
handleSubmit();
