
export type CellType = 'code' | 'markdown' | 'raw';

export interface NotebookOutput {
  output_type: 'stream' | 'display_data' | 'execute_result' | 'error';
  name?: string;
  text?: string | string[];
  data?: {
    [key: string]: string | string[];
  };
  execution_count?: number;
  ename?: string;
  evalue?: string;
  traceback?: string[];
}

export interface NotebookCell {
  cell_type: CellType;
  metadata: Record<string, any>;
  source: string | string[];
  outputs?: NotebookOutput[];
  execution_count?: number | null;
}

export interface NotebookMetadata {
  kernelspec?: {
    display_name: string;
    language: string;
    name: string;
  };
  language_info?: {
    codemirror_mode?: any;
    file_extension?: string;
    mimetype?: string;
    name: string;
    nbconvert_exporter?: string;
    pygments_lexer?: string;
    version?: string;
  };
  [key: string]: any;
}

export interface NotebookData {
  cells: NotebookCell[];
  metadata: NotebookMetadata;
  nbformat: number;
  nbformat_minor: number;
}

export interface StoredNotebook {
  id: string;
  name: string;
  data: NotebookData;
  createdAt: number;
  size: number;
}
