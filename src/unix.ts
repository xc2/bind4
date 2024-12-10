import { chmod, chown, stat, unlink } from "node:fs/promises";
import * as http from "node:http";
import type { ListenOptions } from "node:net";
import { destructPromise } from "./utils";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from Unix Socket Server\n");
});

export interface UnixSocketParams {
  path: string;
  mode?: number;
  uid?: number;
  gid?: number;
}
class UnixSocket implements Disposable, AsyncDisposable {
  constructor(protected readonly params: UnixSocketParams) {}
  async unlink() {
    const [ok, s] = await destructPromise(stat(this.params.path));
    if (!ok) {
      if ((s as any).code === "ENOENT") return;
      throw s;
    }
    if (!s.isSocket()) {
      throw new Error("path is exists but not a socket");
    }
    await unlink(this.params.path);
  }

  async [Symbol.asyncDispose](): Promise<void> {
    console.log("dispose");
    try {
      this.unlink();
    } catch {}
  }
  [Symbol.dispose](): void {
    this[Symbol.asyncDispose]();
  }
  async before() {
    console.log("before");
    return this.unlink();
  }
  getBindOptions(): ListenOptions {
    return {
      path: this.params.path,
    };
  }
  async after() {
    console.log("after");
    await chmod(this.params.path, this.params.mode ?? 0o600);
    if (this.params.uid !== undefined && this.params.gid !== undefined) {
      await chown(this.params.path, this.params.uid, this.params.gid);
    }
  }
}

const p = new UnixSocket({ path: "./foo.sock" });

await p.before();

server.once("listening", () => {
  console.log("listening");
  p.after();
});
server.once("close", () => {
  p[Symbol.asyncDispose]();
});

process.on("SIGTERM", () => {
  server.close();
});
process.on("SIGINT", () => {
  server.close();
});
server.listen(p.getBindOptions());
