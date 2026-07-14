// Converts a number of rupees into Indian-style formatted text and spelled-out words,
// so a candidate can visually verify they haven't added or dropped a zero — the same
// pattern used by Indian banking transfer screens ("Rupees Twenty Five Lakh Only").

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function twoDigits(n) {
  if (n < 20) return ONES[n]
  const tens = Math.floor(n / 10)
  const ones = n % 10
  return TENS[tens] + (ones ? ' ' + ONES[ones] : '')
}

function threeDigits(n) {
  const hundred = Math.floor(n / 100)
  const rest = n % 100
  return (hundred ? ONES[hundred] + ' Hundred' + (rest ? ' ' : '') : '') + (rest ? twoDigits(rest) : '')
}

// n is a non-negative integer number of rupees
export function numberToIndianWords(n) {
  n = Math.round(n)
  if (n === 0) return 'Zero'
  const crore = Math.floor(n / 10000000); n %= 10000000
  const lakh = Math.floor(n / 100000); n %= 100000
  const thousand = Math.floor(n / 1000); n %= 1000
  const hundred = n
  const parts = []
  if (crore) parts.push(threeDigits(crore) + ' Crore')
  if (lakh) parts.push(twoDigits(lakh) + ' Lakh')
  if (thousand) parts.push(twoDigits(thousand) + ' Thousand')
  if (hundred) parts.push(threeDigits(hundred))
  return parts.join(' ')
}

// Formats an integer with Indian comma grouping: 2500000 -> 25,00,000
export function formatIndianNumber(n) {
  n = Math.round(n)
  const str = Math.abs(n).toString()
  if (str.length <= 3) return (n < 0 ? '-' : '') + str
  const last3 = str.slice(-3)
  const rest = str.slice(0, -3)
  const restFormatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')
  return (n < 0 ? '-' : '') + restFormatted + ',' + last3
}

// The one function the CTC inputs actually use: given a value typed into a field meant
// to hold lakhs (e.g. "25" for ₹25L), returns a display string showing the real rupee
// amount in both Indian-grouped digits and full words, or null if there's nothing to show yet.
export function lakhsToWordsDisplay(lakhsValue) {
  const num = parseFloat(lakhsValue)
  if (!num || num <= 0) return null
  const rupees = num * 100000
  const words = numberToIndianWords(rupees)
  if (words.includes('undefined')) return `= ₹${formatIndianNumber(rupees)}`
  return `= ₹${formatIndianNumber(rupees)} (${words} Rupees)`
}
