const COURSES = {
  'ÄI': 9,
  'EN': 8,
  'RU': 7,
  'SA': 10,
  'RA': 10,
  'MAY': 1,
  'MAA': 12,
  'MAB': 7,
  'BI': 5,
  'GE': 4,
  'FY': 7,
  'KE': 5,
  'HI': 6,
  'YH': 4,
  'PS': 5,
  'TT': 3,
  'FI': 4,
  'UE': 6,
  'UO': 6,
  'ET': 6,
  'OP': 2,
  'LI': 5,
  'MU': 4,
  'KU': 4
}

const GET_ROLE_NAME = function (id) {
  if (id < 1) return 'Tuntematon'
  if (id < 2) return 'Yleinen ostotili'
  if (id < 5) return 'Ostaja'
  if (id < 10) return 'Myyjä'
  if (id < 15) return 'Järjestäjä'
  if (id < 42) return 'Pääjärjestäjä'
  return 'SuperAdmin'
}

const APP_FEE = 100
const OPERATION_FEE = 100
const TOTAL_FEE = APP_FEE + OPERATION_FEE

module.exports = {
  COURSES,
  GET_ROLE_NAME,
  APP_FEE,
  OPERATION_FEE,
  TOTAL_FEE,
  'VAT': {
    'book': 0.10
  }
}
