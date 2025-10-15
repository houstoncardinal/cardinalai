import git from 'isomorphic-git';
import FS from '@isomorphic-git/lightning-fs';

const fs = new FS('pathwayai-fs');

export const gitService = {
  fs,
  dir: '/project',

  async init() {
    try {
      await git.init({ fs, dir: this.dir });
      return true;
    } catch (error) {
      console.error('Git init error:', error);
      return false;
    }
  },

  async status(filepath?: string) {
    try {
      const FILE = filepath || '.';
      const status = await git.statusMatrix({
        fs,
        dir: this.dir,
        filepaths: filepath ? [filepath] : undefined,
      });
      
      return status.map(([file, head, workdir, stage]) => ({
        file,
        status: this.getStatusString(head, workdir, stage),
        staged: stage !== head,
        modified: workdir !== head,
      }));
    } catch (error) {
      console.error('Git status error:', error);
      return [];
    }
  },

  getStatusString(head: number, workdir: number, stage: number): string {
    if (head === 0 && workdir === 2 && stage === 0) return 'new';
    if (head === 1 && workdir === 2 && stage === 1) return 'modified';
    if (head === 1 && workdir === 0 && stage === 1) return 'deleted';
    if (head === 1 && workdir === 2 && stage === 2) return 'staged';
    return 'unmodified';
  },

  async add(filepath: string) {
    try {
      await git.add({ fs, dir: this.dir, filepath });
      return true;
    } catch (error) {
      console.error('Git add error:', error);
      return false;
    }
  },

  async remove(filepath: string) {
    try {
      await git.remove({ fs, dir: this.dir, filepath });
      return true;
    } catch (error) {
      console.error('Git remove error:', error);
      return false;
    }
  },

  async commit(message: string, author: { name: string; email: string }) {
    try {
      const sha = await git.commit({
        fs,
        dir: this.dir,
        message,
        author,
      });
      return sha;
    } catch (error) {
      console.error('Git commit error:', error);
      return null;
    }
  },

  async log(depth: number = 10) {
    try {
      const commits = await git.log({
        fs,
        dir: this.dir,
        depth,
      });
      return commits;
    } catch (error) {
      console.error('Git log error:', error);
      return [];
    }
  },

  async branches() {
    try {
      const branches = await git.listBranches({
        fs,
        dir: this.dir,
      });
      return branches;
    } catch (error) {
      console.error('Git branches error:', error);
      return [];
    }
  },

  async currentBranch() {
    try {
      const branch = await git.currentBranch({
        fs,
        dir: this.dir,
        fullname: false,
      });
      return branch || 'main';
    } catch (error) {
      console.error('Git current branch error:', error);
      return 'main';
    }
  },

  async createBranch(name: string) {
    try {
      await git.branch({
        fs,
        dir: this.dir,
        ref: name,
      });
      return true;
    } catch (error) {
      console.error('Git create branch error:', error);
      return false;
    }
  },

  async checkout(ref: string) {
    try {
      await git.checkout({
        fs,
        dir: this.dir,
        ref,
      });
      return true;
    } catch (error) {
      console.error('Git checkout error:', error);
      return false;
    }
  },

  async diff(filepath: string, ref1?: string, ref2?: string) {
    try {
      // For now, return a simple diff indicator
      // Full diff implementation would require additional parsing
      const status = await this.status(filepath);
      return status.find(s => s.file === filepath) || null;
    } catch (error) {
      console.error('Git diff error:', error);
      return null;
    }
  },
};
