// dynamic values are the data that the value or type can change anytime theres a re-declaration

let firstBook; // undefined value with let variable so the value can change later
firstBook = 'A Series of Unfortunate Events';
const secondBook = 'The Lord of The Ring';
const thirdBook = 'Harpot';

let book = {
  name: 'harry potter',
  page: 175,
};

let arrBook = [
  {
    name: 'star war',
    page: 292,
  },
  {
    name: 'twilight 2',
    page: 155,
  },
];

let concatNew = arrBook.push(book);

console.log(concatNew, 'NEW CONCAT');

console.log(firstBook, '-1st console log firstbook');

// update first book with the least favorite
firstBook = 'Twilight';
// secondBook = 'Divergent';

const allBook = firstBook.concat(secondBook, thirdBook);

console.log(firstBook, '-2nd firstbook');
console.log(secondBook, '-secondbook');
console.log(allBook, 'concat');

// ADDITIONAL

let nickName = 'Johand'; // string
const age = 17; // number.
let isLiketoRead = true; // boolean
console.log(typeof age);

const summary = `${nickName} is ${age} y.o and its ${isLiketoRead} that he like to read. Some of the book he read are ${firstBook} & ${secondBook}`;
console.log(summary);
