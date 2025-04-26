import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import clsx from 'clsx';

// ファイルシステムの型定義
interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: Record<string, FileSystemNode>;
  metadata?: {
    createdAt: Date;
    modifiedAt: Date;
    permissions: string;
    owner: string;
  };
}

// テーマの型定義
interface Theme {
  name: string;
  background: string;
  foreground: string;
  prompt: string;
  error: string;
  success: string;
  selection: string;
  accent: string;
  fontFamily: string;
}

// コマンド出力の型定義
interface CommandOutput {
  content: string;
  type: 'standard' | 'error' | 'success' | 'info' | 'html';
  timestamp: Date;
}

// コマンド履歴のアイテム
interface HistoryItem {
  command: string;
  output: CommandOutput[];
  workingDirectory: string;
  timestamp: Date;
}

// 利用可能なテーマ
const themes: Record<string, Theme> = {
  classic: {
    name: 'Classic',
    background: '#000000',
    foreground: '#00ff00',
    prompt: '#00ff00',
    error: '#ff0000',
    success: '#00ff00',
    selection: '#333333',
    accent: '#0077ff',
    fontFamily: 'monospace'
  },
  modern: {
    name: 'Modern',
    background: '#1e1e2e',
    foreground: '#d9e0ee',
    prompt: '#89b4fa',
    error: '#f38ba8',
    success: '#a6e3a1',
    selection: '#313244',
    accent: '#f5c2e7',
    fontFamily: '"Cascadia Code", monospace'
  },
  light: {
    name: 'Light',
    background: '#f5f5f5',
    foreground: '#333333',
    prompt: '#0077cc',
    error: '#cc0000',
    success: '#007700',
    selection: '#dddddd',
    accent: '#ff6600',
    fontFamily: '"Fira Code", monospace'
  },
  retro: {
    name: 'Retro',
    background: '#2d2b55',
    foreground: '#ff7edb',
    prompt: '#ffcc00',
    error: '#ff5370',
    success: '#a5ff90',
    selection: '#423f77',
    accent: '#00aaff',
    fontFamily: '"VT323", monospace'
  }
};

// 初期ファイルシステム
const initialFileSystem: FileSystemNode = {
  name: '/',
  type: 'directory',
  children: {
    'home': {
      name: 'home',
      type: 'directory',
      children: {
        'user': {
          name: 'user',
          type: 'directory',
          children: {
            'documents': {
              name: 'documents',
              type: 'directory',
              children: {
                'welcome.txt': {
                  name: 'welcome.txt',
                  type: 'file',
                  content: 'Welcome to ReactCUI!\n\nThis is an interactive terminal simulator built with React.\nTry typing "help" to see available commands.',
                  metadata: {
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    permissions: 'rw-r--r--',
                    owner: 'user'
                  }
                },
                'projects.txt': {
                  name: 'projects.txt',
                  type: 'file',
                  content: 'Project Ideas:\n1. AI-powered task manager\n2. Blockchain voting system\n3. AR navigation app',
                  metadata: {
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    permissions: 'rw-r--r--',
                    owner: 'user'
                  }
                }
              }
            },
            'pictures': {
              name: 'pictures',
              type: 'directory',
              children: {
                'avatar.png': {
                  name: 'avatar.png',
                  type: 'file',
                  content: '[PNG IMAGE DATA]',
                  metadata: {
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    permissions: 'rw-r--r--',
                    owner: 'user'
                  }
                }
              }
            },
            '.bashrc': {
              name: '.bashrc',
              type: 'file',
              content: '# User bashrc configuration\nexport PATH=$PATH:/usr/local/bin\nalias ll="ls -la"\n',
              metadata: {
                createdAt: new Date(),
                modifiedAt: new Date(),
                permissions: 'rw-r--r--',
                owner: 'user'
              }
            }
          }
        }
      }
    },
    'bin': {
      name: 'bin',
      type: 'directory',
      children: {
        'echo': {
          name: 'echo',
          type: 'file',
          content: '[BINARY]',
          metadata: {
            createdAt: new Date(),
            modifiedAt: new Date(),
            permissions: 'rwxr-xr-x',
            owner: 'root'
          }
        }
      }
    },
    'etc': {
      name: 'etc',
      type: 'directory',
      children: {
        'passwd': {
          name: 'passwd',
          type: 'file',
          content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:User:/home/user:/bin/bash',
          metadata: {
            createdAt: new Date(),
            modifiedAt: new Date(),
            permissions: 'r--r--r--',
            owner: 'root'
          }
        }
      }
    }
  }
};

// 利用可能なコマンド定義
const commandDefinitions = {
  help: {
    description: 'Display available commands',
    usage: 'help [command]',
    execute: (args: string[], state: AppState) => {
      if (args.length === 0) {
        return [
          {
            content: 'Available commands:\n\n' +
              Object.entries(commandDefinitions)
                .map(([cmd, def]) => `${cmd.padEnd(10)} - ${def.description}`)
                .join('\n') +
              '\n\nType "help [command]" for more information about a specific command.',
            type: 'info',
            timestamp: new Date()
          }
        ];
      } else {
        const cmd = args[0];
        const def = commandDefinitions[cmd as keyof typeof commandDefinitions];
        if (def) {
          return [
            {
              content: `Command: ${cmd}\nDescription: ${def.description}\nUsage: ${def.usage}`,
              type: 'info',
              timestamp: new Date()
            }
          ];
        } else {
          return [
            {
              content: `Unknown command: ${cmd}`,
              type: 'error',
              timestamp: new Date()
            }
          ];
        }
      }
    }
  },
  echo: {
    description: 'Display a message',
    usage: 'echo [message]',
    execute: (args: string[]) => {
      return [
        {
          content: args.join(' '),
          type: 'standard',
          timestamp: new Date()
        }
      ];
    }
  },
  clear: {
    description: 'Clear the terminal',
    usage: 'clear',
    execute: () => {
      return 'clear' as any;
    }
  },
  ls: {
    description: 'List directory contents',
    usage: 'ls [options] [directory]',
    execute: (args: string[], state: AppState) => {
      const showHidden = args.includes('-a');
      const showDetails = args.includes('-l');
      let targetPath = args.filter(arg => !arg.startsWith('-')).join(' ') || '.';
      
      const node = getNodeAtPath(targetPath, state.fileSystem, state.currentDirectory);
      if (!node) {
        return [{ 
          content: `ls: cannot access '${targetPath}': No such file or directory`, 
          type: 'error',
          timestamp: new Date()
        }];
      }
      
      if (node.type === 'file') {
        return [{ 
          content: node.name,
          type: 'standard',
          timestamp: new Date() 
        }];
      }
      
      if (node.children) {
        const entries = Object.values(node.children)
          .filter(child => showHidden || !child.name.startsWith('.'));
        
        if (showDetails) {
          const content = entries.map(entry => {
            const { name, type, metadata } = entry;
            const dateStr = metadata?.modifiedAt.toLocaleString() || '';
            const perms = metadata?.permissions || '----------';
            const owner = metadata?.owner || 'user';
            return `${perms} ${owner.padEnd(8)} ${dateStr.padEnd(20)} ${name}${type === 'directory' ? '/' : ''}`;
          }).join('\n');
          return [{ 
            content: content || '(empty directory)',
            type: 'standard',
            timestamp: new Date() 
          }];
        } else {
          const dirContent = entries.map(entry => 
            `${entry.name}${entry.type === 'directory' ? '/' : ''}`
          ).join('  ');
          return [{ 
            content: dirContent || '(empty directory)',
            type: 'standard',
            timestamp: new Date() 
          }];
        }
      }
      
      return [{ 
        content: '(empty directory)',
        type: 'standard',
        timestamp: new Date() 
      }];
    }
  },
  cd: {
    description: 'Change directory',
    usage: 'cd [directory]',
    execute: (args: string[], state: AppState) => {
      const path = args.join(' ') || '~';
      let targetPath = path === '~' ? '/home/user' : path;
      
      const node = getNodeAtPath(targetPath, state.fileSystem, state.currentDirectory);
      
      if (!node) {
        return [{ 
          content: `cd: no such directory: ${targetPath}`,
          type: 'error',
          timestamp: new Date() 
        }];
      }
      
      if (node.type !== 'directory') {
        return [{ 
          content: `cd: not a directory: ${targetPath}`,
          type: 'error',
          timestamp: new Date() 
        }];
      }
      
      // Return special instruction to change directory
      return { type: 'cd', path: getAbsolutePath(targetPath, state.currentDirectory) } as any;
    }
  },
  cat: {
    description: 'Concatenate and display file contents',
    usage: 'cat [file]',
    execute: (args: string[], state: AppState) => {
      if (args.length === 0) {
        return [{ 
          content: 'cat: missing operand',
          type: 'error',
          timestamp: new Date() 
        }];
      }
      
      const filePath = args.join(' ');
      const node = getNodeAtPath(filePath, state.fileSystem, state.currentDirectory);
      
      if (!node) {
        return [{ 
          content: `cat: ${filePath}: No such file or directory`,
          type: 'error',
          timestamp: new Date() 
        }];
      }
      
      if (node.type !== 'file') {
        return [{ 
          content: `cat: ${filePath}: Is a directory`,
          type: 'error',
          timestamp: new Date() 
        }];
      }
      
      return [{
        content: node.content || '',
        type: 'standard',
        timestamp: new Date()
      }];
    }
  },
  pwd: {
    description: 'Print working directory',
    usage: 'pwd',
    execute: (args: string[], state: AppState) => {
      return [{
        content: state.currentDirectory,
        type: 'standard',
        timestamp: new Date()
      }];
    }
  },
  theme: {
    description: 'Change or display terminal theme',
    usage: 'theme [theme-name]',
    execute: (args: string[], state: AppState) => {
      if (args.length === 0) {
        const themesList = Object.keys(themes).map(themeName => 
          `${themeName}${themeName === state.currentTheme ? ' (current)' : ''}`
        ).join('\n');
        
        return [{
          content: `Available themes:\n${themesList}`,
          type: 'info',
          timestamp: new Date()
        }];
      }
      
      const requestedTheme = args[0];
      if (themes[requestedTheme]) {
        // Return special instruction to change theme
        return { type: 'theme', name: requestedTheme } as any;
      } else {
        return [{
          content: `Unknown theme: ${requestedTheme}`,
          type: 'error',
          timestamp: new Date()
        }];
      }
    }
  },
  date: {
    description: 'Display the current date and time',
    usage: 'date',
    execute: () => {
      return [{
        content: new Date().toString(),
        type: 'standard',
        timestamp: new Date()
      }];
    }
  },
  whoami: {
    description: 'Display current user',
    usage: 'whoami',
    execute: () => {
      return [{
        content: 'user',
        type: 'standard',
        timestamp: new Date()
      }];
    }
  },
  mkdir: {
    description: 'Create a directory',
    usage: 'mkdir [directory-name]',
    execute: (args: string[], state: AppState) => {
      if (args.length === 0) {
        return [{
          content: 'mkdir: missing operand',
          type: 'error',
          timestamp: new Date()
        }];
      }
      
      const dirName = args[0];
      return { type: 'mkdir', name: dirName } as any;
    }
  },
  touch: {
    description: 'Create a file',
    usage: 'touch [file-name]',
    execute: (args: string[], state: AppState) => {
      if (args.length === 0) {
        return [{
          content: 'touch: missing operand',
          type: 'error',
          timestamp: new Date()
        }];
      }
      
      const fileName = args[0];
      return { type: 'touch', name: fileName } as any;
    }
  },
  edit: {
    description: 'Edit a file',
    usage: 'edit [file-name]',
    execute: (args: string[], state: AppState) => {
      if (args.length === 0) {
        return [{
          content: 'edit: missing operand',
          type: 'error',
          timestamp: new Date()
        }];
      }
      
      const fileName = args[0];
      const node = getNodeAtPath(fileName, state.fileSystem, state.currentDirectory);
      
      if (!node) {
        return [{
          content: `edit: ${fileName}: No such file`,
          type: 'error',
          timestamp: new Date()
        }];
      }
      
      if (node.type !== 'file') {
        return [{
          content: `edit: ${fileName}: Is a directory`,
          type: 'error',
          timestamp: new Date()
        }];
      }
      
      // Return special instruction to edit file
      return { type: 'edit', path: fileName, content: node.content || '' } as any;
    }
  },
  history: {
    description: 'Show command history',
    usage: 'history',
    execute: (args: string[], state: AppState) => {
      const historyList = state.history
        .map((item, idx) => `${(idx + 1).toString().padStart(4)}  ${item.command}`)
        .join('\n');
      
      return [{
        content: historyList || '(History is empty)',
        type: 'info',
        timestamp: new Date()
      }];
    }
  }
};

// ヘルパー関数
function parseCommand(input: string): { command: string, args: string[] } {
  const parts = input.trim().split(' ').filter(Boolean);
  const command = parts[0] || '';
  const args = parts.slice(1);
  return { command, args };
}

function getAbsolutePath(path: string, currentDir: string): string {
  if (path.startsWith('/')) {
    return normalizePath(path);
  }
  
  let base = currentDir;
  if (path === '.' || path === '') {
    return base;
  }
  
  if (path === '..') {
    return base.split('/').slice(0, -1).join('/') || '/';
  }
  
  if (path.startsWith('./')) {
    path = path.slice(2);
  }
  
  return normalizePath(`${base === '/' ? '' : base}/${path}`);
}

function normalizePath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const result: string[] = [];
  
  for (const part of parts) {
    if (part === '..') {
      result.pop();
    } else if (part !== '.') {
      result.push(part);
    }
  }
  
  return '/' + result.join('/');
}

function getNodeAtPath(path: string, filesystem: FileSystemNode, currentDir: string): FileSystemNode | null {
  const absPath = getAbsolutePath(path, currentDir);
  
  if (absPath === '/') {
    return filesystem;
  }
  
  const parts = absPath.split('/').filter(Boolean);
  let current: FileSystemNode | null = filesystem;
  
  for (const part of parts) {
    if (!current || !current.children || !current.children[part]) {
      return null;
    }
    current = current.children[part];
  }
  
  return current;
}

// 補完候補を見つける
function findCompletions(input: string, state: AppState): string[] {
  const parts = input.split(' ');
  const lastWord = parts[parts.length - 1];
  
  // コマンド補完
  if (parts.length === 1) {
    return Object.keys(commandDefinitions)
      .filter(cmd => cmd.startsWith(lastWord))
      .map(cmd => parts.slice(0, -1).concat(cmd).join(' '));
  }
  
  // ファイル/ディレクトリ補完
  const command = parts[0];
  if (['cd', 'cat', 'ls', 'edit'].includes(command)) {
    const pathToComplete = lastWord;
    
    let directoryToSearch = state.currentDirectory;
    let prefix = '';
    
    // パスの最後のコンポーネントを分離
    const lastSlashIndex = pathToComplete.lastIndexOf('/');
    if (lastSlashIndex !== -1) {
      directoryToSearch = getAbsolutePath(pathToComplete.substring(0, lastSlashIndex), state.currentDirectory);
      prefix = pathToComplete.substring(0, lastSlashIndex + 1);
    }
    
    const dirNode = getNodeAtPath(directoryToSearch, state.fileSystem, state.currentDirectory);
    if (dirNode && dirNode.type === 'directory' && dirNode.children) {
      const nameToMatch = pathToComplete.substring(lastSlashIndex + 1);
      const matches = Object.keys(dirNode.children)
        .filter(name => name.startsWith(nameToMatch))
        .map(name => {
          const completion = prefix + name;
          const node = dirNode.children![name];
          return parts.slice(0, -1).concat(completion + (node.type === 'directory' ? '/' : '')).join(' ');
        });
      
      return matches;
    }
  }
  
  return [];
}

// タイプの定義
interface Tab {
  id: string;
  title: string;
  lines: CommandOutput[];
  commandHistory: HistoryItem[];
  historyIndex: number;
  currentDirectory: string;
  commandInput: string;
}

interface AppState {
  currentTheme: string;
  tabs: Tab[];
  activeTab: string;
  fileSystem: FileSystemNode;
  currentDirectory: string;
  history: HistoryItem[];
  isEditing: boolean;
  editPath: string;
  editContent: string;
}

// Tabコンポーネント
const TabButton: React.FC<{
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
  onClose: () => void;
  theme: Theme;
}> = ({ tab, isActive, onClick, onClose, theme }) => {
  return (
    <div 
      className={clsx('tab-button')} 
      style={{
        backgroundColor: isActive ? theme.selection : 'transparent',
        color: theme.foreground,
        padding: '0.5rem 1rem',
        borderTopLeftRadius: '0.25rem',
        borderTopRightRadius: '0.25rem',
        marginRight: '0.25rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
        transition: 'background-color 0.2s',
      }}
      onClick={onClick}
    >
      <span>{tab.title}</span>
      {tab.id !== 'default' && (
        <span 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            marginLeft: '0.5rem',
            fontSize: '0.75rem',
            width: '1.25rem',
            height: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: isActive ? theme.accent : 'transparent',
            color: isActive ? theme.background : theme.foreground,
          }}
        >
          ×
        </span>
      )}
    </div>
  );
};

// エディタコンポーネント
const Editor: React.FC<{
  content: string;
  path: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  theme: Theme;
}> = ({ content, path, onSave, onCancel, theme }) => {
  const [value, setValue] = useState(content);
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '0.5rem',
      backgroundColor: theme.background,
      color: theme.foreground
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
        padding: '0.25rem 0.5rem',
        backgroundColor: theme.selection,
        borderRadius: '0.25rem'
      }}>
        <div>Editing: {path}</div>
        <div>
          <button
            style={{
              backgroundColor: theme.accent,
              color: theme.background,
              border: 'none',
              borderRadius: '0.25rem',
              padding: '0.25rem 0.5rem',
              marginRight: '0.5rem',
              cursor: 'pointer'
            }}
            onClick={() => onSave(value)}
          >
            Save
          </button>
          <button
            style={{
              backgroundColor: 'transparent',
              color: theme.foreground,
              border: `1px solid ${theme.foreground}`,
              borderRadius: '0.25rem',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer'
            }}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          flexGrow: 1,
          backgroundColor: theme.background,
          color: theme.foreground,
          border: `1px solid ${theme.selection}`,
          borderRadius: '0.25rem',
          padding: '0.5rem',
          fontFamily: theme.fontFamily,
          fontSize: '1rem',
          outline: 'none',
          resize: 'none'
        }}
        autoFocus
      />
    </div>
  );
};

// メインアプリケーション
export function App() {
  // アプリケーションの状態
  const [state, setState] = useState<AppState>({
    currentTheme: 'classic',
    tabs: [
      {
        id: 'default',
        title: 'Terminal',
        lines: [{ content: 'Welcome to ReactCUI! Type "help" to see available commands.', type: 'info', timestamp: new Date() }],
        commandHistory: [],
        historyIndex: -1,
        currentDirectory: '/home/user',
        commandInput: '',
      }
    ],
    activeTab: 'default',
    fileSystem: initialFileSystem,
    currentDirectory: '/home/user',
    history: [],
    isEditing: false,
    editPath: '',
    editContent: '',
  });
  
  const [input, setInput] = useState('');
  const [completions, setCompletions] = useState<string[]>([]);
  const [completionIndex, setCompletionIndex] = useState(-1);
  
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const activeTab = state.tabs.find(tab => tab.id === state.activeTab) || state.tabs[0];
  const theme = themes[state.currentTheme];
  
  // コマンド実行処理
  const executeCommand = (commandInput: string) => {
    if (!commandInput.trim()) return;
    
    const { command, args } = parseCommand(commandInput);
    
    // カスタムコマンド処理
    if (commandDefinitions[command as keyof typeof commandDefinitions]) {
      const result = commandDefinitions[command as keyof typeof commandDefinitions].execute(args, state);
      
      // 特殊コマンド結果の処理
      if (result === 'clear') {
        // 出力をクリア
        setState(prev => ({
          ...prev,
          tabs: prev.tabs.map(tab => 
            tab.id === prev.activeTab 
              ? { ...tab, lines: [] } 
              : tab
          )
        }));
        return;
      } else if (typeof result === 'object' && result !== null && 'type' in result) {
        // 特殊アクション（cd, theme）
        if (result.type === 'cd') {
          setState(prev => ({
            ...prev,
            currentDirectory: result.path,
            tabs: prev.tabs.map(tab => 
              tab.id === prev.activeTab 
                ? { 
                    ...tab, 
                    currentDirectory: result.path,
                    lines: [...tab.lines, { content: `$ ${commandInput}`, type: 'standard', timestamp: new Date() }]
                  } 
                : tab
            )
          }));
          return;
        } else if (result.type === 'theme') {
          setState(prev => ({
            ...prev,
            currentTheme: result.name,
            tabs: prev.tabs.map(tab => 
              tab.id === prev.activeTab 
                ? { 
                    ...tab, 
                    lines: [
                      ...tab.lines, 
                      { content: `$ ${commandInput}`, type: 'standard', timestamp: new Date() },
                      { content: `Theme changed to ${result.name}`, type: 'success', timestamp: new Date() }
                    ]
                  } 
                : tab
            )
          }));
          return;
        } else if (result.type === 'mkdir') {
          const dirName = result.name;
          const path = getAbsolutePath(dirName, state.currentDirectory);
          const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
          const newDirName = path.substring(path.lastIndexOf('/') + 1);
          
          const parentNode = getNodeAtPath(parentPath, state.fileSystem, '/');
          
          if (!parentNode || parentNode.type !== 'directory') {
            setState(prev => ({
              ...prev,
              tabs: prev.tabs.map(tab => 
                tab.id === prev.activeTab 
                  ? { 
                      ...tab, 
                      lines: [
                        ...tab.lines, 
                        { content: `$ ${commandInput}`, type: 'standard', timestamp: new Date() },
                        { content: `mkdir: cannot create directory '${dirName}': No such file or directory`, type: 'error', timestamp: new Date() }
                      ]
                    } 
                  : tab
              )
            }));
            return;
          }
          
          if (parentNode.children && parentNode.children[newDirName]) {
            setState(prev => ({
              ...prev,
              tabs: prev.tabs.map(tab => 
                tab.id === prev.activeTab 
                  ? { 
                      ...tab, 
                      lines: [
                        ...tab.lines, 
                        { content: `$ ${commandInput}`, type: 'standard', timestamp: new Date() },
                        { content: `mkdir: cannot create directory '${dirName}': File exists`, type: 'error', timestamp: new Date() }
                      ]
                    } 
                  : tab
              )
            }));
            return;
          }
          
          // 新しいディレクトリを作成
          setState(prev => {
            const newFileSystem = { ...prev.fileSystem };
            const parent = getNodeAtPath(parentPath, newFileSystem, '/');
            
            if (parent && parent.type === 'directory') {
              if (!parent.children) parent.children = {};
              parent.children[newDirName] = {
                name: newDirName,
                type: 'directory',
                children: {},
                metadata: {
                  createdAt: new Date(),
                  modifiedAt: new Date(),
                  permissions: 'rwxr-xr-x',
                  owner: 'user'
                }
              };
            }
            
            return {
              ...prev,
              fileSystem: newFileSystem,
              tabs: prev.tabs.map(tab => 
                tab.id === prev.activeTab 
                  ? { 
                      ...tab, 
                      lines: [
                        ...tab.lines, 
                        { content: `$ ${commandInput}`, type: 'standard', timestamp: new Date() }
                      ]
                    } 
                  : tab
              )
            };
          });
          return;
        } else if (result.type === 'touch') {
          const fileName = result.name;
          const path = getAbsolutePath(fileName, state.currentDirectory);
          const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
          const newFileName = path.substring(path.lastIndexOf('/') + 1);
          
          const parentNode = getNodeAtPath(parentPath, state.fileSystem, '/');
          
          if (!parentNode || parentNode.type !== 'directory') {
            setState(prev => ({
              ...prev,
              tabs: prev.tabs.map(tab => 
                tab.id === prev.activeTab 
                  ? { 
                      ...tab, 
                      lines: [
                        ...tab.lines, 
                        { content: `$ ${commandInput}`, type: 'standard', timestamp: new Date() },
                        { content: `touch: cannot touch '${fileName}': No such file or directory`, type: 'error', timestamp: new Date() }
                      ]
                    } 
                  : tab
              )
            }));
            return;
          }
          
          // 新しいファイルを作成
          setState(prev => {
            const newFileSystem = { ...prev.fileSystem };
            const parent = getNodeAtPath(parentPath, newFileSystem, '/');
            
            if (parent && parent.type === 'directory') {
              if (!parent.children) parent.children = {};
              if (!parent.children[newFileName]) {
                parent.children[newFileName] = {
                  name: newFileName,
                  type: 'file',
                  content: '',
                  metadata: {
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    permissions: 'rw-r--r--',
                    owner: 'user'
                  }
                };
              } else {
                // ファイルが既に存在する場合は、modifiedAtを更新
                if (parent.children[newFileName].metadata) {
                  parent.children[newFileName].metadata!.modifiedAt = new Date();
                }
              }
            }
            
            return {
              ...prev,
              fileSystem: newFileSystem,
              tabs: prev.tabs.map(tab => 
                tab.id === prev.activeTab 
                  ? { 
                      ...tab, 
                      lines: [
                        ...tab.lines, 
                        { content: `$ ${commandInput}`, type: 'standard', timestamp: new Date() }
                      ]
                    } 
                  : tab
              )
            };
          });
          return;
        } else if (result.type === 'edit') {
          setState(prev => ({
            ...prev,
            isEditing: true,
            editPath: result.path,
            editContent: result.content,
            tabs: prev.tabs.map(tab => 
              tab.id === prev.activeTab 
                ? { 
                    ...tab, 
                    lines: [
                      ...tab.lines, 
                      { content: `$ ${commandInput}`, type: 'standard', timestamp: new Date() }
                    ]
                  } 
                : tab
            )
          }));
          return;
        }
      }
      
      // 通常のコマンド結果を表示
      const historyItem: HistoryItem = {
        command: commandInput,
        output: Array.isArray(result) ? result : [],
        workingDirectory: state.currentDirectory,
        timestamp: new Date()
      };
      
      setState(prev => ({
        ...prev,
        history: [...prev.history, historyItem],
        tabs: prev.tabs.map(tab => 
          tab.id === prev.activeTab 
            ? { 
                ...tab, 
                lines: [
                  ...tab.lines, 
                  { content: `$ ${commandInput}`, type: 'standard', timestamp: new Date() },
                  ...Array.isArray(result) ? result : []
                ],
                commandHistory: [...tab.commandHistory, historyItem],
                historyIndex: -1
              } 
            : tab
        )
      }));
    } else {
      // 不明なコマンド
      const output: CommandOutput = {
        content: `command not found: ${command}`,
        type: 'error',
        timestamp: new Date()
      };
      
      setState(prev => ({
        ...prev,
        tabs: prev.tabs.map(tab => 
          tab.id === prev.activeTab 
            ? { 
                ...tab, 
                lines: [
                  ...tab.lines, 
                  { content: `$ ${commandInput}`, type: 'standard', timestamp: new Date() },
                  output
                ],
              } 
            : tab
        )
      }));
    }
  };
  
  // 入力処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
    setInput('');
    setCompletions([]);
    setCompletionIndex(-1);
  };
  
  // キー操作の処理
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 上下キーによるコマンド履歴のナビゲーション
    if (e.key === 'ArrowUp' && !completions.length) {
      e.preventDefault();
      const tab = state.tabs.find(t => t.id === state.activeTab);
      
      if (tab && tab.commandHistory.length > 0) {
        const newIndex = tab.historyIndex < tab.commandHistory.length - 1 
          ? tab.historyIndex + 1 
          : tab.historyIndex;
          
        if (newIndex >= 0 && newIndex < tab.commandHistory.length) {
          const historicalCommand = tab.commandHistory[tab.commandHistory.length - 1 - newIndex].command;
          setInput(historicalCommand);
          
          setState(prev => ({
            ...prev,
            tabs: prev.tabs.map(t => 
              t.id === state.activeTab 
                ? { ...t, historyIndex: newIndex } 
                : t
            )
          }));
        }
      }
    } else if (e.key === 'ArrowDown' && !completions.length) {
      e.preventDefault();
      const tab = state.tabs.find(t => t.id === state.activeTab);
      
      if (tab && tab.historyIndex > 0) {
        const newIndex = tab.historyIndex - 1;
        const historicalCommand = tab.commandHistory[tab.commandHistory.length - 1 - newIndex].command;
        setInput(historicalCommand);
        
        setState(prev => ({
          ...prev,
          tabs: prev.tabs.map(t => 
            t.id === state.activeTab 
              ? { ...t, historyIndex: newIndex } 
              : t
          )
        }));
      } else if (tab && tab.historyIndex === 0) {
        setInput('');
        setState(prev => ({
          ...prev,
          tabs: prev.tabs.map(t => 
            t.id === state.activeTab 
              ? { ...t, historyIndex: -1 } 
              : t
          )
        }));
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      if (completions.length > 0) {
        // すでに補完候補があれば選択
        const nextIndex = (completionIndex + 1) % completions.length;
        setCompletionIndex(nextIndex);
        setInput(completions[nextIndex]);
      } else {
        // 補完候補を検索
        const newCompletions = findCompletions(input, state);
        setCompletions(newCompletions);
        
        if (newCompletions.length === 1) {
          setInput(newCompletions[0]);
          setCompletionIndex(0);
        } else if (newCompletions.length > 1) {
          setCompletionIndex(0);
          setInput(newCompletions[0]);
        }
      }
    } else if (e.key === 'Escape') {
      setCompletions([]);
      setCompletionIndex(-1);
    } else {
      setCompletions([]);
      setCompletionIndex(-1);
    }
  };
  
  // 出力エリアを最下部にスクロール
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [activeTab.lines]);
  
  // 入力フィールドにフォーカスを当てる
  useEffect(() => {
    if (inputRef.current && !state.isEditing) {
      inputRef.current.focus();
    }
  }, [state.activeTab, state.isEditing]);
  
  // 新しいタブを作成
  const createNewTab = () => {
    const newTabId = `tab-${Date.now()}`;
    setState(prev => ({
      ...prev,
      tabs: [
        ...prev.tabs,
        {
          id: newTabId,
          title: `Terminal ${prev.tabs.length}`,
          lines: [{ content: 'Welcome to ReactCUI! Type "help" to see available commands.', type: 'info', timestamp: new Date() }],
          commandHistory: [],
          historyIndex: -1,
          currentDirectory: prev.currentDirectory,
          commandInput: '',
        }
      ],
      activeTab: newTabId
    }));
  };
  
  // タブを閉じる
  const closeTab = (tabId: string) => {
    setState(prev => {
      const tabIndex = prev.tabs.findIndex(tab => tab.id === tabId);
      
      if (tabIndex === -1 || prev.tabs.length <= 1) {
        return prev;
      }
      
      const newTabs = prev.tabs.filter(tab => tab.id !== tabId);
      let newActiveTab = prev.activeTab;
      
      if (tabId === prev.activeTab) {
        newActiveTab = newTabs[Math.min(tabIndex, newTabs.length - 1)].id;
      }
      
      return {
        ...prev,
        tabs: newTabs,
        activeTab: newActiveTab
      };
    });
  };
  
  // エディタ保存処理
  const handleSaveFile = (content: string) => {
    const path = getAbsolutePath(state.editPath, state.currentDirectory);
    const fileName = path.substring(path.lastIndexOf('/') + 1);
    const dirPath = path.substring(0, path.lastIndexOf('/')) || '/';
    
    setState(prev => {
      const newFileSystem = { ...prev.fileSystem };
      const dirNode = getNodeAtPath(dirPath, newFileSystem, '/');
      
      if (dirNode && dirNode.type === 'directory' && dirNode.children && dirNode.children[fileName]) {
        dirNode.children[fileName].content = content;
        dirNode.children[fileName].metadata!.modifiedAt = new Date();
      }
      
      return {
        ...prev,
        fileSystem: newFileSystem,
        isEditing: false,
        editPath: '',
        editContent: '',
        tabs: prev.tabs.map(tab => 
          tab.id === prev.activeTab 
            ? { 
                ...tab, 
                lines: [
                  ...tab.lines,
                  { content: `File saved: ${fileName}`, type: 'success', timestamp: new Date() }
                ]
              } 
            : tab
        )
      };
    });
  };
  
  // ターミナルのメインスタイル
  const terminalStyle: React.CSSProperties = {
    backgroundColor: theme.background,
    color: theme.foreground,
    fontFamily: theme.fontFamily,
    padding: '1rem',
    width: '800px',
    height: '500px',
    overflow: 'hidden',
    border: `2px solid ${theme.accent}`,
    borderRadius: '0.5rem',
    margin: '2rem auto',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    position: 'relative',
  };
  
  return (
    <div style={terminalStyle} onClick={() => inputRef.current?.focus()}>
      {/* ターミナルヘッダー */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{ 
            width: '0.75rem', 
            height: '0.75rem', 
            backgroundColor: '#ff5f56', 
            borderRadius: '50%', 
            marginRight: '0.5rem' 
          }} />
          <div style={{ 
            width: '0.75rem', 
            height: '0.75rem', 
            backgroundColor: '#ffbd2e', 
            borderRadius: '50%', 
            marginRight: '0.5rem' 
          }} />
          <div style={{ 
            width: '0.75rem', 
            height: '0.75rem', 
            backgroundColor: '#27c93f', 
            borderRadius: '50%' 
          }} />
          <span style={{ 
            marginLeft: '1rem', 
            fontSize: '0.9rem', 
            color: theme.accent 
          }}>
            {`${state.currentDirectory} - ${theme.name} Theme`}
          </span>
        </div>
        <div style={{ color: theme.prompt, fontSize: '0.8rem' }}>
          user@reactcui
        </div>
      </div>
      
      {/* タブバー */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${theme.selection}`,
        marginBottom: '0.5rem',
        position: 'relative',
      }}>
        {state.tabs.map(tab => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={tab.id === state.activeTab}
            onClick={() => setState(prev => ({ ...prev, activeTab: tab.id }))}
            onClose={() => closeTab(tab.id)}
            theme={theme}
          />
        ))}
        <div 
          style={{
            padding: '0.5rem',
            cursor: 'pointer',
            color: theme.accent,
          }}
          onClick={createNewTab}
        >
          +
        </div>
      </div>
      
      {/* エディタかターミナルのいずれかを表示 */}
      {state.isEditing ? (
        <Editor 
          content={state.editContent}
          path={state.editPath}
          onSave={handleSaveFile}
          onCancel={() => setState(prev => ({ 
            ...prev, 
            isEditing: false, 
            editPath: '', 
            editContent: '' 
          }))}
          theme={theme}
        />
      ) : (
        <>
          {/* ターミナル出力 */}
          <div 
            ref={outputRef}
            style={{
              flexGrow: 1,
              overflowY: 'auto',
              paddingRight: '0.5rem',
              wordBreak: 'break-word',
            }}
          >
            {activeTab.lines.map((line, idx) => {
              let style: React.CSSProperties = {};
              
              switch (line.type) {
                case 'error':
                  style = { color: theme.error };
                  break;
                case 'success':
                  style = { color: theme.success };
                  break;
                case 'info':
                  style = { color: theme.accent };
                  break;
                default:
                  style = line.content.startsWith('$') 
                    ? { color: theme.prompt } 
                    : { color: theme.foreground };
              }
              
              return (
                <div 
                  key={idx} 
                  style={{ 
                    ...style, 
                    fontFamily: theme.fontFamily,
                    paddingTop: '0.25rem',
                    paddingBottom: '0.25rem',
                  }}
                >
                  {line.content}
                </div>
              );
            })}
          </div>
          
          {/* 補完候補の表示 */}
          {completions.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '3rem',
              left: '2rem',
              backgroundColor: theme.selection,
              border: `1px solid ${theme.accent}`,
              borderRadius: '0.25rem',
              padding: '0.5rem',
              maxHeight: '10rem',
              overflowY: 'auto',
              zIndex: 10,
            }}>
              {completions.map((completion, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: idx === completionIndex ? theme.accent : 'transparent',
                    color: idx === completionIndex ? theme.background : theme.foreground,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setInput(completion);
                    setCompletions([]);
                    setCompletionIndex(-1);
                    inputRef.current?.focus();
                  }}
                >
                  {completion}
                </div>
              ))}
            </div>
          )}
          
          {/* 入力フォーム */}
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            borderTop: `1px solid ${theme.selection}`,
            paddingTop: '0.5rem',
            marginTop: '0.5rem',
          }}>
            <span style={{ color: theme.prompt }}>{state.currentDirectory} $</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                background: 'transparent',
                color: theme.foreground,
                border: 'none',
                outline: 'none',
                fontFamily: theme.fontFamily,
                fontSize: '1rem',
                flexGrow: 1,
              }}
              autoFocus
            />
          </form>
        </>
      )}
    </div>
  );
}

