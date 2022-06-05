# Boundary Conditions

## About this piece:

Boundary Conditions is based on a personal observation about the nature of existence: that it is most clear at the interface between two separate aspects of reality. We enjoy the merging of sea and land, congregate at the boundaries of the land and the sky, tenuously ponder—in small, select groups—the limits where atmosphere dwindles into vacuum. Life is about the transition from one state to another, maintaining a precarious existence on the edge of everything.

## The Generative Process

At the heart of Boundary Conditions is micro-managed Perlin noise, produced as small points and patches of colour. Rendering takes place over three hundred and sixty frames, with the number of points rendered increasing as time passes. This allows the piece to initially form a general overview, and fill in the finer details as time passes. This results in the piece fading gently into view over several seconds, but allows the rendering process to be part of the experience, rather than presenting the viewer with a blank screen or a progress bar.

#‘Grains’ and ‘Dunes’

The main focus of the image is the ‘grains’ layer—the dark, spattered series of grouped dots that form sweeping, striated patterns. A spattering technique is used, as though the grains were splashes of paint flung onto the canvas with vigorous brushstrokes. Amongst them, more saturated and thicker lines of colour accentuate one side of the grains, within certain chosen parameters, like shadows on the sides of a dunes, or the ripples left in sand by the receding tide.

#Colour and Large-scale Texture

Larger swathes of colour, termed ’dunes’, are added in such a way as to form patches, or thick striations. Along these paths larger circles of ink may be added, sometimes singly, sometimes in a pattern of splashes. Further shading is added to alter shading over the space of the entire instance. The ‘sand’ layer is a tighter, more extreme band of colour, but is intentionally limited so as not to overpower the piece.

#Geometric Overlays

Larger geometric shapes are sometimes overlaid: both circles and rectangles. These, too, are stippled in various ways, often fading so that only their corners, or partial edges, are visible.

#Rotation:

Applied, perhaps, at intervals of ninety degrees, or maybe in more subtle ways—sometimes a forty-five degree rotation will produce a diagonal rendering. This is in addition to the rotation of individual blocks, although the two may work against each other, leaving only part of the instance rotated.

#Grids and Intersections

The main image produced using the above techniques is taken and used as a building block for the finished piece. It may appear as a background to the entire image, and may then be broken into parts to provide the finished piece. These blocks may be small, may be large, may be further subdivided, or may not even be rendered at all. Sometimes they will be reversed or rotated, sometimes shifted in the x-axis, the y-axis, or both at once. The grid formations are chosen from a number of sub-styles, each one tuned and constrained to provide variation within aesthetic limits. Hundreds of test renders have been used to hone these options, but the possibility of the anomalous is always there.

#Scaling

Scaling allows for the image to move beyond the limits of the canvas, or be constrained within it. It also provides the possiblity of a sector being only slightly displaced from the background, leading to something akin to motion-blur. Sometimes a piece will be scaled to extremes of value, zooming in on a portion of the image, or rendering it as a smaller window within the larger canvas.

#Colour

Not all pieces are coloured, and in general the colours are muted and saturation is low. However, the saturation level is variable, and in rare cases can lead to completely greyscale images or, athe other extreme, instances where the saturation values are pushed to twice the standard value. Rarely is a piece saturated to the point where clipping of hue values occurs, but the possiblity is there. A dark mode exists in a small proportion of pieces, which enhances and highlights the saturated palettes.

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