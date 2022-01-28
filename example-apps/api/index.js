const app = require("./app.js");

const appPort = 3000;
const probePort = 8089;

app.mainApi.listen(appPort, () =>
  console.log(`Example app listening on ${appPort}`)
);
app.probeApi.listen(probePort, () =>
  console.log(`Probe listening on ${probePort}`)
);
