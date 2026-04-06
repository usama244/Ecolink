const fs = require('fs');
const path = require('path');

// Fix producer Dashboard.jsx - revenue stat
const dashPath = path.join(__dirname, 'client/src/pages/producer/Dashboard.jsx');
let dash = fs.readFileSync(dashPath, 'utf8');
dash = dash.replace(
  "value: `${(stats.totalRevenue || 186000).toLocaleString()}`",
  "value: `\u20B9${((stats.totalRevenue||15400000)/100000).toFixed(1)}L`"
);
// Fix impact bar
dash = dash.replace(
  "`${stats.totalRevenue || 186000}`",
  "`\u20B9${((stats.totalRevenue||15400000)/100000).toFixed(1)}L`"
);
fs.writeFileSync(dashPath, dash);
console.log('Dashboard fixed');

// Fix Analytics.jsx - revenue stat and chart data
const analyticsPath = path.join(__dirname, 'client/src/pages/producer/Analytics.jsx');
let analytics = fs.readFileSync(analyticsPath, 'utf8');
analytics = analytics.replace(
  "value: `${(stats.totalRevenue || 186000).toLocaleString()}`",
  "value: `\u20B9${((stats.totalRevenue||15400000)/100000).toFixed(1)}L`"
);
// Update chart data to INR values (in thousands)
analytics = analytics.replace(
  'data: [22000,28000,31000,35000,38000,32000]',
  'data: [1820000,2320000,2570000,2900000,3150000,2650000]'
);
fs.writeFileSync(analyticsPath, analytics);
console.log('Analytics fixed');

// Fix consumer Dashboard.jsx - Cost Saved
const consumerDashPath = path.join(__dirname, 'client/src/pages/consumer/Dashboard.jsx');
let consumerDash = fs.readFileSync(consumerDashPath, 'utf8');
consumerDash = consumerDash.replace("value: '$0'", "value: '\u20B90'");
fs.writeFileSync(consumerDashPath, consumerDash);
console.log('Consumer Dashboard fixed');

console.log('All currency fixes applied!');
