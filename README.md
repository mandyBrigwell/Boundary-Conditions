# Mapped Orbits for Unbound Electrons

## About this piece:

‘Mapped Orbits for Unbound Electrons’ is a study of circular orbits and noise-based gradients, rendered, shifted, superimposed and cropped in various ways to bring out generative patterns and shapes.

The main shape is a 'circular gradient' object, the parameters of which include a start and end radius, a number of individual arcs, a width for each arc segment, and an angle shift with some random variation taking place over all these parameters. Random numbers are, as is usual for an fxhash piece, based on a single unique hash value, ensuring the render is the same for each piece. Variations can be rendered, of course, using either the infinite variations button, or by pressing 'p' when the piece is active.

The generative process takes up to nine of these gradient objects and combines them in six main variants, ranging from a single central piece combining one or more gradients, through to complex pieces where multiple gradients are off-centred and faded across quarters or thirds.

To further add variation and the opportunity for the stochastic process to bring pleasing results, lines and circles may be overlaid according to various rules. These are curated towards quarters, thirds and sixths, depending on the rendering variation.

For this piece, palettes are not hard-coded. They are, however, carefully manipulated by selecting an initial hue value and working from this point to produce colours with various limitations. Some renders will be monochrome, or near-monochrome, whilst others will select from the full range of hues available. Others will cluster near to a central point, with one or two circular gradients taking up a contrary position on the colour wheel. There is the chance of a lighter rendering mode, something that may be considered a rare feature.

Other deliberately rare features include background texture, some line overlays, particular configurations of circular gradients. Unintentionally rare features may arise, of course, according to the patterns inherent within random numbers.

Collectors of ‘The Last Days of Fire and Steel’ may have enjoyed the apocalyptic lore behind the piece, and have wondered what caused events, and the nature of the machine alluded to in the piece. The last transmission from the machine may be of interest, and collectors of either piece are invited to discover its location within the piece.

## To use this:

Clone the repository on your machine and move to the directory. The actual code is in the *public* folder, in the *index.js* file.

## Install the packages required for the local environment
```sh
$ npm i
```

## Start local environment to enable live reloading

```sh
$ npm start
```

This should open the artwork in your web browser.

## Build

```sh
$ npm run build
```

This will create a `dist-zipped/project.zip` file which can be directly imported on fxhash.