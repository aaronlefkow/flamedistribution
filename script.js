let generatedTable = {}; // Store the dynamically generated table

// Generate the table based on base values
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

  // Generate values for each stat (STR, DEX, INT, LUK) using baseValue1
  ["STR", "DEX", "INT", "LUK"].forEach((stat) => {
    if (stats[stat] > 0) {
      for (let i = 0; i < 7; i++) {
        const value = baseValue1 * (i + 1);
        if (value <= stats[stat]) {
          table[stat].push(value); // Only include valid values
        }
      }
    }
  });

  // Generate values for stat combinations (STR+DEX, etc.) using baseValue2
  ["STR+DEX", "STR+INT", "STR+LUK", "DEX+INT", "DEX+LUK", "INT+LUK"].forEach(
    (combination) => {
      const involvedStats = combination.split("+");
      if (stats[involvedStats[0]] > 0 && stats[involvedStats[1]] > 0) {
        for (let i = 0; i < 7; i++) {
          const value = baseValue2 * (i + 1);
          if (
            value <= stats[involvedStats[0]] &&
            value <= stats[involvedStats[1]]
          ) {
            table[combination].push(value); // Only include valid values
          }
        }
      }
    }
  );

  console.log("Generated Table: ", table); // Log the generated table for debugging
  return table;
}

// Function to generate and display the table on the page
function generateAndDisplayTable() {
  const baseValue1 = parseInt(document.getElementById("baseValue1").value) || 0;
  const baseValue2 = parseInt(document.getElementById("baseValue2").value) || 0;

  const stats = {
    STR: parseInt(document.getElementById("str").value) || 0,
    DEX: parseInt(document.getElementById("dex").value) || 0,
    INT: parseInt(document.getElementById("int").value) || 0,
    LUK: parseInt(document.getElementById("luk").value) || 0,
  };

  if (baseValue1 <= 0 || baseValue2 <= 0) {
    alert("Please enter valid base values.");
    return;
  }

  // Generate the table using the entered base values and stats
  generatedTable = generateTable(baseValue1, baseValue2, stats);

  const tableDiv = document.getElementById("generatedTable");
  tableDiv.innerHTML = ""; // Clear previous table

  // Create table HTML
  let tableHTML = `<table><thead><tr><th>Combination</th><th>Values</th></tr></thead><tbody>`;

  Object.keys(generatedTable).forEach((combination) => {
    tableHTML += `<tr><td>${combination}</td><td>${generatedTable[
      combination
    ].join(", ")}</td></tr>`;
  });

  tableHTML += `</tbody></table>`;
  tableDiv.innerHTML = tableHTML;
}

// Function to calculate the stats based on the rules provided
function calculateStats() {
  const stats = {
    STR: parseInt(document.getElementById("str").value) || 0,
    DEX: parseInt(document.getElementById("dex").value) || 0,
    INT: parseInt(document.getElementById("int").value) || 0,
    LUK: parseInt(document.getElementById("luk").value) || 0,
  };

  const usedRows = new Set();
  let bestCombination = [];
  let bestCombinationLength = Infinity;
  let remainingStats = { ...stats };

  function findCombination(table, stats, currentCombination) {
    if (Object.values(stats).every((stat) => stat === 0)) {
      if (currentCombination.length < bestCombinationLength) {
        bestCombination = [...currentCombination];
        bestCombinationLength = currentCombination.length;
      }
      return;
    }

    for (const combination in table) {
      if (usedRows.has(combination)) continue;
      const sortedValues = [...table[combination]].sort((a, b) => b - a); // Sort values in descending order
      for (const value of sortedValues) {
        const involvedStats = combination.split("+");
        if (involvedStats.every((stat) => stats[stat] >= value)) {
          involvedStats.forEach((stat) => {
            stats[stat] -= value;
          });
          usedRows.add(combination);
          currentCombination.push(`${combination} ${value}`);

          findCombination(table, stats, currentCombination);

          involvedStats.forEach((stat) => {
            stats[stat] += value;
          });
          usedRows.delete(combination);
          currentCombination.pop();
        }
      }
    }
  }

  findCombination(generatedTable, remainingStats, []);

  // Display results
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // Clear previous results
  bestCombination.forEach((result) => {
    const div = document.createElement("div");
    div.className = "result-item";
    div.textContent = result;
    resultsDiv.appendChild(div);
  });

  // Display remaining stats if any
  if (bestCombination.length === 0) {
    const remainingDiv = document.createElement("div");
    remainingDiv.className = "result-item";
    remainingDiv.textContent = `Remaining stats: ${JSON.stringify(
      remainingStats
    )}`;
    resultsDiv.appendChild(remainingDiv);
  }
}

// Function to generate the table and calculate stats
function generateAndCalculate() {
  generateAndDisplayTable();
  calculateStats();
}
