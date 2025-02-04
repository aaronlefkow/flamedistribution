// RESOURCE EFFICIENT SCRIPT

let generatedTable = {}; // Store the dynamically generated table

// Lookup tables for base values
const baseValue1Lookup = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const baseValue2Lookup = [1, 2, 3, 4, 5, 6, 7];

// Get base values efficiently
function getBaseValuesFromLevel(level) {
  let baseValue1 = baseValue1Lookup[Math.min(Math.floor(level / 20), 11)];
  let baseValue2 = baseValue2Lookup[Math.min(Math.floor(level / 40), 6)];
  return { baseValue1, baseValue2 };
}

// Generate the stat table
function generateTable(baseValue1, baseValue2, stats) {
  const table = {
    STR: [],
    DEX: [],
    INT: [],
    LUK: [],
    "STR+DEX": [],
    "STR+INT": [],
    "STR+LUK": [],
    "DEX+INT": [],
    "DEX+LUK": [],
    "INT+LUK": [],
  };

  const statKeys = ["STR", "DEX", "INT", "LUK"];

  // Populate single stats
  statKeys.forEach((stat) => {
    if (stats[stat] > 0) {
      for (let i = 1; i <= 7; i++) {
        let value = baseValue1 * i;
        if (value <= stats[stat]) table[stat].push(value);
      }
    }
  });

  // Populate stat combinations
  const combos = [
    ["STR", "DEX"],
    ["STR", "INT"],
    ["STR", "LUK"],
    ["DEX", "INT"],
    ["DEX", "LUK"],
    ["INT", "LUK"],
  ];

  combos.forEach(([stat1, stat2]) => {
    if (stats[stat1] > 0 && stats[stat2] > 0) {
      for (let i = 1; i <= 7; i++) {
        let value = baseValue2 * i;
        if (value <= stats[stat1] && value <= stats[stat2]) {
          table[`${stat1}+${stat2}`].push(value);
        }
      }
    }
  });

  return table;
}

// Generate and display the table
function generateAndDisplayTable() {
  const equipmentLevel =
    parseInt(document.getElementById("equipmentLevel").value) || 0;
  const { baseValue1, baseValue2 } = getBaseValuesFromLevel(equipmentLevel);

  const stats = {
    STR: parseInt(document.getElementById("str").value) || 0,
    DEX: parseInt(document.getElementById("dex").value) || 0,
    INT: parseInt(document.getElementById("int").value) || 0,
    LUK: parseInt(document.getElementById("luk").value) || 0,
  };

  if (baseValue1 <= 0 || baseValue2 <= 0) {
    alert("Please enter a valid equipment level.");
    return;
  }

  // Display base values
  document.getElementById(
    "baseValue1Display"
  ).textContent = `Base Value 1: ${baseValue1}`;
  document.getElementById(
    "baseValue2Display"
  ).textContent = `Base Value 2: ${baseValue2}`;

  // Generate the table
  generatedTable = generateTable(baseValue1, baseValue2, stats);
  updateTableUI();
}

// Efficiently update the table UI
function updateTableUI() {
  const tableDiv = document.getElementById("generatedTable");
  if (!tableDiv) return;

  let tableHTML = `
    <table border="1">
      <thead>
        <tr>
          <th>Combination</th>
          <th>Values</th>
        </tr>
      </thead>
      <tbody>
  `;

  Object.entries(generatedTable).forEach(([key, values]) => {
    tableHTML += `
      <tr>
        <td>${key}</td>
        <td>${values.length ? values.join(", ") : "-"}</td>
      </tr>
    `;
  });

  tableHTML += `</tbody></table>`;
  tableDiv.innerHTML = tableHTML;
}

// Find the best stat combination
function calculateStats() {
  const stats = {
    STR: parseInt(document.getElementById("str").value) || 0,
    DEX: parseInt(document.getElementById("dex").value) || 0,
    INT: parseInt(document.getElementById("int").value) || 0,
    LUK: parseInt(document.getElementById("luk").value) || 0,
  };

  let bestCombination = [];
  let bestLength = Infinity;
  let memo = {};

  // Function to recursively find the best combination
  function findCombination(
    remainingStats,
    currentCombination,
    usedCombinations
  ) {
    let key = JSON.stringify(remainingStats);
    if (memo[key]) return memo[key];

    // If all stats are covered, check if we have a better (smaller) combination
    if (Object.values(remainingStats).every((val) => val === 0)) {
      if (currentCombination.length < bestLength) {
        bestCombination = [...currentCombination];
        bestLength = currentCombination.length;
      }
      return;
    }

    let validCombinations = [];

    // Try to find combinations that cover the most stats first
    for (const [combination, values] of Object.entries(generatedTable)) {
      let involvedStats = combination.split("+");
      for (let value of values) {
        if (involvedStats.every((stat) => remainingStats[stat] >= value)) {
          // Only use this combination if we haven't already used it
          if (!usedCombinations[combination + value]) {
            validCombinations.push({ combination, value });
          }
        }
      }
    }

    // Sort valid combinations by the number of stats they cover and the size of the values
    validCombinations.sort((a, b) => {
      const aCoverage = a.combination.split("+").length;
      const bCoverage = b.combination.split("+").length;
      const aValue = a.value;
      const bValue = b.value;

      // Prioritize combinations covering more stats, then larger values
      return bCoverage - aCoverage || bValue - aValue;
    });

    // Try each valid combination and recurse
    for (let { combination, value } of validCombinations) {
      let newStats = { ...remainingStats };
      let involvedStats = combination.split("+");
      involvedStats.forEach((stat) => (newStats[stat] -= value));

      // Mark this combination as used
      let newUsedCombinations = { ...usedCombinations };
      newUsedCombinations[combination + value] = true;

      // Determine the tier for this value
      const tier = getTierForValue(combination, value);

      // Recursively find combinations
      findCombination(
        newStats,
        [
          ...currentCombination,
          `<span class="tier-prefix">${tier}</span> ${combination} ${value}`,
        ],
        newUsedCombinations
      );
    }

    memo[key] = bestCombination;
  }

  // Function to determine the tier based on equipment level and value
  function getTierForValue(combination, value) {
    let baseValues = generatedTable[combination];
    let tier = baseValues.indexOf(value) + 1; // Get the index and add 1 for tier

    return `T${tier}`;
  }

  // Start the combination search
  findCombination(stats, [], {});

  // Update the results UI with the best combination
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = bestCombination.length
    ? bestCombination
        .map((result) => `<div class="result-item">${result}</div>`)
        .join("")
    : `<div class="result-item">Remaining stats: ${JSON.stringify(
        stats
      )}</div>`;
}

// Generate table and calculate stats together
function generateAndCalculate() {
  generateAndDisplayTable();
  calculateStats();
}
