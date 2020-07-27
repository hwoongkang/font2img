# font2img: Font to images

Convert an `*.otf` font to a set of images

## Install

```bash
$ npm install font2img
```

or

```bash
$ yarn add font2img
```

## Usage

### font2img(sourceFile, options)

```Javascript
const font2img = require('font2img')

font2img('./directory-to/your-font-file.otf',{
  width: 100,
  height: 100,
  spec: 11172,
  family: "your-font-family",
  name: "bold-italic",
  outDir: "./output/"
})
```

Then `font2img` will look for the `./directory-to/your-font-file.otf`, make `./output/your-font-family/bold-italic/` folder and save png files in there.

## API

### sourceFile

`font2img` will complain and throw error if the source file is not an otf file.

### options

- `width: number` width of the png file (default: 100)
- `height: number` height of the png file (default: 100)
- `spec: 11172 | 2780 | 2350` spec of the hangul font (default: 2350)
- `outDir: string` where to save the generated images (default: "./output")
- `family: string` font family name, e.g. 'Comic Sans' (default: "unknown-family")
- `name: string` font name, used to annotate styles (default: source file name without extension)
- `unicodeName: boolean` whether to set the title of image files to the unicode. If set to true, '가' and 'A' is saved as `44032.png`, `65.png`, respectively. Otherwise, it is saved as `가.png`, `uppercase-a.png`, respectively. (default: false)
