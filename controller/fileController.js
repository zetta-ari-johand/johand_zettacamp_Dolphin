const fs = require('fs');
module.exports = {
  writeFile: async (req, res) => {
    const { data } = req.body;
    // const dataToWrite = 'This is some data to write to the file.';

    // Specify the file path and the data to write
    const filePath = 'difference.txt';

    // Write data to a file
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        return res.status(400).json({
          status: false,
          message: 'failed to write a love letter',
        });
      } else {
        return res.status(200).json({
          status: true,
          message: 'success write the love letter',
        });
      }
    });
  },

  readFile: async (req, res) => {
    // Specify the file path to read from
    const filePath = 'difference.txt';

    // Read data from a file
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        return res.status(400).json({
          status: false,
          message: 'cant get file',
        });
      } else {
        return res.status(200).json({
          status: true,
          message: 'succes get file',
          data: data,
        });
      }
    });
  },
};
