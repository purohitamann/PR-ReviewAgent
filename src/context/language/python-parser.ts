import { AbstractParser, EnclosingContext } from "../../constants";
import * as parser from "python-ast"; // A library to parse Python AST
import { walk } from "estree-walker"; // For traversing the Python AST
// AST stands for Abstract Syntax Tree. It is a tree representation of the abstract syntactic structure of source code. Each node in the tree denotes a construct occurring in the source code.
export class PythonParser implements AbstractParser {
  // Finds the largest enclosing context for the given line range
  findEnclosingContext(
    file: string,
    lineStart: number,
    lineEnd: number
  ): EnclosingContext {
    let largestEnclosingContext = null;
    let largestSize = 0;

    // Parse the Python file into an AST
    const ast = parser.parse(file);

    // Traverse the AST
    walk(ast as Node, {
      enter(node: any) {
        if (
          (node.type === "FunctionDef" ||
            node.type === "ClassDef" ||
            node.type === "Module") &&
          node.loc
        ) {
          const { start, end } = node.loc;
          if (start.line <= lineStart && lineEnd <= end.line) {
            const size = end.line - start.line;
            if (size > largestSize) {
              largestSize = size;
              largestEnclosingContext = node;
            }
          }
        }
      },
    });

    return {
      enclosingContext: largestEnclosingContext,
      contextType: largestEnclosingContext ? largestEnclosingContext.type : null,
    } as EnclosingContext;
  }

  // Validates the Python file syntax
  dryRun(file: string): { valid: boolean; error: string } {
    try {
      // Parse the Python file to check for syntax errors
      parser.parse(file);
      return { valid: true, error: "" };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}
