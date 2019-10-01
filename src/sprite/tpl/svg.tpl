$icons: (
  sprite: (
    width: {{spriteWidth}}px,
    height: {{spriteHeight}}px,
    svgPath: '../img/sprite/sprite_svg.svg',
  ),
  {{#shapes}}
    {{base}}:
      (
        width: {{width.inner}}px,
        height: {{height.inner}}px,
        backgroundX: {{position.absolute.x}}px,
        backgroundY: {{position.absolute.y}}px,
      ),
  {{/ shapes}}
);

.sps{
  width: {{spriteWidth}}px;
  height: {{spriteHeight}}px;
  background-image:url('../img/sprite/sprite_svg.svg');
}
{{#shapes}}
.sps_{{base}} {
  width: {{width.inner}}px;
  height: {{height.inner}}px;
  background-position: calc({{position.absolute.x}}px - 10px) calc({{position.absolute.y}}px - 10px);
}
{{/ shapes}}