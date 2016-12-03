# fba

Small experiment to calculate flux balance analysis in the browser.

- [x] visualize systems biology models by dropping a sbml file in the browser
- [ ] allow the user to define constraints
- [ ] run fba
- [ ] present the results
- [ ] move the parser to the client side code, too
- [ ] put the parser in a webworker
- [ ] put the analysis code in a webworker

To start it, clone the project then do `npm install` followed by `npm start`. Then visit `localhost:8082` in your browser. Drag and drop an `sbml` file anywhere in the window and you should see the model unfold.

![vis](https://raw.githubusercontent.com/lordvlad/fba/master/tca_sbml_viz.gif)