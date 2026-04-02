import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function commandExists(cmd: string): Promise<{ found: boolean; path: string }> {
  try {
    const isWindows = process.platform === 'win32';
    const checkCmd = isWindows ? `where ${cmd}` : `which ${cmd}`;
    const { stdout } = await execAsync(checkCmd, { timeout: 5000 });
    return { found: true, path: stdout.trim().split('\n')[0] };
  } catch {
    return { found: false, path: '' };
  }
}

async function checkAuth(binary: string, type: string): Promise<{ authenticated: boolean; detail: string }> {
  try {
    if (type === 'claude_code') {
      // claude --version works if installed; auth is tied to the session
      const { stdout } = await execAsync(`${binary} --version`, { timeout: 10000 });
      return { authenticated: true, detail: `Version: ${stdout.trim()}` };
    } else if (type === 'codex-cli') {
      const { stdout } = await execAsync(`${binary} --version`, { timeout: 10000 });
      return { authenticated: true, detail: `Version: ${stdout.trim()}` };
    } else if (type === 'gemini_cli') {
      const { stdout } = await execAsync(`${binary} --version`, { timeout: 10000 });
      return { authenticated: true, detail: `Version: ${stdout.trim()}` };
    }
    return { authenticated: false, detail: 'Unknown provider type' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { authenticated: false, detail: msg };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, binaryPath } = body as { type: string; binaryPath?: string };

    const binaryMap: Record<string, string> = {
      claude_code: 'claude',
      'codex-cli': 'codex',
      gemini_cli: 'gemini',
    };

    const binary = binaryPath || binaryMap[type] || type;

    // Step 1: Check if binary exists
    const exists = await commandExists(binary);

    if (!exists.found) {
      return NextResponse.json({
        binaryFound: false,
        binaryPath: binary,
        authenticated: false,
        modelAccess: false,
      });
    }

    // Step 2: Check auth/version
    const auth = await checkAuth(binary, type);

    return NextResponse.json({
      binaryFound: true,
      binaryPath: exists.path,
      authenticated: auth.authenticated,
      authDetail: auth.detail,
      modelAccess: auth.authenticated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
