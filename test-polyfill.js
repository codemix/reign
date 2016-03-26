require("babel-core/register")({
  "presets": ["es2015", "stage-0", "react"],
  "plugins": [
    ["contracts"],
    ["trace", {"strip": true}]
  ],
  "passPerPreset": true
});
