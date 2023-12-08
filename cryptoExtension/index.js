require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const moment = require("moment");
const puppeteer = require("puppeteer");

const app = express();

//MIDDLEWARES
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Delay function
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function for scraping market capital
const getMarketCapSummary = async (cryptoName, startDate) => {
  // start the timer
  const startTime = new Date().getTime();
  console.log(startTime);
  // Launch the puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

  // On this new page
  const URL = process.env.BASE_URL + cryptoName + process.env.HISTORY_URL;
  await page.goto(URL, {
    waitUntil: "domcontentloaded",
  });

  // LOGIC
  try {
    // find button of date
    const buttons = await page.$(".history > div > div > button");
    // click the button
    if (buttons) {
      await buttons.click();
    } else {
      return;
    }

    // find list and get data from it
    const liTags = await page.$$(
      ".tippy-content > div > div > div > div > ul > li",
      (liElements) => {
        // Convert NodeList to an array and return
        return Array.from(liElements).map((li) => li.outerHTML);
      }
    );

    // click the last 365 days button
    if (liTags.length > 0) {
      console.log(liTags[4]);
      await liTags[4].evaluate((li) => li.click());
    }

    // find button of continue
    const continueButton = await page.$(
      ".tippy-content > div > div > div > span > button"
    );
    if (continueButton) {
      // click on continue button
      await continueButton.click();
    }

    // give some delay so that data can load...
    await delay(1500);

    // find all data for one year
    const wholeYearData = await page.evaluate(() => {
      const trNodeList = document.querySelectorAll(
        ".history > div > table > tbody > tr"
      );
      const dataList = Array.from(trNodeList).map((trElement) => {
        const tdNodeList = trElement.querySelectorAll("td");
        const date = tdNodeList[0] ? tdNodeList[0].innerText : "N/A";
        const marketCap = tdNodeList[6] ? tdNodeList[6].innerText : "N/A";
        return { date, marketCap };
      });
      return dataList;
    });
    console.log(wholeYearData);

    // store data in a map
    const capMap = new Map();
    wholeYearData.forEach((data) => {
      capMap.set(data.date, data.marketCap);
    });
    console.log("This is working Mayank ------->", capMap.get("Oct 10, 2023"));

    // then start a loop and search data for weeks specified
    let tempDate = startDate;
    const [day, month, year] = tempDate.split("-").map(Number);
    tempDate = new Date(year, month - 1, day);

    // array for storing the data of marketcap and date
    let weeklyDataOfMarket = [];

    // start a loop for 7 days
    for (let i = 1; i <= 7; i++) {
      const parsedDate = moment(tempDate);
      // Format the date as "MMM DD, YYYY"
      const formattedDate = parsedDate.format("MMM DD, YYYY");
      console.log(formattedDate);

      if (capMap.has(formattedDate)) {
        weeklyDataOfMarket.push({
          date: formattedDate,
          market_cap: capMap.get(formattedDate),
        });
      } else {
        weeklyDataOfMarket.push({
          date: formattedDate,
          market_cap: "NA",
        });
      }

      // add 1 day in date
      tempDate = parsedDate.add(1, "day");
    }

    //end the timer
    const endTime = new Date().getTime();
    // difference of time in ms
    const diffTime = endTime - startTime;

    // add the difference of time in array in second
    weeklyDataOfMarket.push({
      timeTakenInSec: diffTime / 1000,
    });
    console.log(weeklyDataOfMarket);

    // convert it to a json file
    const jsonString = JSON.stringify(weeklyDataOfMarket, null, 2);
    // write in the output.json file
    fs.writeFileSync("output.json", jsonString, "utf-8");
    console.log(
      "Mayank, output.json file generated successfully -------------->"
    );
  } catch (error) {
    console.log(error);
  } finally {
    // close the browser
    await browser.close();
  }
};

//APIs
app.post("/submit-form", async (req, res) => {
  const cryptoName = req.body.cryptoName;
  let startDate = req.body.startDate;
  console.log("Received form submission");
  console.log("Crypto Type:", cryptoName);
  console.log("Start Date:", startDate);

  let tempDate = startDate;
  let [year, month, day] = tempDate.split("-").map(Number);
  startDate = new Date(year, month - 1, day);
  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  startDate = `${day}-${month}-${year}`;
  // generate file output.json
  await getMarketCapSummary(cryptoName, startDate);

  // Send the generated JSON file as a response
  res.sendFile(path.join(__dirname, "output.json"));
});

// Listen the server
app.listen(process.env.PORT, () => {
  console.log("Server is runnning........", process.env.PORT);
});
