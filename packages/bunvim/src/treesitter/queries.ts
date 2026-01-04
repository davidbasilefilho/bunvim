export const queries: Record<string, string> = {
	typescript: `
    (identifier) @variable
    (string) @string
    (number) @constant
    (comment) @comment
    (function_declaration (identifier) @function)
    (call_expression function: (identifier) @function)
    (class_declaration (type_identifier) @type)
    (interface_declaration (type_identifier) @type)
    (type_alias_declaration (type_identifier) @type)
    (this) @variable.builtin
    (super) @variable.builtin
    
    [
      "if"
      "else"
      "for"
      "while"
      "do"
      "switch"
      "case"
      "default"
      "break"
      "continue"
      "return"
      "try"
      "catch"
      "finally"
      "throw"
      "import"
      "export"
      "from"
      "const"
      "let"
      "var"
      "function"
      "class"
      "interface"
      "type"
      "enum"
      "extends"
      "implements"
      "new"
      "typeof"
      "instanceof"
      "in"
      "of"
      "as"
      "async"
      "await"
    ] @keyword
  `,
	javascript: `
    (identifier) @variable
    (string) @string
    (number) @constant
    (comment) @comment
    (function_declaration (identifier) @function)
    (call_expression function: (identifier) @function)
    (class_declaration (identifier) @type)
    (this) @variable.builtin
    (super) @variable.builtin

    [
      "if"
      "else"
      "for"
      "while"
      "do"
      "switch"
      "case"
      "default"
      "break"
      "continue"
      "return"
      "try"
      "catch"
      "finally"
      "throw"
      "import"
      "export"
      "from"
      "const"
      "let"
      "var"
      "function"
      "class"
      "extends"
      "new"
      "typeof"
      "instanceof"
      "in"
      "of"
      "async"
      "await"
    ] @keyword
  `,
	tsx: `
    (identifier) @variable
    (string) @string
    (number) @constant
    (comment) @comment
    (function_declaration (identifier) @function)
    (call_expression function: (identifier) @function)
    (class_declaration (type_identifier) @type)
    (interface_declaration (type_identifier) @type)
    (type_alias_declaration (type_identifier) @type)
    (jsx_opening_element (identifier) @type)
    (jsx_closing_element (identifier) @type)
    (jsx_attribute (property_identifier) @variable)
    (this) @variable.builtin
    (super) @variable.builtin

    [
      "if"
      "else"
      "for"
      "while"
      "do"
      "switch"
      "case"
      "default"
      "break"
      "continue"
      "return"
      "try"
      "catch"
      "finally"
      "throw"
      "import"
      "export"
      "from"
      "const"
      "let"
      "var"
      "function"
      "class"
      "interface"
      "type"
      "enum"
      "extends"
      "implements"
      "new"
      "typeof"
      "instanceof"
      "in"
      "of"
      "as"
      "async"
      "await"
    ] @keyword
  `,
	json: `
    (string) @string
    (number) @constant
    (pair key: (string) @variable)
  `,
};
