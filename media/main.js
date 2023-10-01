//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const oldState = vscode.getState() || { colors: [] };

  /** @type {Array<{ value: string }>} */
  let colors = oldState.colors;

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "setRoutes": {
        const routes = message.value;
        updateRoutes(routes);
        break;
      }
    }
  });

  /**
   * @param {Array<{ route: string, file: string, pattern, string }>} routes
   */
  function updateRoutes(routes) {
    const ul = document.querySelector(".route-list");
    if (!ul) {
      return;
    }
    ul.textContent = "";
    for (const route of routes) {
      const li = document.createElement("li");
      li.className = "route-entry";

      // Special routes:
      // _app
      // _layout
      // _middleware
      // _404
      // _500

      li.appendChild(createRouteIcon());
      li.appendChild(createPreviewLink());

      const input = document.createElement("input");
      input.className = "route-input";
      input.type = "text";
      input.value = route.route;
      input.addEventListener("change", (e) => {
        // @ts-ignore
        const value = e.target.value;
        if (!value) {
          // Treat empty value as delete
          routes.splice(routes.indexOf(route), 1);
        } else {
          route.route = value;
        }
        updateRoutes(routes);
      });
      li.appendChild(input);

      // @ts-ignore
      ul.appendChild(li);
    }

    function createPreviewLink() {
      const fileLink = document.createElement("a");
      fileLink.className = "file-link";
      fileLink.textContent = "open";
      fileLink.href = `https://code.visualstudio.com/`;
      return fileLink;
    }
  }

  /**
   * @param {Array<{ value: string }>} colors
   */
  function updateColorList(colors) {
    const ul = document.querySelector(".color-list");
    if (!ul) {
      return;
    }
    ul.textContent = "";
    for (const color of colors) {
      const li = document.createElement("li");
      li.className = "color-entry";

      const colorPreview = document.createElement("div");
      colorPreview.className = "color-preview";
      colorPreview.style.backgroundColor = `#${color.value}`;
      colorPreview.addEventListener("click", () => {
        onColorClicked(color.value);
      });
      li.appendChild(colorPreview);

      const input = document.createElement("input");
      input.className = "color-input";
      input.type = "text";
      input.value = color.value;
      input.addEventListener("change", (e) => {
        // @ts-ignore
        const value = e.target.value;
        if (!value) {
          // Treat empty value as delete
          colors.splice(colors.indexOf(color), 1);
        } else {
          color.value = value;
        }
        updateColorList(colors);
      });
      li.appendChild(input);

      // @ts-ignore
      ul.appendChild(li);
    }

    // Update the saved state
    vscode.setState({ colors: colors });
  }

  /**
   * @param {string} color
   */
  function onColorClicked(color) {
    vscode.postMessage({ type: "colorSelected", value: color });
  }

  /**
   * @returns string
   */
  function getNewCalicoColor() {
    const colors = ["020202", "f1eeee", "a85b20", "daab70", "efcb99"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function addColor() {
    colors.push({ value: getNewCalicoColor() });
    updateColorList(colors);
  }

  function createRouteIcon() {
    const icon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    icon.setAttribute("width", "24");
    icon.setAttribute("height", "25");
    icon.setAttribute("viewBox", "0 0 24 25");

    const useTag = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "use",
    );
    useTag.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      "#icon-path",
    );
    icon.appendChild(useTag);
    return icon;
  }

  vscode.postMessage({ type: "update" });
})();
