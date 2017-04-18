[![Build Status](https://travis-ci.org/lordvlad/fba.svg?branch=master)](https://travis-ci.org/lordvlad/fba)
[![Dependencies](https://david-dm.org/lordvlad/fba.svg)](https://david-dm.org/lordvlad/fba)
# fba

Small experiment to calculate flux balance analysis in the browser.

- [x] visualize systems biology models by dropping a sbml file in the browser
- [x] move the parser to the client side code, too
- [ ] allow the user to define constraints
- [ ] run fba
- [ ] present the results
- [ ] put the parser in a webworker
- [ ] put the analysis code in a webworker

To start it, clone the project then do `npm install` followed by `npm start`. Then visit `localhost:9966` in your browser. Drag and drop an `sbml` file anywhere in the window and you should see the model unfold.

![vis](https://raw.githubusercontent.com/lordvlad/fba/master/tca_sbml_viz.gif)