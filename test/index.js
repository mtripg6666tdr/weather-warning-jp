/**
 * @type {typeof import("../typings/lib").WeatherAdvisoryWarningJP}
 */
const weatherAdvisaryWarningClient = require("../dist").default;

const client = new weatherAdvisaryWarningClient("130000");

(async()=>{
  const entries = await client.fetch();
  console.log(entries);
})();