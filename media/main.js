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

      const routeName = document.createElement("div");
      routeName.className = "route-name";
      li.appendChild(routeName);

      routeName.appendChild(createRouteIcon());

      const routeNameLabel = document.createElement("div");
      routeNameLabel.className = "route-label";
      routeNameLabel.textContent = route.route.replace(/^routes\//, "");
      routeName.appendChild(routeNameLabel);

      const routeAction = document.createElement("div");
      routeAction.className = "route-action";
      li.appendChild(routeAction);

      const routeType = document.createElement("div");
      routeType.className = "route-type";
      routeType.textContent = "Route"; // TODO
      routeAction.appendChild(routeType);

      routeAction.appendChild(createPreviewLink());

      const routeEdit = document.createElement("div");
      routeEdit.className = "route-edit";
      routeEdit.textContent = "Edit";

      routeAction.appendChild(routeEdit);

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

  function createRouteIcon() {
    const icon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    icon.setAttribute("width", "24");
    icon.setAttribute("height", "25");
    icon.setAttribute("viewBox", "0 0 24 25");
    icon.classList.add("icon");

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
