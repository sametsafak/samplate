// import helper from './helper';

// console.log('bundle worked');
// console.log('helper:', helper);

/* We're super 😸  excited that you're trying to use ES2017+ syntax, but instead of making more yearly presets 😭 , Babel now has a better preset that we r
ecommend you use instead: npm install babel-preset-env --save-dev. preset-env without options will compile ES2015+ down to ES5 just like using all the presets together and thus is more future proof. It also allows you to target specific browsers so that Babel can do less work and you can ship native ES2015+ to user 😎 ! We are also in the process of releasing v7, so please give http://babeljs.io/b
log/2017/09/12/planning-for-7.0 a read and help test it out in beta! Thanks so much for using Babel 🙏, please give us a follow on Twitter @babeljs for news on Babel, join slack.babeljs.io for discuss
ion / development and help support the project at opencollective.com / babel
*/

import { square, diag, pi } from './helper';

console.log(square(11)); // 121
console.log(diag(4, 3)); // 5
console.log(pi);
