import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminOptipng from 'imagemin-optipng';
import imageminSvgo from 'imagemin-svgo';

(async () => {
  await imagemin(["img/**/*.{png,jpg,jpeg,svg}"], {
    destination: "docs/img",
    plugins: [
      imageminMozjpeg({ quality: 75, progressive: true }),
      imageminOptipng({ optimizationLevel: 5 }),
      imageminSvgo()
    ]
  });
})();