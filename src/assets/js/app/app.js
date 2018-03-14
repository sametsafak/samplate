// appjs
console.log('app.js');
setInterval(() => {
  this.age++;
  console.log('Hey! I am arrow function!');
}, 1000);

function asd() {
  console.log('Hey! I am normal function!');
}
