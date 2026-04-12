export type JumpEntry = {
  bufferId: number;
  line: number;
  column: number;
};

const MAX_JUMPS = 100;

let jumpList: JumpEntry[] = [];
let jumpIndex = -1;

export function addJump(entry: JumpEntry) {
  if (jumpIndex < jumpList.length - 1) {
    jumpList = jumpList.slice(0, jumpIndex + 1);
  }

  const last = jumpList[jumpList.length - 1];
  if (last && last.bufferId === entry.bufferId && last.line === entry.line) {
    return;
  }

  jumpList.push(entry);

  if (jumpList.length > MAX_JUMPS) {
    jumpList = jumpList.slice(-MAX_JUMPS);
  }

  jumpIndex = jumpList.length - 1;
}

export function jumpBack(): JumpEntry | undefined {
  if (jumpIndex > 0) {
    jumpIndex--;
    return jumpList[jumpIndex];
  }
  return undefined;
}

export function jumpForward(): JumpEntry | undefined {
  if (jumpIndex < jumpList.length - 1) {
    jumpIndex++;
    return jumpList[jumpIndex];
  }
  return undefined;
}

export function getJumpList(): JumpEntry[] {
  return [...jumpList];
}

export function getJumpIndex(): number {
  return jumpIndex;
}

export function clearJumpList() {
  jumpList = [];
  jumpIndex = -1;
}
