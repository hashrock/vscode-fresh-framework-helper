import * as vscode from "vscode";

async function writeFile(newFile: string, body: string) {
  // check if file exists
  let fileExists;
  try {
    fileExists = await vscode.workspace.fs.stat(
      vscode.Uri.file(newFile),
    );
  } catch (error) {
    // do nothing
  }
  if (fileExists) {
    vscode.window.showErrorMessage("File already exists");
    throw new Error("File already exists");
  }

  vscode.workspace.fs.writeFile(
    vscode.Uri.file(newFile),
    new Uint8Array(Buffer.from(body)),
  );

  vscode.window.showInformationMessage("File Created");
}

const routes = [
  {
    label: "Simple JSX Page",
    body: `export default function AboutPage() {
  return (
    <main>
      <h1>About</h1>
      <p>This is the about page.</p>
    </main>
  );
}`,
  },
  {
    label: "Dynamic route",
    body: `import { PageProps } from "$fresh/server.ts";

export default function GreetPage(props: PageProps) {
  const { name } = props.params;
  return (
    <main>
      <p>Greetings to you, {name}!</p>
    </main>
  );
}`,
  },
  {
    label: "Handler route",
    body: `import { HandlerContext, Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(_req: Request, _ctx: HandlerContext) {
    return new Response("Hello World");
  },
};`,
  },
];

const asyncRoutes = [
  {
    label: "Async component route",
    body:
      `export default async function MyPage(req: Request, ctx: RouteContext) {
  // const value = await loadFooValue();
  return <p>foo is: {1}</p>;
}`,
  },
  {
    label: "Mixed handler and component route",
    body: `interface Data {
  foo: number;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    // const value = await loadFooValue();
    ctx.render({ foo: 1 });
  },
};

export default function MyPage(props: PageProps<Data>) {
  return <p>foo is: {props.data.foo}</p>;
}`,
  },
  {
    label: "Async component route with defineHelper",
    body: `import { defineRoute } from "$fresh/server.ts";

export default defineRoute(async (req, ctx) => {
  const data = await loadData();

  return (
    <div class="page">
      <h1>Hello {data.name}</h1>
    </div>
  );
});`,
  },
];

export async function generateRoute(uri: vscode.Uri) {
  const fileName = await vscode.window.showInputBox({
    prompt: "Enter file name",
    placeHolder: "index.tsx",
    value: "index.tsx",
  });

  const newFile = uri.fsPath + "/" + fileName;
  const optAsync = await vscode.window.showQuickPick([
    "No",
    "Yes",
  ], {
    placeHolder: "Do you need async route? (example: data fetching)",
  }) === "Yes";

  let body = "";

  if (optAsync) {
    body = (await vscode.window.showQuickPick(asyncRoutes, {
      placeHolder: "Select a snippet",
    }))?.body ?? "";
  } else {
    body = (await vscode.window.showQuickPick(routes, {
      placeHolder: "Select a snippet",
    }))?.body ?? "";
  }
  if (!body) {
    return;
  }

  try {
    await writeFile(newFile, body);
  } catch (error: unknown) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(error.message);
    }
  }
}

async function generateFile(uri: vscode.Uri, body: string, defaultFileName = "index.tsx") {
  const fileName = await vscode.window.showInputBox({
    prompt: "Enter file name",
    placeHolder: defaultFileName,
    value: defaultFileName,
  });

  const newFile = uri.fsPath + "/" + fileName;

  try {
    await writeFile(newFile, body);
  } catch (error: unknown) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(error.message);
    }
  }
}

export async function generateLayout(uri: vscode.Uri) {
  const body =
    `import { LayoutProps } from "$fresh/server.ts";

export default function Layout({ Component, state }: LayoutProps) {
  return (
    <div class="layout">
      <Component />
    </div>
  );
}`;

  await generateFile(uri, body, "_layout.tsx");
}

export async function generateComponent(uri: vscode.Uri) {
  const body = `export function MyComponent() {
  return (
    <div>
      <h1>MyComponent</h1>
    </div>
  );
}`;

  await generateFile(uri, body);
}

export async function generateIsland(uri: vscode.Uri) {
  const body = `import type { Signal } from "@preact/signals";

interface CounterProps {
  count: Signal<number>;
}

export default function Counter(props: CounterProps) {
  return (
    <div>
      <button onClick={() => props.count.value -= 1}>-1</button>
      <p>{props.count}</p>
      <button onClick={() => props.count.value += 1}>+1</button>
    </div>
  );
}`;

  await generateFile(uri, body);
}
