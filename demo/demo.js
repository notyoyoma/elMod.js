$('#el').elModInit(
  [
    { title: "Font", fields: ["font-family", "font-size", 'font-weight', 'font-style']},
    { title: "Align", fields: ["text-align", "vertical-align"]},
    { title: "Colors", fields: ["background-color", "color"]},
    { title: "Dimensions", fields: ["width", "height", "margin", "padding"]},
    { title: "Advanced", fields: ["transform", "box-shadow", "border-radius"], hidden: true }
  ]
);
$('#form').append($('#el').elModGet());
