const db = await Deno.openKv();

type MessageType = "list" | "database" | "get" | "set";

const handler = async (request: Request): Promise<Response> => {
  // get query
  const url = new URL(request.url);
  const type = url.searchParams.get("type") as MessageType;
  const key = url.searchParams.get("key");
  const database = url.searchParams.get("database");
  const value = url.searchParams.get("value");

  // http://localhost:8080/?type=list&key=
  if (type === "list") {
    const prefix = key === null ? [] : key.split(",");

    const keys = db.list({
      prefix,
    });

    const result = [];
    for await (const key of keys) {
      result.push(key);
    }
    return new Response(JSON.stringify(result), { status: 200 });
  }

  // http://localhost:8080/?type=set&key=foo,bar&value=hello
  if (type === "set" && key && value) {
    await db.set(key.split(","), value);
    const result = {
      result: "OK",
    };
    return new Response(JSON.stringify(result), { status: 200 });
  }

  // http://localhost:8080/?type=get&key=foo,bar
  if (type === "get" && key) {
    const value = await db.get(key.split(","));
    return new Response(JSON.stringify(value), { status: 200 });
  }

  const body = `Your user-agent is:\n\n${
    request.headers.get("user-agent") ?? "Unknown"
  }`;

  return new Response(body, { status: 200 });
};

Deno.serve({
  port: 0,
  onListen(s) {
    console.log(`Listening on port ${s.port}`);
  },
}, handler);
