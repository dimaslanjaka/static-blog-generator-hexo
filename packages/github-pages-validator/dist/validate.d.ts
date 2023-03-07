export interface validateFileOpt {
    /**
     * validate file size
     */
    size: boolean;
    /**
     * validate html body is not empty
     */
    body: boolean;
}
/**
 * validate file
 * @param file file absolute path
 * @param as alias name
 */
export declare function validateFile(file: string, as: string, options?: validateFileOpt): void;
/**
 * process exit
 * @param code exit code. 1=exit failure, 0=exit success, default=1
 */
export declare function exit(code?: number): void;
