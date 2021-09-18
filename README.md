# weather-warning-jp
Quickly get weather advisaries, warning, emergency information in Japan, with only this library.  
\* The README is also available in [日本語](./README.ja.md).

# Usage
```javascript
const wawClient = require("weather-warning-jp").default;
const client = new wawClient("130000");
const entries = await client.fetch(); 
```
```typescript
import wawClient from "weather-warning-jp";
const client = new wawClient("13000");
const entries = await client.fetch();
```


# Notice / Special Thanks
This library gets data from [CPS-IIPリスクウォッチャー](http://agora.ex.nii.ac.jp/cps/).  