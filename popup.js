// Global variable for street safety score
let safetyScore2 = null;

// Query the active tab to check the URL using Manifest V2 APIs
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var tab = tabs[0];
  if (
    tab &&
    (tab.url.indexOf("zillow.com/homedetails") !== -1 ||
      tab.url.indexOf("zillow.com/apartments") !== -1)
  ) {
    // In Manifest V2, use chrome.tabs.executeScript.
    // Since we cannot use an async function directly, we convert our function to a synchronous version.
    chrome.tabs.executeScript(
      tab.id,
      {
        code: `
          ${parseAddress.toString()}
          (${extractH1Text.toString()})();
        `,
      },
      function (results) {
        if (chrome.runtime.lastError) {
          document.getElementById("result").innerText =
            "Error: " + chrome.runtime.lastError.message;
        } else if (results && results[0]) {
          const address = results[0];
          if (address) {
            // Get the ZIP code and look up its safety score
            const zipCode = address.zipCode.slice(0, 5); // Get just the 5-digit ZIP

            // Fetch ZIP code safety score
            fetch(chrome.runtime.getURL("zipcode_data.json"))
              .then((r) => r.json())
              .then((zipData) => {
                // Process ZIP code safety score
                const zipEntry = zipData.find(
                  (entry) => entry.zipcode === zipCode
                );
                const safetyScore1 = zipEntry ? zipEntry.SafetyScore : 50;

                console.log("ZIP Code:", zipCode);
                console.log("ZIP Safety Score:", safetyScore1.toFixed(2));

                // Update the display
                document.getElementById("result").innerHTML = `
                  <div class="address-container">
                    <div class="info-row">
                      <span class="label">Location</span>
                      <span class="value">${address.blockNumber} ${
                  address.streetName
                }</span>
                    </div>
                    <div class="info-row">
                      <span class="label">City</span>
                      <span class="value">${address.city}</span>
                    </div>
                    <div class="info-row">
                      <span class="label">ZIP Code</span>
                      <span class="value">${address.zipCode}</span>
                    </div>
                    <div class="safety-score">
                      <div class="info-row">
                        <span class="label">Neighbourhood Safety</span>
                        <span class="value">${safetyScore1.toFixed(
                          2
                        )}/100</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Street Safety</span>
                        <span class="value">Loading...</span>
                      </div>
                    </div>
                  </div>`;
                console.log("address:", address);
                // Update gauge
                // new
                const csvUrl = chrome.runtime.getURL("Street_Data.csv");

                fetch(csvUrl)
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error(
                        `Network response was not ok: ${response.statusText}`
                      );
                    }
                    return response.text();
                  })
                  .then((csvText) => {
                    // Parse the CSV text with PapaParse
                    const results = Papa.parse(csvText, {
                      header: true, // Assumes the first row is a header row
                      skipEmptyLines: true,
                      complete: function (results) {
                        console.log("Parsed CSV Data:", results.data);
                        // You can now work with the parsed data
                        function getFirstTwoWords(str) {
                          // Split the string by whitespace (one or more spaces)
                          const words = str.split(/\s+/);

                          // Get the first two words, if available, and join them with a space
                          return words.slice(0, 2).join(" ");
                        }
                        function getFirstNumber(input) {
                          // Check if the string contains a hyphen
                          if (input.includes("-")) {
                            // Split the string by '-' and get the first element
                            const parts = input.split("-");
                            // Trim any whitespace and return the first number as a string (or parse it to a number)
                            return parts[0].trim();
                          }
                          // If there is no hyphen, return the input as is or handle it as needed
                          return input;
                        }
                        const zipCodeInput2 = zipCode;
                        const blockInput2 = address.blockNumber;
                        const streetInput2 = address.streetName;
                        console.log("zipCodeInput2:", zipCodeInput2);
                        console.log(
                          "blockInput2:",
                          getFirstNumber(blockInput2)
                        );
                        console.log(
                          "streetInput2:",
                          getFirstTwoWords(streetInput2)
                        );
                        const zipCodeInput = zipCodeInput2;
                        const blockInput = getFirstNumber(blockInput2);
                        const streetInput = getFirstTwoWords(streetInput2);
                        const matchingRow = results.data.find((row) => {
                          return (
                            row.ZipCode.trim() === zipCodeInput.trim() &&
                            row.block.trim() === blockInput.trim() &&
                            row.street.trim().toUpperCase() ===
                              streetInput.trim().toUpperCase()
                          );
                        });
                        console.log("Matching Row:", matchingRow);
                        console.log("Matching score:", matchingRow.SafetyScore);
                        safetyScore2 = parseFloat(matchingRow.SafetyScore);
                        // Update the display with the new safety score
                        document.getElementById("result").innerHTML = `
                          <div class="address-container">
                            <div class="info-row">
                              <span class="label">Location</span>
                              <span class="value">${address.blockNumber} ${
                          address.streetName
                        }</span>
                            </div>
                            <div class="info-row">
                              <span class="label">City</span>
                              <span class="value">${address.city}</span>
                            </div>
                            <div class="info-row">
                              <span class="label">ZIP Code</span>
                              <span class="value">${address.zipCode}</span>
                            </div>
                            <div class="safety-score">
                              <div class="info-row">
                                <span class="label">Neighbourhood Safety</span>
                                <span class="value">${safetyScore1.toFixed(
                                  2
                                )}/100</span>
                              </div>
                              <div class="info-row">
                                <span class="label">Street Safety</span>
                                <span class="value">${safetyScore2.toFixed(
                                  2
                                )}/100</span>
                              </div>
                            </div>
                          </div>`;
                        createGauge("gauge2", safetyScore2);
                      },
                      error: function (err) {
                        console.error("Error parsing CSV:", err);
                      },
                    });
                  })
                  .catch((error) =>
                    console.error("Error fetching CSV file:", error)
                  );
                createGauge("gauge1", safetyScore1);
              })
              .catch((error) => {
                console.error("Error loading safety score data:", error);
                document.getElementById("result").innerText =
                  "Error loading safety score data.";
              });
          } else {
            document.getElementById("result").innerText =
              "Could not parse address components.";
          }
        } else {
          document.getElementById("result").innerText =
            "H1 element not found or no content available.";
        }
      }
    );
  } else {
    document.getElementById("result").innerText =
      "This extension works only on Zillow home details pages.";
  }
});

// Synchronous version of the extract function using busy waiting (not ideal for production).
function extractH1Text() {
  // Updated selectors to be more general and catch different Zillow page variations
  var selectors = [
    "h1", // Any h1
    "h2", // Any h2
    "[class*='address']", // Any element with 'address' in its class
    "[class*='Address']", // Any element with 'Address' in its class
    "[data-testid*='address']", // Any element with 'address' in its test id
    "[data-testid*='Address']", // Any element with 'Address' in its test id
  ];

  var startTime = Date.now();
  var result = null;

  while (Date.now() - startTime < 3000) {
    // Try each selector until we find a match
    for (var selector of selectors) {
      var element = document.querySelector(selector);
      if (element) {
        var text = element.innerText || element.textContent;
        console.log("Found text:", text); // Debug log
        if (text) {
          result = parseAddress(text);
          console.log("Parsed result:", result); // Debug log
          if (result) return result;
        }
      }
    }

    // Busy wait for approximately 100ms
    var now = Date.now();
    while (Date.now() - now < 100) {}
  }
  return result;
}

// Function to parse address into components
function parseAddress(address) {
  // Regular expression to match address components
  const addressRegex =
    /^(\d+)\s+([^,]+),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/;
  const match = address.match(addressRegex);

  if (match) {
    // Round block number down to nearest hundred
    const originalBlockNum = parseInt(match[1]);
    const roundedBlockNum = Math.floor(originalBlockNum / 100) * 100;
    // Create block range (e.g., "0-100" for 0, "100-200" for 100)
    const blockRange = `${roundedBlockNum}-${roundedBlockNum + 100}`;

    return {
      blockNumber: blockRange,
      streetName: match[2].trim(),
      city: match[3].trim(),
      state: match[4],
      zipCode: match[5],
    };
  }
  return null;
}

// ----------------------------
// Semi-circular Gauge using D3.js
// ----------------------------
function createGauge(containerId, value = 75) {
  // Clear previous gauge if any
  d3.select("#" + containerId).html("");

  // Increased dimensions
  const width = 300; // Increased from 250
  const height = 170; // Increased from 140
  const radius = Math.min(width, height) / 2.2;

  // Create SVG with new dimensions
  const svg = d3
    .select("#" + containerId)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height - 30})`);

  // Define the gradient
  const defs = svg.append("defs");

  // Create gauge scale
  const scale = d3.scaleLinear().domain([0, 100]).range([-90, 90]);

  // Create arc generator
  const arc = d3
    .arc()
    .innerRadius(radius - 30)
    .outerRadius(radius)
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2);

  // Define sections
  const sections = [
    { name: "Very Poor", color: "#FF4444", start: 0, end: 20 },
    { name: "Poor", color: "#FFA500", start: 20, end: 40 },
    { name: "Fair", color: "#FFEB3B", start: 40, end: 60 },
    { name: "Good", color: "#4CAF50", start: 60, end: 80 },
    { name: "Excellent", color: "#1B5E20", start: 80, end: 100 },
  ];

  // Draw sections
  sections.forEach((section) => {
    const arcSection = d3
      .arc()
      .innerRadius(radius - 30)
      .outerRadius(radius)
      .startAngle((scale(section.start) * Math.PI) / 180)
      .endAngle((scale(section.end) * Math.PI) / 180);

    svg.append("path").attr("d", arcSection).style("fill", section.color);

    // Add labels with improved positioning
    const angle = scale((section.start + section.end) / 2);
    const labelRadius = radius + 30;
    const labelAngle = (angle * Math.PI) / 180;
    const labelX = labelRadius * Math.cos(labelAngle - Math.PI / 2);
    const labelY = labelRadius * Math.sin(labelAngle - Math.PI / 2);

    svg
      .append("text")
      .attr("x", labelX)
      .attr("y", labelY)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#ffffff")
      .text(section.name);
  });

  // Draw the needle
  const needleLength = radius - 20;
  const needleRadius = 5;
  const needleAngle = (scale(value) * Math.PI) / 180;

  const needle = svg.append("g").attr("transform", `rotate(${scale(value)})`);

  needle
    .append("path")
    .attr(
      "d",
      `M ${-needleRadius} 0 L 0 ${-needleLength} L ${needleRadius} 0 Z`
    )
    .style("fill", "#000");

  needle
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", needleRadius)
    .style("fill", "#000");
}
