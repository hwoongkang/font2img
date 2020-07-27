import fs from "fs";
import path from "path";
import nodeCanvas from "canvas";
import cliProgress from "cli-progress";
import chalk from "chalk";
import opentype from "opentype.js";
import { spec11172, spec2780, spec2350 } from "./utils/specs";

interface IOption {
  width: number;
  height: number;
  spec: 11172 | 2780 | 2350;
  outDir: string;
  family: string;
  unicodeName: boolean;
  name?: string;
}

const defaultOption: IOption = {
  width: 100,
  height: 100,
  spec: 2350,
  outDir: "./output",
  family: "unknown-family",
  unicodeName: false,
};

const getPathHelper = (
  char: string,
  font: opentype.Font,
  width: number,
  height: number
) => {
  const dummy = font.getPath(char, 0, 0, 0.8 * width);
  const { x1, x2, y1, y2 } = dummy.getBoundingBox();
  return font.getPath(
    char,
    width / 2 - Math.abs(x1 + x2) / 2,
    height / 2 + Math.abs(y1 + y2) / 2,
    0.8 * width
  );
};

const eraseHelper = (
  ctx: nodeCanvas.CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);
};

/**
 * Converts a single otf file to the set of images
 * @param srcFile relative directory of the otf file
 * @param option
 */
const convert = (srcFile: string, option: Partial<IOption> = defaultOption) => {
  // check if the files is indeed an otf format
  if (path.parse(srcFile).ext !== ".otf")
    throw new Error("Only otf files are supported");

  // resolve options
  const { width, height, spec, outDir, family, name, unicodeName } = {
    ...defaultOption,
    ...option,
  };

  // check specs and get hard-coded hangul array
  let hangul: string[];
  switch (spec) {
    case 11172:
      hangul = spec11172;
      break;
    case 2780:
      hangul = spec2780;
      break;
    default:
      hangul = spec2350;
      break;
  }

  // notify to the command line
  console.log(chalk.blue(`Processing ${srcFile} ...`));

  // canvas
  const canvas = nodeCanvas.createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  const erase = () => eraseHelper(ctx, width, height);

  // where to save
  const outname = name ?? path.parse(srcFile).name;

  const out = path.resolve(outDir, family, outname);

  fs.mkdirSync(out, { recursive: true });

  // load font
  const font = opentype.loadSync(srcFile);
  const getPath = (char: string) => getPathHelper(char, font, width, height);

  // progress bar
  const bar = new cliProgress.SingleBar({
    format: `progress [{bar}] {percentage}%  | {value}/{total}`,
    stopOnComplete: true,
  });

  bar.start(hangul.length + 52, 0);

  // process hangul characters
  hangul.forEach(char => {
    const glyph = getPath(char);

    erase();

    glyph.draw(ctx);

    fs.writeFileSync(
      path.resolve(
        out,
        unicodeName ? `${char.charCodeAt(0)}.png` : `${char}.png`
      ),
      canvas.toBuffer()
    );
    bar.increment();
  });
  bar.update(hangul.length);

  [...Array(26)].forEach((val, ind) => {
    const uppercase = String.fromCharCode(65 + ind);
    const lowercase = String.fromCharCode(97 + ind);
    const upper = getPath(uppercase);
    const lower = getPath(lowercase);

    erase();
    upper.draw(ctx);
    fs.writeFileSync(
      path.resolve(
        out,
        unicodeName ? `${65 + ind}.png` : `uppercase-${lowercase}.png`
      ),
      canvas.toBuffer()
    );
    bar.increment();

    erase();
    lower.draw(ctx);
    fs.writeFileSync(
      path.resolve(
        out,
        unicodeName ? `${97 + ind}.png` : `lowercase-${lowercase}.png`
      ),
      canvas.toBuffer()
    );
    bar.increment();
  });

  bar.update(hangul.length + 52);
  console.log(chalk.green(`Finished!`));
  console.log();
};

export = convert;
