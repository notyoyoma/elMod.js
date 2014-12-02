$('#el').elModInit(
  [
    { title: "Align", fields: ["text-align", "vertical-align"]},
    { title: "Colors", fields: ["background-color", "color"]},
    { title: "Advanced", fields: ["transform", "box-shadow", "border-radius"], hidden: true }
  ]
);
$('#el').click(function() {
  $('#form').append($(this).elMod());
});
