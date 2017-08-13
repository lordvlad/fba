[![Build Status](https://travis-ci.org/lordvlad/fba.svg?branch=master)](https://travis-ci.org/lordvlad/fba)
[![bitHound Code](https://www.bithound.io/github/lordvlad/fba/badges/code.svg)](https://www.bithound.io/github/lordvlad/fba)
[![Coverage Status](https://coveralls.io/repos/github/lordvlad/fba/badge.svg?branch=master)](https://coveralls.io/github/lordvlad/fba?branch=master)
[![devDependencies Status](https://david-dm.org/lordvlad/fba/dev-status.svg)](https://david-dm.org/lordvlad/fba?type=dev)
# fba

Small experiment to calculate flux balance analysis in the browser.

- [x] visualize systems biology models by dropping a sbml file in the browser
- [x] move the parser to the client side code, too
- [x] do sbml parsing in a webworker
- [x] switch to cytoscape for visualization
- [ ] allow the user to define constraints
- [ ] run fba
- [ ] present the results
- [ ] put the analysis code in a webworker

To start it, clone the project then do `npm install` followed by `npm start`. Then visit `localhost:9966` in your browser. Drag and drop an `sbml` file anywhere in the window and you should see the model unfold.

![vis](https://raw.githubusercontent.com/lordvlad/fba/master/tca_sbml_viz.gif)
