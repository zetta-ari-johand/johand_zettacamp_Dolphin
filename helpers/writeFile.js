const fs = require('fs');

function writeJsonToFile(data, filePath) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData);
    console.log(`Data written to ${filePath}`);
  } catch (error) {
    console.error(`Error writing data to ${filePath}: ${error.message}`);
  }
}

module.exports = writeJsonToFile;
