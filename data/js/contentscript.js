self.port.on("style", function(path) {
  let link = document.createElement("link");
  link.setAttribute("href", path);
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  document.head.appendChild(link);
});

self.port.on("jsx", function(path) {
  let script = document.createElement("script");
  script.setAttribute("type", "text/jsx");
  script.setAttribute("src", path)
  document.body.appendChild(script);
  console.info(`APPENDED ${path}`);
});
