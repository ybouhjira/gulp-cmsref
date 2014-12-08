Gulp plugin to replace all media occurrences in CSS files with
[FirstSpirit](http://www.e-spirit.com/de/product/advantage/advantages.html)
CMS_REF tags:

`url("../path/to/image-filename.jpg") → url("$CMS_REF(media:"image_filename")$")`

The generated reference name is essentially the filename without extension and
with all special chars replaced with underlines. A mapping object with filenames
(not paths!) as keys and reference names as values can also be passed to the
plugin:

```javascript
cmsref({
    "image-filename.jpg": "my_image_jpg"
})
```