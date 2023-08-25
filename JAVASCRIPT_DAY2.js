try {
  const firstBook = 'The Lord of The Ring';
  const secondBook = 'The Hobbit';

  if (typeof firstBook !== 'string' || typeof secondBook !== 'string') {
    throw new Error('Both firstBook and secondBook must be strings');
  }

  const sameBookName = firstBook.toLowerCase() === secondBook.toLowerCase();
  console.log(sameBookName, 'COMPARE NAME');

  // TASK 2
  const firstBookPrice = 250000;
  const secondBookPrice = 750000;

  const dataBook = {
    namaBuku: firstBook,
    harga: firstBookPrice,
  };
  console.log(dataBook);

  // 2.B average price from those 2 variables using arithmetic operator
  const averageBooksPrice = (firstBookPrice + secondBookPrice) / 2;
  // 2.A Compare the variables which one have the highest price
  if (firstBookPrice > secondBookPrice) {
    console.log(
      `${firstBook} has higher price with IDR ${
        firstBookPrice - secondBookPrice
      } difference. \nThe average of both books price is IDR ${averageBooksPrice}`
    );
  } else if (secondBookPrice > firstBookPrice) {
    console.log(
      `${secondBook} has higher price with IDR ${
        secondBookPrice - firstBookPrice
      } difference. \nThe average of both books price is IDR ${averageBooksPrice}`
    );
  } else {
    console.log(`Both books have the same price with average price is IDR ${averageBooksPrice}`);
  }

  // 2.C if the average price > 500000 set value “Expensive” if less or equal set “Cheap”
  let maxAveragePrice = 500000;
  const cheapOrExpensive = averageBooksPrice <= maxAveragePrice ? 'Cheap' : 'Expensive';
  console.log(cheapOrExpensive);
} catch (error) {
  console.error('Error:', error.message);
}

// ADDITIONAL
// ADD NEW KEY TO ORDINARY OBJECT
let book = {
  name: 'eragon',
  page: 175,
};
book.price = 299000;
console.log(book, 'ADD NEW KEY TO AN OBJECT');

// ADD NEW KEY / OBJECT TO ARRAY OBJECT
let arrBook = [
  {
    name: 'Eragon',
    page: 175,
  },
];
arrBook[0].price = 299000; // ADD NEW KEY
// ADD NEW OBJECT USING PUSH
arrBook.push({
  name: 'Fire and Ice',
  page: 200,
  price: 250000,
});

console.log(arrBook, 'PUSH NEW OBJECT TO ARRAY OBJECT');

// COMPARE KEY NAME OBJECT AND ARRAY OBJECT
const sameName = book.name !== arrBook[0].name ? 'Not the same title' : 'Same Book Title';
console.log(sameName);

// ODD EVEN
const oddEven = (number) => {
  const oddResult = [];
  const evenResult = [];
  for (let i = 0; i <= number; i++) {
    if (i % 2 === 0 || i === 0) {
      evenResult.push(i);
      console.log(`${i} is even`);
    } else {
      oddResult.push(i);
      console.log(`${i} is odd`);
    }
  }
  return { evenResult, oddResult };
};
console.log(oddEven(10));
