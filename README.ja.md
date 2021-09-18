# weather-warning-jp
このライブラリだけで気象注意報・警報・特別警報の情報を取得できます。  
\* このREADMEは[English](./README.md)でもご利用いただけます。

# 使い方
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


# お知らせ・感謝
このライブラリは[CPS-IIPリスクウォッチャー](http://agora.ex.nii.ac.jp/cps/)から情報を取得しています。  