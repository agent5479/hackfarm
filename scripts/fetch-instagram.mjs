import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEST = join(ROOT, 'public', 'images', 'uploads', 'sb-instagram-feed-images');
const BASE = 'https://www.hackfarm.co.nz/wp-content/uploads/sb-instagram-feed-images/';

const FILES = [
  '701538039_27449228651328956_2737825085368841951_nlow.jpg',
  '643562848_18451358485109112_2042575507208599498_nlow.jpg',
  '625060746_18446501524109112_299154765016538392_nlow.jpg',
  '622674109_18444619540109112_3662860958706598435_nlow.jpg',
  '613299360_18442333249109112_2123645102158151138_nlow.jpg',
  '591152735_18437470624109112_2596279303039898162_nlow.jpg',
  '582076970_18434701426109112_8757755488352690823_nlow.jpg',
  '582612897_1090808582976031_7488834955769579101_nlow.jpg',
  '564979357_18428512930109112_3919236620991915233_nlow.jpg',
  '554702250_18424840018109112_7208990187742874459_nlow.jpg',
  '523339927_18415493086109112_1291909907033999299_nlow.jpg',
  '521431616_4193536320904973_4749747141129129244_n.heiclow.jpg',
  '522480162_1291021942543954_9014924311264794161_n.heiclow.jpg',
  '522410207_1467524017867691_113462825070426954_n.heiclow.jpg',
  '521073507_598115190021760_3639451889904081754_n.heiclow.jpg',
  '519675080_1082052707213829_1070037248605679060_n.heiclow.jpg',
  '518422907_676660382042921_3805100344819984993_n.heiclow.jpg',
  '518341276_761147032919177_7127384321489979415_n.heiclow.jpg',
  '517235193_1300519121589641_5350407618324709065_n.heiclow.jpg',
  '516941279_3071420133032192_5644013214854315426_n.heiclow.jpg',
];

await mkdir(DEST, { recursive: true });

for (const file of FILES) {
  const url = BASE + file;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`FAIL ${file} ${res.status}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(join(DEST, file), buf);
  console.log(`OK ${file} (${buf.length} bytes)`);
}
