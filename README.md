# KirjatKiertoon.fi

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# start the API-server
npm run server
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## User role numbers

0 - Nothing, not used
1 - School account, allows to look for books, and buy by entering own name+email
2 - Account made by entering information on school-account.
5 - Seller account, made by admins in admin console.
10 - Admin account - limited to users and books
15 - Primary admin account - to make deals and send payments for school
42 - SUPER-ADMIN - Can do anything, can also answer to the Ultimate Question of Life, The Universe, and Everything

## Status of book

0 - Available to buy
1 - Bought, not brought to school yet
2 - Book at school
3 - Sold, book at buyer

## Action types
The object of the action in parentheses

1  - User bought a book (book)
10 - Seller's book has been sold (book)
