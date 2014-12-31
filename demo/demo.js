$('#el').elModInit(
  [
    { legend: "Text",       fields: ["text", "text-transform", "text-decoration"]},
    { legend: "Font",       fields: [["font-family", "font-size"], ["font-weight", "font-style"], ["color", "text-shadow"]]},
    { legend: "Type",       fields: ["letter-spacing", "word-spacing", "line-height", "white-space"]},
    { legend: "Align",      fields: ["text-align", "vertical-align"]},
    { legend: "Background", fields: ["background-color", "background-image", "background-repeat"]},
    { legend: "Dimensions", fields: ["width", "height", "margin", "padding"]},
    { legend: "Advanced",   fields: ["transform", "box-shadow", "border-radius"], hidden: true }
  ]
);
$('#form').append($('#el').elModGet());
